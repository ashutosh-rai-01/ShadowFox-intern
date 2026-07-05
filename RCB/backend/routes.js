import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, Cheer, Ticket, Order } from "./models.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "rcb_play_bold_secret_key";

// JWT Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Token Required" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or Expired Token" });
    req.user = user;
    next();
  });
}

// ---------------- AUTH ROUTES ----------------

router.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, favoritePlayer } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fanCardNumber = "RCB-" + Math.floor(100000 + Math.random() * 900000);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      favoritePlayer: favoritePlayer || "Virat Kohli",
      tier: "Rookie",
      fanCardNumber
    });

    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        favoritePlayer: newUser.favoritePlayer,
        tier: newUser.tier,
        fanCardNumber: newUser.fanCardNumber
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoritePlayer: user.favoritePlayer,
        tier: user.tier,
        fanCardNumber: user.fanCardNumber
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      favoritePlayer: user.favoritePlayer,
      tier: user.tier,
      fanCardNumber: user.fanCardNumber
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication failed" });
  }
});

router.put("/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { favoritePlayer } = req.body;
    const updated = await User.findByIdAndUpdate(req.user.id, { favoritePlayer }, { new: true });
    res.json({
      id: updated._id,
      username: updated.username,
      email: updated.email,
      favoritePlayer: updated.favoritePlayer,
      tier: updated.tier,
      fanCardNumber: updated.fanCardNumber
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

// ---------------- CHEERS ROUTES ----------------

router.get("/cheers", async (req, res) => {
  try {
    const cheers = await Cheer.find({});
    // Sort by timestamp desc
    cheers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(cheers);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch cheers" });
  }
});

router.post("/cheers", async (req, res) => {
  try {
    const { username, content, playerTag } = req.body;
    if (!username || !content) {
      return res.status(400).json({ message: "Username and content are required" });
    }
    const newCheer = await Cheer.create({
      username,
      content,
      playerTag: playerTag || "General",
      likes: 0
    });
    res.status(201).json(newCheer);
  } catch (error) {
    res.status(500).json({ message: "Could not create cheer" });
  }
});

router.post("/cheers/:id/like", async (req, res) => {
  try {
    const cheer = await Cheer.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!cheer) return res.status(404).json({ message: "Cheer not found" });
    res.json(cheer);
  } catch (error) {
    res.status(500).json({ message: "Could not like cheer" });
  }
});

// ---------------- LIVE MATCH & FIXTURES ----------------

// Global live match state (will be updated by the simulator in server.js)
export const liveMatch = {
  status: "MATCH OVER",
  overs: "18.0",
  target: 156,
  result: "RCB won by 5 wickets (12 balls left)",
  teamA: {
    name: "RCB",
    logo: "🔴⚫",
    score: "161/5",
    batsmen: [
      { name: "Virat Kohli", runs: 72, balls: 48, fours: 6, sixes: 3, isStriker: true },
      { name: "Dinesh Karthik", runs: 28, balls: 14, fours: 3, sixes: 1, isStriker: false }
    ]
  },
  teamB: {
    name: "GT",
    logo: "⚡",
    score: "155/8 (20.0)",
    bowler: { name: "Rashid Khan", overs: "4.0", runs: 28, wickets: 2 }
  },
  commentaries: [
    "18.0: Rashid Khan to Dinesh Karthik, FOUR runs, sweeps it away past square leg for a boundary! RCB wins the IPL Final by 5 wickets with 12 balls left! The crowd is absolutely ecstatic! Ee Sala Cup Namde! 🏆🔴⚫",
    "17.5: Rashid to Karthik, 1 run, pushes it down to long-on.",
    "17.4: Rashid to Kohli, 1 run, tucked away to deep midwicket.",
    "17.3: Rashid to Kohli, SIX runs, outstanding! Steps down the pitch and launches it straight over Rashid's head!",
    "17.2: Rashid to Karthik, 1 run, steered to third man.",
    "17.1: Rashid to Kohli, 1 run, driven to sweeper cover.",
    "16.6: Mohit to Kohli, 1 run, worked to deep square leg to end the over."
  ]
};

const fixtures = [
  { id: "match_101", date: "June 22, 2026", time: "7:30 PM", venue: "M. Chinnaswamy Stadium, Bengaluru", opponent: "Mumbai Indians (MI)", priceRange: "₹800 - ₹5500" },
  { id: "match_102", date: "June 26, 2026", time: "7:30 PM", venue: "M. Chinnaswamy Stadium, Bengaluru", opponent: "Kolkata Knight Riders (KKR)", priceRange: "₹900 - ₹6000" },
  { id: "match_103", date: "June 30, 2026", time: "7:30 PM", venue: "Wankhede Stadium, Mumbai", opponent: "Mumbai Indians (MI)", priceRange: "Away Match" },
  { id: "match_104", date: "July 04, 2026", time: "7:30 PM", venue: "M. Chinnaswamy Stadium, Bengaluru", opponent: "Rajasthan Royals (RR)", priceRange: "₹800 - ₹5000" }
];

router.get("/matches/live", (req, res) => {
  res.json(liveMatch);
});

router.get("/matches/fixtures", (req, res) => {
  res.json(fixtures);
});

// ---------------- TICKETS BOOKING ----------------

router.get("/tickets/reserved/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const bookings = await Ticket.find({ matchId });
    const reservedSeats = bookings.reduce((acc, curr) => {
      return acc.concat(curr.seatNumbers);
    }, []);
    res.json({ reservedSeats });
  } catch (error) {
    res.status(500).json({ message: "Could not get reserved seats" });
  }
});

router.post("/tickets/book", authenticateToken, async (req, res) => {
  try {
    const { matchId, seatNumbers, stand, totalPrice } = req.body;
    if (!matchId || !seatNumbers || seatNumbers.length === 0 || !stand || !totalPrice) {
      return res.status(400).json({ message: "Missing required booking details" });
    }

    // Verify seats aren't already booked
    const existingBookings = await Ticket.find({ matchId });
    const reservedSeats = existingBookings.reduce((acc, curr) => acc.concat(curr.seatNumbers), []);
    const overlaps = seatNumbers.filter(seat => reservedSeats.includes(seat));
    if (overlaps.length > 0) {
      return res.status(400).json({ message: `Seats already booked: ${overlaps.join(", ")}` });
    }

    const newTicket = await Ticket.create({
      userId: req.user.id,
      matchId,
      seatNumbers,
      stand,
      totalPrice,
      bookingDate: new Date()
    });

    // Award loyalty points / upgrade tier if they book tickets
    const user = await User.findById(req.user.id);
    if (user && user.tier === "Rookie") {
      await User.findByIdAndUpdate(req.user.id, { tier: "Pro" });
    }

    res.status(201).json({
      message: "Ticket booked successfully!",
      ticket: newTicket
    });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
});

router.get("/tickets/my-tickets", authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id });
    // Join with fixtures details
    const detailedTickets = tickets.map(t => {
      const fix = fixtures.find(f => f.id === t.matchId) || {
        opponent: "Opponent Team",
        venue: "M. Chinnaswamy Stadium, Bengaluru",
        date: "TBD",
        time: "7:30 PM"
      };
      return {
        _id: t._id,
        seatNumbers: t.seatNumbers,
        stand: t.stand,
        totalPrice: t.totalPrice,
        bookingDate: t.bookingDate,
        fixture: fix
      };
    });
    res.json(detailedTickets);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch user tickets" });
  }
});

// ---------------- MERCHANDISE SHOP ----------------

const shopProducts = [
  { id: "prod_1", name: "RCB Official Match Jersey", price: 2499, image: "/RCBJERSEY.png", desc: "Show your pride with the official match-day jersey. Engineered with rapid-dry technology, breathability, and the iconic Red & Gold accents." },
  { id: "prod_2", name: "Play Bold Player Cap", price: 799, image: "/RCBcap.png", desc: "A classic adjustable sport cap with embroidered golden RCB crest. Engineered ventilation, breathable crown, and solid curved visor." },
  { id: "prod_3", name: "RCB Sports Waist Bag", price: 1199, image: "/RCBwaistbag.png", desc: "Sleek and water-resistant waist bag featuring multiple zip compartments, adjustable strap, and the golden RCB crest." },
  { id: "prod_4", name: "RCB Pro Trackpant", price: 1899, image: "/]Trackpant.png", desc: "High-performance training trackpants. Lightweight, flexible, quick-dry fabric featuring gold trim details and the official emblem." }
];

router.get("/shop/products", (req, res) => {
  res.json(shopProducts);
});

router.post("/shop/checkout", authenticateToken, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    if (!items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: "Cart items and total price are required" });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      totalPrice,
      orderDate: new Date()
    });

    // Upgrade tier based on spend
    const user = await User.findById(req.user.id);
    if (user) {
      let newTier = user.tier;
      if (totalPrice >= 5000 && user.tier !== "Superfan") {
        newTier = "Superfan";
      } else if (user.tier === "Rookie") {
        newTier = "Pro";
      }
      await User.findByIdAndUpdate(req.user.id, { tier: newTier });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
});

router.get("/shop/my-orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch user orders" });
  }
});

export default router;
