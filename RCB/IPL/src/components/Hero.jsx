import heroImg from "../assets/rcb hero image.webp";

function Hero({ onExplore }) {
  return (
    <section className="hero">
      <img
        src={heroImg}
        alt="RCB Hero Banner"
      />
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <span style={{
          color: "var(--accent-gold)", 
          fontWeight: 800, 
          fontSize: "0.95rem", 
          letterSpacing: "3px", 
          textTransform: "uppercase",
          display: "block",
          marginBottom: "10px"
        }}>
          OFFICIAL FAN HUB
        </span>

        <h1>PLAY <span>BOLD</span></h1>

        <p>
          Join the red & gold army. Access live commentary, get tickets to Chinnaswamy, shop the gear, and cheer on the King and the boys.
        </p>

        <div style={{ display: "flex", gap: "15px" }}>
          <button className="btn-primary" onClick={onExplore}>
            Live Match Center
          </button>
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            borderLeft: "2.5px solid var(--accent-gold)"
          }}>
            Next Match: vs MI (June 22, 2026)
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
