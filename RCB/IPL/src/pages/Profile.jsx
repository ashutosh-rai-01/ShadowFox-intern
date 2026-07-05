import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import { FaUserCircle, FaTicketAlt, FaShoppingBag, FaSignOutAlt, FaRedo, FaCheck } from "react-icons/fa";
import rcbLogo from "../assets/rcblogo.png";

function Profile({ user, logout, token }) {
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favPlayer, setFavPlayer] = useState(user?.favoritePlayer || "Virat Kohli");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      // Fetch tickets
      fetch(`${API_BASE}/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setTickets(data))
        .catch(() => {});

      // Fetch orders
      fetch(`${API_BASE}/shop/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(() => {});
    }
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ favoritePlayer: favPlayer })
      });
      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch {
      alert("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
        <h2>Access Denied</h2>
        <p style={{ color: "var(--text-secondary)", margin: "15px 0" }}>
          You must be logged in to view your profile dashboard.
        </p>
      </div>
    );
  }

  // Determine tier gradient/badge
  const getTierStyles = (tier) => {
    switch (tier) {
      case "Superfan":
        return {
          background: "linear-gradient(135deg, #111 0%, #222 50%, #e2b13c 100%)",
          borderColor: "var(--accent-gold)",
          colorBadge: "🏆 Superfan"
        };
      case "Pro":
        return {
          background: "linear-gradient(135deg, #151515 0%, #302008 100%)",
          borderColor: "var(--accent-gold)",
          colorBadge: "🟡 Pro Fan"
        };
      default:
        return {
          background: "linear-gradient(135deg, #151515 0%, #3a0d10 100%)",
          borderColor: "var(--primary-red)",
          colorBadge: "🔴 Rookie"
        };
    }
  };

  const tierStyles = getTierStyles(user.tier);

  return (
    <div className="container">
      <h2 className="section-title">
        FAN <span>DASHBOARD</span>
      </h2>

      <div className="profile-grid">
        {/* Left Column: Fan Card & Details */}
        <div className="profile-card-display">
          <div className="profile-main-card">
            <h3 style={{ color: "var(--accent-gold)", fontWeight: 800, borderBottom: "1px solid var(--border-dark)", paddingBottom: "10px", marginBottom: "20px" }}>
              MEMBER CARD
            </h3>

            {/* Custom styled member card */}
            <div className="digital-fan-card" style={{
              background: tierStyles.background,
              borderColor: tierStyles.borderColor,
              marginBottom: "25px"
            }}>
              <span className="fan-card-tier-tag" style={{
                background: user.tier === "Superfan" ? "var(--accent-gold)" : user.tier === "Pro" ? "var(--accent-gold)" : "var(--primary-red)",
                color: user.tier === "Rookie" ? "white" : "black"
              }}>{user.tier}</span>

              <img src={rcbLogo} alt="RCB Logo" style={{ position: "absolute", width: "90px", opacity: "0.15", right: "-10px", bottom: "-10px", pointerEvents: "none" }} />

              <div className="fan-card-avatar" style={{ borderColor: tierStyles.borderColor }}>
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div className="fan-card-name">{user.username}</div>
              <div className="fan-card-id">{user.fanCardNumber}</div>

              <div className="fan-card-stats" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="fan-card-stat-label">Member Tier</div>
                  <div className="fan-card-stat-val" style={{ color: "var(--accent-gold)" }}>{tierStyles.colorBadge}</div>
                </div>
                <div>
                  <div className="fan-card-stat-label">Fav Player</div>
                  <div className="fan-card-stat-val">{user.favoritePlayer}</div>
                </div>
              </div>

              {/* Mock QR Code for entry */}
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                <div style={{ background: "white", padding: "8px", borderRadius: "8px", width: "90px", height: "90px" }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=RCB-MEMBER-${user.fanCardNumber}`}
                    alt="Digital Fan Card Entry QR"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginTop: "6px" }}>
                Scan at Chinnaswamy gates for fan club entry
              </span>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Change Favorite Player</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px" }}>
                  <select value={favPlayer} onChange={(e) => setFavPlayer(e.target.value)}>
                    <option value="Virat Kohli">Virat Kohli</option>
                    <option value="Faf du Plessis">Faf du Plessis</option>
                    <option value="Glenn Maxwell">Glenn Maxwell</option>
                    <option value="Mohammed Siraj">Mohammed Siraj</option>
                    <option value="Dinesh Karthik">Dinesh Karthik</option>
                  </select>
                  <button className="btn-secondary" style={{ padding: "0 15px" }} type="submit" disabled={isUpdating}>
                    {updateSuccess ? <FaCheck style={{ color: "green" }} /> : <FaRedo />}
                  </button>
                </div>
              </div>
            </form>

            <button 
              className="btn-primary" 
              style={{ width: "100%", marginTop: "20px", background: "#222", border: "1px solid #444", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              onClick={logout}
            >
              <FaSignOutAlt /> Sign Out Account
            </button>
          </div>
        </div>

        {/* Right Column: Tickets & Orders list */}
        <div className="profile-orders-tickets">
          {/* Tickets Section */}
          <div className="profile-section-box">
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-dark)", paddingBottom: "12px", marginBottom: "20px" }}>
              <FaTicketAlt style={{ color: "var(--accent-gold)" }} /> BOOKED MATCH PASSES ({tickets.length})
            </h3>
            
            {tickets.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                You have not booked any match tickets yet. Head over to the **Tickets** page to book!
              </p>
            ) : (
              tickets.map((t) => (
                <div className="ticket-pass-card" key={t._id}>
                  <img src={rcbLogo} alt="RCB Watermark" style={{ position: "absolute", width: "60px", opacity: "0.08", left: "40%", top: "25%", pointerEvents: "none" }} />
                  <div>
                    <span style={{
                      background: "var(--primary-red)",
                      color: "white",
                      padding: "2px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      borderRadius: "3px",
                      textTransform: "uppercase"
                    }}>
                      CHINNASWAMY PASS
                    </span>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: 800, marginTop: "8px" }}>RCB VS {t.fixture.opponent}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Date: {t.fixture.date} @ {t.fixture.time}
                    </p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--accent-gold)", marginTop: "6px" }}>
                      Stand: {t.stand} | Seats: {t.seatNumbers.join(", ")}
                    </p>
                  </div>

                  {/* QR code representing ticket pass */}
                  <div className="ticket-pass-qr" title="Digital Match Pass Entry QR">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=RCB-TICKET-${t._id}`} 
                      alt="Match entry QR Code" 
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Orders Section */}
          <div className="profile-section-box">
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-dark)", paddingBottom: "12px", marginBottom: "20px" }}>
              <FaShoppingBag style={{ color: "var(--accent-gold)" }} /> ORDER HISTORY ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                No shopping orders found. Check the official **Shop** for awesome gears!
              </p>
            ) : (
              orders.map((ord) => (
                <div className="order-history-card" key={ord._id}>
                  <div className="order-header-info">
                    <span>Order: #{ord._id.substring(0, 10).toUpperCase()}</span>
                    <span>Date: {new Date(ord.orderDate).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ord.items.map((item, idx) => (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }} key={idx}>
                        <span style={{ color: "var(--text-primary)" }}>
                          {item.name} <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>x{item.quantity}</span>
                        </span>
                        <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-dark)", marginTop: "12px", paddingTop: "8px", fontWeight: "800", fontSize: "1rem" }}>
                    <span>Total Price:</span>
                    <span style={{ color: "var(--accent-gold)" }}>₹{ord.totalPrice}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
