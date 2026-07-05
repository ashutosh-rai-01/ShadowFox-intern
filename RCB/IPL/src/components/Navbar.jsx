import { FaInstagram, FaYoutube, FaFacebook, FaShoppingCart, FaUserAlt } from "react-icons/fa";
import rcbLogo from "../assets/rcbredlogo.png";

function Navbar({ activeTab, setActiveTab, user, openAuth, cartCount, openCart }) {
  const tabs = [
    { id: "HOME", label: "HOME" },
    { id: "MATCHES", label: "MATCH CENTER" },
    { id: "FANCLUB", label: "FAN ZONE" },
    { id: "TICKETS", label: "TICKETS" },
    { id: "SHOP", label: "SHOP" }
  ];

  return (
    <nav className="navbar">
      <div className="logo-wrapper" onClick={() => setActiveTab("HOME")}>
        <img src={rcbLogo} alt="RCB Logo" style={{ height: "55px", marginRight: "10px", objectFit: "contain" }} />
        <h1>RCB</h1>
        <span>FAN PORTAL</span>
      </div>

      <ul>
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        <div className="nav-socials">
          <FaFacebook onClick={() => window.open("https://facebook.com/RoyalChallengersBangalore", "_blank")} />
          <FaInstagram onClick={() => window.open("https://www.instagram.com/royalchallengers.bengaluru/", "_blank")} />
          <FaYoutube onClick={() => window.open("https://www.youtube.com/@royalchallengersbengaluruYT", "_blank")} />
        </div>

        {/* Shopping Cart Trigger */}
        <div 
          onClick={openCart} 
          style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <FaShoppingCart style={{ fontSize: "1.4rem", color: "var(--text-secondary)", transition: "all 0.3s" }} className="cart-icon-hover" />
          {cartCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "var(--primary-red)",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: "bold",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifycontent: "center",
              justifyContent: "center",
              border: "1px solid var(--bg-dark-pure)"
            }}>
              {cartCount}
            </span>
          )}
        </div>

        {/* User Account / Profile Badge */}
        {user ? (
          <div className="user-badge" onClick={() => setActiveTab("PROFILE")}>
            <div className="user-avatar-init">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name-label">{user.username}</span>
          </div>
        ) : (
          <button className="btn-secondary" style={{ padding: "6px 16px", fontSize: "0.85rem" }} onClick={openAuth}>
            <FaUserAlt style={{ marginRight: "6px", fontSize: "0.75rem" }} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;