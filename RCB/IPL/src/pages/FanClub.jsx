import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import { FaHeart, FaPaperPlane } from "react-icons/fa";
import rcbLogo from "../assets/rcblogo.png";

function FanClub({ user, openAuth, token }) {
  const [cheers, setCheers] = useState([]);
  const [content, setContent] = useState("");
  const [playerTag, setPlayerTag] = useState("General");
  const [guestName, setGuestName] = useState("");
  const [cheerListError, setCheerListError] = useState("");

  const fetchCheers = () => {
    fetch(`${API_BASE}/cheers`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setCheers(data))
      .catch(() => setCheerListError("Could not connect to fan feed"));
  };

  useEffect(() => {
    fetchCheers();
    const interval = setInterval(fetchCheers, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePostCheer = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const posterName = user ? user.username : guestName.trim() || "GuestFan";

    try {
      const res = await fetch(`${API_BASE}/cheers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: posterName,
          content,
          playerTag
        })
      });

      if (!res.ok) throw new Error();
      setContent("");
      if (!user) setGuestName("");
      fetchCheers();
    } catch {
      alert("Failed to submit cheer");
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cheers/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      // Optimistic update
      setCheers(prev => prev.map(c => c._id === id ? { ...c, likes: c.likes + 1 } : c));
    } catch {
      alert("Failed to like cheer");
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="container">
      <h2 className="section-title">
        FAN <span>ZONE</span>
      </h2>

      <div className="fanclub-layout">
        {/* Left Column: Cheer Board */}
        <div>
          <form className="fc-cheer-form" onSubmit={handlePostCheer}>
            <h3 style={{ marginBottom: "15px", color: "var(--accent-gold)", fontWeight: 800 }}>
              POST A CHEER FOR RCB
            </h3>

            {!user && (
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  placeholder="Enter name (e.g. KohliFanatic)" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  maxLength={20}
                />
              </div>
            )}

            <div className="form-group">
              <label>Message</label>
              <textarea 
                placeholder="Ex: Ee Sala Cup Namde! Play Bold boys! 🏆🔴⚫" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
                maxLength={180}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "15px", alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tag a Player</label>
                <select value={playerTag} onChange={(e) => setPlayerTag(e.target.value)}>
                  <option value="General">General / Team</option>
                  <option value="Rajat Patidar">Rajat Patidar (Captain)</option>
                  <option value="Virat Kohli">Virat Kohli</option>
                  <option value="Devdutt Padikkal">Devdutt Padikkal</option>
                  <option value="Jacob Bethell">Jacob Bethell</option>


                  <option value="Phil Salt">Phil Salt</option>
                  <option value="Jitesh Sharma">Jitesh Sharma</option>
                  <option value="Jordan Cox">Jordan Cox</option>


                  <option value="Tim David">Tim David</option>
                  <option value="Krunal Pandya">Krunal Pandya</option>
                  <option value="Romario Shepherd">Romario Shepherd</option>
                  <option value="Venkatesh Iyer">Venkatesh Iyer</option>
                  <option value="Swapnil Singh">Swapnil Singh</option>
                  <option value="Kanishk Chouhan">Kanishk Chouhan</option>
                  <option value="Abhinandan Singh">Abhinandan Singh</option>
                  <option value="Satvik Deswal">Satvik Deswal</option>
                  <option value="Vicky Ostwal">Vicky Ostwal</option>
                  <option value="Vihaan Malhotra">Vihaan Malhotra</option>
                  <option value="Mangesh Yadav">Mangesh Yadav</option>


                  <option value="Josh Hazlewood">Josh Hazlewood</option>
                  <option value="Bhuvneshwar Kumar">Bhuvneshwar Kumar</option>
                  <option value="Suyash Sharma">Suyash Sharma</option>
                  <option value="Rasikh Dar">Rasikh Dar</option>
                  <option value="Jacob Duffy">Jacob Duffy</option>
                  <option value="Yash Dayal">Yash Dayal</option>
                </select>
              </div>

              <button className="btn-primary" style={{ padding: "12px 24px" }} type="submit">
                <FaPaperPlane style={{ marginRight: "8px" }} /> Send Cheer
              </button>
            </div>
          </form>

          {cheerListError && (
            <div style={{ color: "var(--primary-red)", margin: "10px 0" }}>{cheerListError}</div>
          )}

          <div className="cheers-feed">
            {cheers.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px" }}>
                Cheer board is empty. Be the first to cheer!
              </div>
            ) : (
              cheers.map((cheer) => (
                <div className="cheer-card" key={cheer._id}>
                  <div className="cheer-header">
                    <div className="cheer-user-info">
                      <div className="cheer-avatar">
                        {cheer.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="cheer-username">{cheer.username}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formatTime(cheer.timestamp)}
                        </div>
                      </div>
                    </div>
                    {cheer.playerTag && cheer.playerTag !== "General" && (
                      <span className="cheer-player-tag">🔥 {cheer.playerTag}</span>
                    )}
                  </div>

                  <div className="cheer-body">{cheer.content}</div>

                  <div className="cheer-actions">
                    <button className="like-button" onClick={() => handleLike(cheer._id)}>
                      <FaHeart /> Cheer ({cheer.likes})
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Fan</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Fan Card Badge */}
        <div>
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ textTransform: "uppercase", fontSize: "1.1rem", borderBottom: "1px solid var(--border-dark)", paddingBottom: "10px" }}>
                YOUR OFFICIAL MEMBER CARD
              </h3>
              
              <div className="digital-fan-card">
                <span className="fan-card-tier-tag">{user.tier}</span>
                
                <img src={rcbLogo} alt="RCB Logo" style={{ position: "absolute", width: "90px", opacity: "0.15", right: "-10px", bottom: "-10px", pointerEvents: "none" }} />
                
                <div className="fan-card-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <div className="fan-card-name">{user.username}</div>
                <div className="fan-card-id">{user.fanCardNumber}</div>

                <div className="fan-card-stats">
                  <div>
                    <div className="fan-card-stat-label">Fav Player</div>
                    <div className="fan-card-stat-val" style={{ color: "var(--accent-gold)" }}>{user.favoritePlayer}</div>
                  </div>
                  <div>
                    <div className="fan-card-stat-label">Loyalty Tier</div>
                    <div className="fan-card-stat-val">{user.tier === "Rookie" ? "🔴 Rookie" : user.tier === "Pro" ? "🟡 Pro Fan" : "🏆 Superfan"}</div>
                  </div>
                </div>
              </div>

              <div className="fc-cheer-form" style={{ textAlign: "center" }}>
                <h4 style={{ color: "var(--accent-gold)", marginBottom: "8px" }}>Fan Club Privileges</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Earn points by cheering on the wall, booking match tickets, and buying merchandise. Level up to **Superfan** for a chance to win signed Kohli jerseys!
                </p>
              </div>
            </div>
          ) : (
            <div className="auth-notice-card">
              <img src={rcbLogo} alt="RCB Logo" style={{ height: "65px", margin: "0 auto 15px", display: "block", objectFit: "contain" }} />
              <h3 style={{ color: "var(--accent-gold)", marginBottom: "12px", fontWeight: 800 }}>
                JOIN THE FAN CLUB
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "20px" }}>
                Register today to get your custom **RCB Fan Club Digital Card**, secure matchday tickets at M. Chinnaswamy stadium, track your loyalty points, and purchase merch!
              </p>
              <button className="btn-primary" style={{ width: "100%" }} onClick={openAuth}>
                Get Fan Card Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FanClub;
