import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import { FaTicketAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import rcbLogo from "../assets/rcblogo.png";
import cskLogo from "../assets/csklogo.png";
import gtLogo from "../assets/Gtlogo.png";

function MatchCenter({ onBookTicket }) {
  const [match, setMatch] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch live score and commentary
    const fetchLiveMatch = () => {
      fetch(`${API_BASE}/matches/live`)
        .then((res) => res.json())
        .then((data) => {
          setMatch(data);
          setError(false);
        })
        .catch(() => setError(true));
    };

    // Fetch fixtures list
    fetch(`${API_BASE}/matches/fixtures`)
      .then((res) => res.json())
      .then((data) => setFixtures(data))
      .catch(() => {});

    fetchLiveMatch();
    const interval = setInterval(fetchLiveMatch, 4000);
    return () => clearInterval(interval);
  }, []);

  const getCommentaryClass = (text) => {
    if (text.includes("OUT") || text.includes("Wicket") || text.includes("wicket")) return "commentary-item wicket-down";
    if (text.includes("SIX")) return "commentary-item boundary-6";
    if (text.includes("FOUR")) return "commentary-item boundary-4";
    return "commentary-item";
  };

  return (
    <div className="container">
      <h2 className="section-title">
        MATCH <span>CENTER</span>
      </h2>

      <div className="mc-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "50px 20px", marginBottom: "30px" }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="live-dot" style={{ backgroundColor: "#777" }}></div>
          <span>NO LIVE MATCHES CURRENTLY</span>
        </div>
      </div>     )}

      {/* Fixtures Section */}
      <div style={{ marginTop: "60px" }}>
        <h2 className="section-title">
          UPCOMING <span>FIXTURES</span>
        </h2>
        <div className="fixtures-list">
          {fixtures.map((fix) => (
            <div className="fixture-card" key={fix.id}>
              <div className="fixture-info-left">
                <div className="fixture-vs">
                  RCB <span>VS</span> {fix.opponent}
                </div>
                <div className="fixture-details">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaClock /> {fix.date} @ {fix.time}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaMapMarkerAlt /> {fix.venue}</div>
                </div>
              </div>

              <div>
                {fix.priceRange === "Away Match" ? (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 700 }}>AWAY FIXTURE</span>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Tickets From</span>
                      <div style={{ color: "var(--accent-gold)", fontWeight: "800" }}>{fix.priceRange.split(" - ")[0]}</div>
                    </div>
                    <button className="btn-primary" onClick={onBookTicket}>
                      <FaTicketAlt style={{ marginRight: "6px" }} /> Book Seats
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchCenter;
