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

  if (error || !matchData) {
    return (
      <div className="score-card">
        <div className="live-badge">
          <div className="live-dot"></div>
          <span>LIVE SCORE</span>
        </div>
        <div className="score-card-teams">
          <div className="score-team-row">
            <div className="team-info">
              <img src={rcbLogo} alt="RCB Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
              <span className="team-name">RCB</span>
            </div>
            <span className="team-score">186/5</span>
          </div>
          <div className="score-team-row">
            <div className="team-info">
              <img src={gtLogo} alt="GT Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
              <span className="team-name">GT</span>
            </div>
            <span className="team-score">154/8</span>
          </div>
        </div>
        <div className="match-status-text">RCB won by 32 runs</div>
        <div className="scorecard-buttons">
          <button className="btn-primary" onClick={onBuyTickets}>Buy Tickets</button>
          <button className="btn-secondary" onClick={onShop}>Shop Gear</button>
        </div>
      </div>
    );
  }

  const { status, overs, teamA, teamB, result } = matchData;

  return (
    <div className="score-card">
      <div className="live-badge">
        <div className="live-dot" style={{ backgroundColor: status === "LIVE MATCH" ? "var(--primary-red)" : "#777" }}></div>
        <span>{status}</span>
      </div>

      <div className="score-card-teams">
        <div className="score-team-row">
          <div className="team-info">
            {teamA.name === "RCB" ? (
              <img src={rcbLogo} alt="RCB Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : teamA.name === "CSK" ? (
              <img src={cskLogo} alt="CSK Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : teamA.name === "GT" ? (
              <img src={gtLogo} alt="GT Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : (
              <span className="team-emoji">{teamA.logo}</span>
            )}
            <span className="team-name">{teamA.name}</span>
          </div>
          <span className="team-score">{teamA.score}</span>
        </div>

        <div className="score-team-row">
          <div className="team-info">
            {teamB.name === "RCB" ? (
              <img src={rcbLogo} alt="RCB Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : teamB.name === "CSK" ? (
              <img src={cskLogo} alt="CSK Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : teamB.name === "GT" ? (
              <img src={gtLogo} alt="GT Logo" style={{ width: "26px", height: "26px", objectFit: "contain", marginRight: "4px" }} />
            ) : (
              <span className="team-emoji">{teamB.logo}</span>
            )}
            <span className="team-name">{teamB.name}</span>
          </div>
          <span className="team-score">{teamB.score}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", margin: "5px 0" }}>
        <span>Overs: {overs}</span>
        {matchData.target && <span>Target: {matchData.target}</span>}
      </div>

      <div className="match-status-text">
        {result || `RCB needs ${matchData.target - parseInt(teamA.score)} runs to win`}
      </div>

      <div className="scorecard-buttons">
        <button className="btn-primary" onClick={onBuyTickets}>Buy Tickets</button>
        <button className="btn-secondary" onClick={onShop}>Shop Gear</button>
      </div>
    </div>
  );
}

export default ScoreCard;