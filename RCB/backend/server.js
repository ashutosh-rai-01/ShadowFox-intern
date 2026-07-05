import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router, { liveMatch } from "./routes.js";
import { enableMockMode } from "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", router);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "RCB Fan Portal MERN API is running!" });
});

// Database connection logic
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rcb_db";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("🟢 Connected to MongoDB database successfully.");
  })
  .catch((err) => {
    console.warn("🔴 MongoDB connection failed:", err.message);
    enableMockMode();
  });

// ---------------- LIVE MATCH SIMULATOR ----------------
let currentOver = 15;
let currentBall = 0;
let rcbRuns = 162;
let rcbWickets = 4;
let target = 198;

const batsmenList = [
  { name: "Virat Kohli", runs: 78, balls: 45, fours: 5, sixes: 4, isStriker: true },
  { name: "Dinesh Karthik", runs: 12, balls: 6, fours: 1, sixes: 1, isStriker: false },
  { name: "Glenn Maxwell", runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false },
  { name: "Faf du Plessis", runs: 45, balls: 28, fours: 4, sixes: 2, isStriker: false }
];

const bowlersList = [
  { name: "Rashid Khan", overs: "3.0", runs: 28, wickets: 2 },
  { name: "Mohit Sharma", overs: "3.0", runs: 25, wickets: 1 },
  { name: "Umesh Yadav", overs: "4.0", runs: 34, wickets: 1 }
];

const commentaryTemplates = {
  dot: [
    "No run, defended solidly back to the bowler.",
    "Beaten! Good length ball outside off, swings away late.",
    "Dot ball. Tries to guide it to third man but misses.",
    "Slower ball, guided straight to point. Good fielding."
  ],
  one: [
    "1 run, pushed to long-on for a single.",
    "Single, tucked away off the hips to deep square leg.",
    "1 run, steered down to third man.",
    "1 run, tapped softly in front of cover and they scamper for a quick single."
  ],
  two: [
    "2 runs, whipped off the pads to deep midwicket, excellent running between the wickets!",
    "Two runs, driven through extra cover, outfield is slow, cut off near the boundary.",
    "2 runs, punched to deep backward point."
  ],
  four: [
    "FOUR runs! Classy! Overpitched, Kohli crunches it through the covers for a boundary!",
    "FOUR! Short and pulled away commandingly through square leg, no chance for the deep fielder!",
    "FOUR! Inside edge, trickles past the wicketkeeper and races to the fine leg boundary. Lucky but effective!"
  ],
  six: [
    "SIX runs! Massive! Slot ball, cleared front leg and launched it 95 meters over long-on!",
    "SIX! Swept away dynamically! Flat six over deep square leg, what a shot!",
    "SIX! Back of a length, Kohli executes the short arm jab and sends it into the stands! Incredible atmosphere!"
  ],
  wicket: [
    "OUT! Wicket! Up in the air and taken! Inside edge onto the pads, balloons up to point. Fielder makes no mistake!",
    "OUT! Clean bowled! Yorker length on middle stump, batsman is beaten for pace, stumps shattered!",
    "OUT! Caught! Tries to clear the boundary at long-off but doesn't get the distance. Caught right on the rope!"
  ]
};

function runMatchSimulator() {
  setInterval(() => {
    // If RCB has won or lost, freeze or reset
    if (rcbRuns >= target) {
      liveMatch.status = "RCB WON";
      liveMatch.result = `RCB won by ${10 - rcbWickets} wickets!`;
      if (!liveMatch.commentaries[0].includes("MATCH OVER")) {
        liveMatch.commentaries.unshift(`🏆 MATCH OVER: RCB chase down the target of ${target} in ${currentOver}.${currentBall} overs! Ee Sala Cup Namde! 🎉🔴🟡`);
      }
      // Reset after 30 seconds
      setTimeout(resetMatchState, 30000);
      return;
    }
    if (rcbWickets >= 10 || (currentOver >= 20 && rcbRuns < target)) {
      liveMatch.status = "MATCH OVER";
      liveMatch.result = rcbRuns === target - 1 ? "Match Tied!" : `GT won by ${target - 1 - rcbRuns} runs`;
      if (!liveMatch.commentaries[0].includes("MATCH OVER")) {
        liveMatch.commentaries.unshift(`💔 MATCH OVER: GT win! RCB finish at ${rcbRuns}/${rcbWickets} in 20.0 overs.`);
      }
      setTimeout(resetMatchState, 30000);
      return;
    }

    // Simulate next ball
    currentBall++;
    if (currentBall > 6) {
      currentBall = 1;
      currentOver++;
    }

    // Determine outcome probability
    const rand = Math.random();
    let outcome = "dot";
    let runsAdded = 0;
    let wicketFallen = false;

    if (rand < 0.22) {
      outcome = "dot";
      runsAdded = 0;
    } else if (rand < 0.58) {
      outcome = "one";
      runsAdded = 1;
    } else if (rand < 0.70) {
      outcome = "two";
      runsAdded = 2;
    } else if (rand < 0.82) {
      outcome = "four";
      runsAdded = 4;
    } else if (rand < 0.93) {
      outcome = "six";
      runsAdded = 6;
    } else {
      outcome = "wicket";
      wicketFallen = true;
    }

    // Update state
    if (wicketFallen) {
      rcbWickets++;
    } else {
      rcbRuns += runsAdded;
    }

    // Select active batsman (striker)
    let striker = liveMatch.teamA.batsmen.find(b => b.isStriker);
    let nonStriker = liveMatch.teamA.batsmen.find(b => !b.isStriker);

    if (!striker) {
      const activeNames = liveMatch.teamA.batsmen.map(b => b.name);
      const nextBatsman = batsmenList.find(b => !activeNames.includes(b.name));
      if (nextBatsman) {
        striker = { name: nextBatsman.name, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true };
        liveMatch.teamA.batsmen.push(striker);
      }
    }

    if (striker) {
      striker.balls++;
      if (wicketFallen) {
        liveMatch.commentaries.unshift(`${currentOver}.${currentBall}: ${liveMatch.teamB.bowler.name} to ${striker.name}, ${commentaryTemplates.wicket[Math.floor(Math.random() * commentaryTemplates.wicket.length)]}`);
        liveMatch.teamA.batsmen = liveMatch.teamA.batsmen.filter(b => b.name !== striker.name);
        liveMatch.teamB.bowler.wickets++;
        
        // Bring in next batsman
        const activeNames = liveMatch.teamA.batsmen.map(b => b.name);
        const nextBatsman = batsmenList.find(b => !activeNames.includes(b.name));
        if (nextBatsman) {
          const newStriker = { name: nextBatsman.name, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true };
          liveMatch.teamA.batsmen.push(newStriker);
        }
      } else {
        striker.runs += runsAdded;
        if (runsAdded === 4) striker.fours++;
        if (runsAdded === 6) striker.sixes++;

        // Add commentary
        const templates = commentaryTemplates[outcome];
        const template = templates[Math.floor(Math.random() * templates.length)];
        liveMatch.commentaries.unshift(`${currentOver}.${currentBall}: ${liveMatch.teamB.bowler.name} to ${striker.name}, ${runsAdded === 0 ? "no run" : runsAdded === 4 ? "FOUR" : runsAdded === 6 ? "SIX" : runsAdded + " runs"}, ${template}`);

        // Rotate strike on odd runs
        if (runsAdded === 1 || runsAdded === 3) {
          striker.isStriker = false;
          if (nonStriker) nonStriker.isStriker = true;
        }
      }
    }

    // Bowler stats update
    const currentBowler = liveMatch.teamB.bowler;
    currentBowler.runs += runsAdded;
    const bOvers = parseFloat(currentBowler.overs);
    let bBalls = Math.round((bOvers % 1) * 10) + 1;
    let bOverCount = Math.floor(bOvers);
    if (bBalls >= 6) {
      bOverCount++;
      bBalls = 0;
      // Change bowler
      const currentBowlerIndex = bowlersList.findIndex(b => b.name === currentBowler.name);
      const nextBowler = bowlersList[(currentBowlerIndex + 1) % bowlersList.length];
      liveMatch.teamB.bowler = { name: nextBowler.name, overs: "0.0", runs: 0, wickets: 0 };
    } else {
      currentBowler.overs = `${bOverCount}.${bBalls}`;
    }

    // Rotate strike at the end of the over
    if (currentBall === 6) {
      liveMatch.teamA.batsmen.forEach(b => {
        b.isStriker = !b.isStriker;
      });
    }

    // Update global match strings
    liveMatch.overs = `${currentOver}.${currentBall}`;
    liveMatch.teamA.score = `${rcbRuns}/${rcbWickets}`;
    liveMatch.status = "LIVE MATCH";

    // Limit commentary size
    if (liveMatch.commentaries.length > 25) {
      liveMatch.commentaries = liveMatch.commentaries.slice(0, 25);
    }
  }, 12000);
}

function resetMatchState() {
  currentOver = 15;
  currentBall = 0;
  rcbRuns = 162;
  rcbWickets = 4;
  liveMatch.overs = "15.0";
  liveMatch.teamA.score = "162/4";
  liveMatch.status = "LIVE MATCH";
  liveMatch.result = "";
  liveMatch.teamA.batsmen = [
    { name: "Virat Kohli", runs: 78, balls: 45, fours: 5, sixes: 4, isStriker: true },
    { name: "Dinesh Karthik", runs: 12, balls: 6, fours: 1, sixes: 1, isStriker: false }
  ];
  liveMatch.teamB.bowler = { name: "Rashid Khan", overs: "3.0", runs: 28, wickets: 2 };
  liveMatch.commentaries = [
    "15.0: Over summary - 11 runs off the over, RCB score 162/4, target 198.",
    "14.6: Mohit to Kohli, no run, beaten by the pace, Kohli tries to pull but misses."
  ];
}

// Start Simulator
runMatchSimulator();

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
