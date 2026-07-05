import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ScoreCard from "./components/scorecard";
import NewsCard from "./components/NewsCard";

// Pages
import MatchCenter from "./pages/MatchCenter";
import FanClub from "./pages/FanClub";
import Tickets from "./pages/Tickets";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";

// Icons
import { FaTimes } from "react-icons/fa";

export const API_BASE = "http://localhost:4000/api";

function App() {
  const [activeTab, setActiveTab] = useState("HOME");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("rcb_fan_token") || "");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // login or register
  
  // Auth Form State
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [favPlayerInput, setFavPlayerInput] = useState("Virat Kohli");
  const [authError, setAuthError] = useState("");

  // Load user profile on mount / token change
  useEffect(() => {
    if (token) {
      localStorage.setItem("rcb_fan_token", token);
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Session expired");
          return res.json();
        })
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          console.warn(err.message);
          handleLogout();
        });
    } else {
      localStorage.removeItem("rcb_fan_token");
      setUser(null);
    }
  }, [token]);

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setActiveTab("HOME");
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const url = authTab === "login" ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const bodyObj = authTab === "login" 
      ? { email: emailInput, password: passwordInput }
      : { username: usernameInput, email: emailInput, password: passwordInput, favoritePlayer: favPlayerInput };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setToken(data.token);
      setUser(data.user);
      setShowAuthModal(false);
      
      // Reset inputs
      setUsernameInput("");
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId, change) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + change;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/shop/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
          })),
          totalPrice: cartTotal
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");

      alert("🎉 Order placed successfully! Check your Profile for order history.");
      setCart([]);
      setIsCartOpen(false);
      
      // Refresh user details to update their tier
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (meRes.ok) {
        const refreshedUser = await meRes.json();
        setUser(refreshedUser);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // View Router
  const renderView = () => {
    switch (activeTab) {
      case "HOME":
        return (
          <>
            <div className="hero-wrapper">
              <Hero onExplore={() => setActiveTab("MATCHES")} />
              <ScoreCard onBuyTickets={() => setActiveTab("TICKETS")} onShop={() => setActiveTab("SHOP")} />
            </div>
            <NewsCard />
          </>
        );
      case "MATCHES":
        return <MatchCenter onBookTicket={() => setActiveTab("TICKETS")} />;
      case "FANCLUB":
        return <FanClub user={user} openAuth={() => setShowAuthModal(true)} token={token} />;
      case "TICKETS":
        return <Tickets user={user} openAuth={() => setShowAuthModal(true)} token={token} onProfile={() => setActiveTab("PROFILE")} />;
      case "SHOP":
        return <Shop onAddToCart={addToCart} />;
      case "PROFILE":
        return <Profile user={user} logout={handleLogout} token={token} />;
      default:
        return <div className="container"><h2>Page not found</h2></div>;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        openAuth={() => { setAuthTab("login"); setShowAuthModal(true); }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
      />

      <main className="main-content">
        {renderView()}
      </main>

      <Footer />

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>SHOPPING CART</h2>
              <button className="cart-remove-btn" style={{ fontSize: "1.4rem" }} onClick={() => setIsCartOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "40px" }}>
                  Your cart is empty. Buy some RCB gears!
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item-row" key={item.product.id}>
                    <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-price">₹{item.product.price}</div>
                      <div className="cart-item-qty">
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.product.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.product.id, 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.product.id)}>
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Total:</span>
                  <span style={{ color: "var(--accent-gold)" }}>₹{cartTotal}</span>
                </div>
                <button className="btn-primary" style={{ width: "100%" }} onClick={handleCheckout}>
                  Checkout & Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setShowAuthModal(false)}>
              <FaTimes />
            </button>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                onClick={() => { setAuthTab("login"); setAuthError(""); }}
              >
                LOGIN
              </button>
              <button 
                className={`auth-tab ${authTab === "register" ? "active" : ""}`}
                onClick={() => { setAuthTab("register"); setAuthError(""); }}
              >
                JOIN CLUB
              </button>
            </div>

            {authError && (
              <div className="alert-banner" style={{ fontSize: "0.85rem", padding: "8px 12px" }}>
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authTab === "register" && (
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter username" 
                    value={usernameInput} 
                    onChange={(e) => setUsernameInput(e.target.value)} 
                    required 
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  value={emailInput} 
                  onChange={(e) => setEmailInput(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  required 
                />
              </div>

              {authTab === "register" && (
                <div className="form-group">
                  <label>Favorite RCB Player</label>
                  <select value={favPlayerInput} onChange={(e) => setFavPlayerInput(e.target.value)}>
                    <option value="Virat Kohli">Virat Kohli</option>
                    <option value="Faf du Plessis">Faf du Plessis</option>
                    <option value="Glenn Maxwell">Glenn Maxwell</option>
                    <option value="Mohammed Siraj">Mohammed Siraj</option>
                    <option value="Dinesh Karthik">Dinesh Karthik</option>
                  </select>
                </div>
              )}

              <button className="btn-primary" style={{ width: "100%", marginTop: "10px" }} type="submit">
                {authTab === "login" ? "Login to Fan Account" : "Register Fan Card"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;