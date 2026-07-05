import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import rcbLogo from "../assets/rcblogo.png";
import cskLogo from "../assets/csklogo.png";
import gtLogo from "../assets/Gtlogo.png";

function ScoreCard({ onBuyTickets, onShop }) {
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchScore = () => {
      fetch(`${API_BASE}/matches/live`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setMatchData(data);
          setError(false);
        })
        .catch(() => {
          setError(true);
        });
    };

    fetchScore();
    const interval = setInterval(fetchScore, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="score-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "30px 20px" }}>
      <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div className="live-dot" style={{ backgroundColor: "#777" }}></div>
        <span>NO LIVE MATCHES</span>
      </div>
      <div className="scorecard-buttons" style={{ width: "100%" }}>
        <button className="btn-primary" onClick={onBuyTickets}>Buy Tickets</button>
        <button className="btn-secondary" onClick={onShop}>Shop Gear</button>
      </div>
    </div>
  );
}

export default ScoreCard;