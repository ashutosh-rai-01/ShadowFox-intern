function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thank you! You have subscribed to the RCB newsletter.");
    e.target.reset();
  };

  return (
    <footer>
      <div className="container" style={{ padding: 0 }}>
        <div className="footer-top">
          <div className="footer-column">
            <h3 style={{ color: "var(--accent-gold)", fontWeight: 900 }}>ROYAL CHALLENGERS BENGALURU</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "260px" }}>
              The official Fan Portal of RCB. Follow every wicket, run, and moment. Play Bold, Play Proud.
            </p>
          </div>

          <div className="footer-column">
            <h3>QUICK LINKS</h3>
            <ul>
              <li>Home Ground: Chinnaswamy</li>
              <li>RCB TV Highlights</li>
              <li>Hall of Fame</li>
              <li>Support & Contact</li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>PARTNERS</h3>
            <ul>
              <li>Puma Cricket</li>
              <li>Qatar Airways</li>
              <li>Muthoot Fincorp</li>
              <li>Hindware Smart Appliances</li>
            </ul>
          </div>

          <div className="footer-column footer-newsletter">
            <h3>NEWSLETTER</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "10px" }}>
              Subscribe to get exclusive player stats, tickets releases and discounts.
            </p>
            <form onSubmit={handleSubscribe}>
              <input type="email" placeholder="Enter your email" required />
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", width: "100%" }} type="submit">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Royal Challengers Bengaluru Fan Website. Built for Superfans.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ cursor: "pointer" }}>Privacy Policy</span>
            <span style={{ cursor: "pointer" }}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;