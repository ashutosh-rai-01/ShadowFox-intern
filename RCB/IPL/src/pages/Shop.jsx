import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import { FaShoppingCart, FaTimes, FaEye } from "react-icons/fa";

function Shop({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/shop/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">
        OFFICIAL <span>SHOP</span>
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading RCB merchandise...</p>
        </div>
      ) : (
        <div className="shop-layout">
          <div className="shop-grid">
            {products.map((prod) => (
              <div className="product-card" key={prod.id}>
                <div className="product-img-holder">
                  <img src={prod.image} alt={prod.name} />
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    cursor: "pointer"
                  }}
                  className="product-img-overlay"
                  onClick={() => setSelectedProduct(prod)}
                  >
                    <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                      <FaEye /> Quick View
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <div>
                    <h3 className="product-title">{prod.name}</h3>
                    <p style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      marginBottom: "12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {prod.desc}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="product-price">₹{prod.price}</span>
                    <button className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.8rem" }} onClick={() => onAddToCart(prod)}>
                      <FaShoppingCart style={{ marginRight: "6px" }} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="auth-modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="auth-modal" style={{ maxWidth: "600px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "25px", padding: "30px" }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setSelectedProduct(null)}>
              <FaTimes />
            </button>

            <div style={{ height: "100%", maxHeight: "300px", borderRadius: "8px", overflow: "hidden" }}>
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ color: "var(--accent-gold)", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                  OFFICIAL GEAR
                </span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "5px 0 10px", lineHeight: "1.3" }}>
                  {selectedProduct.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                  {selectedProduct.desc}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--border-dark)", paddingTop: "15px", marginTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Price:</span>
                  <span style={{ color: "var(--accent-gold)", fontSize: "1.5rem", fontWeight: 800 }}>₹{selectedProduct.price}</span>
                </div>
                
                <button 
                  className="btn-primary" 
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={() => { onAddToCart(selectedProduct); setSelectedProduct(null); }}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay CSS inject since vanilla styling hover is needed */}
      <style>{`
        .product-img-holder:hover .product-img-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

export default Shop;
