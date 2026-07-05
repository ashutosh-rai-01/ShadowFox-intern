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

      {error || !match ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "var(--text-secondary)" }}>Connecting to Live Match Simulator...</p>
        </div>
      ) : (
        <div className="matchcenter-layout">
          {/* Live Scoreboard */}
          <div className="mc-card" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="live-badge">
                <div className="live-dot"></div>
                {match.status}
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 700 }}>
                Overs: <span style={{ color: "var(--accent-gold)" }}>{match.overs}</span>
              </span>
            </div>

            <div className="mc-live-score">
              <div className="mc-team-display">
                <div className="mc-team-logo">
                  {match.teamA.name === "RCB" ? (
                    <img src={rcbLogo} alt="RCB Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : match.teamA.name === "CSK" ? (
                    <img src={cskLogo} alt="CSK Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : match.teamA.name === "GT" ? (
                    <img src={gtLogo} alt="GT Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : (
                    match.teamA.logo
                  )}
                </div>
                <div className="mc-team-title">{match.teamA.name}</div>
                <div className="mc-team-runs">{match.teamA.score}</div>
              </div>

              <div className="mc-vs-divider">VS</div>

              <div className="mc-team-display">
                <div className="mc-team-logo">
                  {match.teamB.name === "RCB" ? (
                    <img src={rcbLogo} alt="RCB Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : match.teamB.name === "CSK" ? (
                    <img src={cskLogo} alt="CSK Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : match.teamB.name === "GT" ? (
                    <img src={gtLogo} alt="GT Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                  ) : (
                    match.teamB.logo
                  )}
                </div>
                <div className="mc-team-title">{match.teamB.name}</div>
                <div className="mc-team-runs">{match.teamB.score}</div>
              </div>
            </div>

            {match.result && (
              <div className="match-status-text" style={{ fontSize: "1.1rem", padding: "12px" }}>
                🏆 {match.result}
              </div>
            )}

            {/* Batsmen & Bowlers Table */}
            <div>
              <h4 style={{ color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "10px" }}>Active Batsmen</h4>
              <table className="mc-batsmen-table">
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th style={{ textAlign: "center" }}>Runs</th>
                    <th style={{ textAlign: "center" }}>Balls</th>
                    <th style={{ textAlign: "center" }}>4s</th>
                    <th style={{ textAlign: "center" }}>6s</th>
                  </tr>
                </thead>
                <tbody>
                  {match.teamA.batsmen.map((b, i) => (
                    <tr key={i} style={{ fontWeight: b.isStriker ? "800" : "400" }}>
                      <td>
                        {b.name} {b.isStriker && <span className="striker-indicator">🏏</span>}
                      </td>
                      <td style={{ textAlign: "center" }}>{b.runs}</td>
                      <td style={{ textAlign: "center" }}>{b.balls}</td>
                      <td style={{ textAlign: "center" }}>{b.fours}</td>
                      <td style={{ textAlign: "center" }}>{b.sixes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 style={{ color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "10px" }}>Active Bowler</h4>
              <table className="mc-batsmen-table">
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th style={{ textAlign: "center" }}>Overs</th>
                    <th style={{ textAlign: "center" }}>Runs</th>
                    <th style={{ textAlign: "center" }}>Wickets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{match.teamB.bowler.name}</td>
                    <td style={{ textAlign: "center" }}>{match.teamB.bowler.overs}</td>
                    <td style={{ textAlign: "center" }}>{match.teamB.bowler.runs}</td>
                    <td style={{ textAlign: "center" }}>{match.teamB.bowler.wickets}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ball-by-ball Commentary */}
          <div className="mc-card mc-commentary-panel">
            <h3 style={{ textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid var(--border-dark)", paddingBottom: "10px" }}>
              Live Commentary
            </h3>
            <div className="mc-commentary-list">
              {match.commentaries.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "30px" }}>
                  Commentary will load as soon as next ball is bowled.
                </div>
              ) : (
                match.commentaries.map((com, index) => (
                  <div className={getCommentaryClass(com)} key={index}>
                    {com}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
