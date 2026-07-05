import { useState, useEffect } from "react";
import { API_BASE } from "../App";
import { FaTicketAlt, FaLocationArrow } from "react-icons/fa";

function Tickets({ user, openAuth, token, onProfile }) {
  const [fixtures, setFixtures] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedStand, setSelectedStand] = useState("");
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const standPrices = {
    "Pavilion Stand": 2500,
    "Grand Stand": 1800,
    "Fan Zone": 1200,
    "East Stand": 800,
    "West Stand": 800,
    "Corporate Box": 5000
  };

  useEffect(() => {
    fetch(`${API_BASE}/matches/fixtures`)
      .then((res) => res.json())
      .then((data) => {
        // Only keep home fixtures (that have prices)
        const homeGames = data.filter(f => f.priceRange !== "Away Match");
        setFixtures(homeGames);
        if (homeGames.length > 0) {
          setSelectedMatch(homeGames[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch reserved seats when match changes
  useEffect(() => {
    if (selectedMatch) {
      fetch(`${API_BASE}/tickets/reserved/${selectedMatch}`)
        .then((res) => res.json())
        .then((data) => {
          setReservedSeats(data.reservedSeats || []);
          setSelectedSeats([]); // reset seats
        })
        .catch(() => {});
    }
  }, [selectedMatch]);

  const activeMatchDetails = fixtures.find(f => f.id === selectedMatch);
  const ticketPrice = selectedStand ? standPrices[selectedStand] : 0;
  const totalPrice = selectedSeats.length * ticketPrice;

  // Generate 24 seat codes for the selected stand
  const getSeatsForStand = () => {
    if (!selectedStand) return [];
    const prefix = selectedStand.split(" ").map(w => w[0]).join(""); // e.g. PS, GS, FZ
    const rows = ["A", "B", "C"];
    const seats = [];
    rows.forEach(r => {
      for (let i = 1; i <= 8; i++) {
        seats.push(`${prefix}-${r}${i}`);
      }
    });
    return seats;
  };

  const handleSeatClick = (seatId) => {
    if (reservedSeats.includes(seatId)) return;
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleBookTickets = async () => {
    if (!user) {
      openAuth();
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId: selectedMatch,
          seatNumbers: selectedSeats,
          stand: selectedStand,
          totalPrice
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("🎉 Seats Booked Successfully! Ee Sala Cup Namde! Check your Profile for pass details.");
      setSelectedSeats([]);
      // Refresh reserved list
      setReservedSeats(prev => [...prev, ...selectedSeats]);
      onProfile(); // Redirect to profile
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">
        BOOK <span>TICKETS</span>
      </h2>

      {fixtures.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-secondary)" }}>No upcoming home matches available for ticket booking.</p>
        </div>
      ) : (
        <div className="tickets-layout">
          {/* Left: Stadium Map Selector */}
          <div className="stadium-map-container">
            <h3 style={{ color: "var(--accent-gold)", fontWeight: 800, alignSelf: "flex-start", marginBottom: "5px" }}>
              M. CHINNASWAMY STADIUM
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", alignSelf: "flex-start", marginBottom: "15px" }}>
              Select a Stand from the stadium oval map below to choose seats.
            </p>

            <div className="form-group" style={{ width: "100%", maxWidth: "340px", margin: "10px 0 20px" }}>
              <label>Select Match Clashes</label>
              <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
                {fixtures.map(f => (
                  <option key={f.id} value={f.id}>RCB vs {f.opponent} ({f.date})</option>
                ))}
              </select>
            </div>

            {/* Schematic Oval Stadium Map */}
            <div className="stadium-oval">
              <div className="stadium-pitch">
                PITCH
              </div>
              
              <div 
                className={`stadium-stand stand-pavilion ${selectedStand === "Pavilion Stand" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("Pavilion Stand"); setSelectedSeats([]); }}
              >
                Pavilion (₹2.5k)
              </div>
              <div 
                className={`stadium-stand stand-grand ${selectedStand === "Grand Stand" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("Grand Stand"); setSelectedSeats([]); }}
              >
                Grand (₹1.8k)
              </div>
              <div 
                className={`stadium-stand stand-east ${selectedStand === "East Stand" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("East Stand"); setSelectedSeats([]); }}
              >
                East (₹800)
              </div>
              <div 
                className={`stadium-stand stand-west ${selectedStand === "West Stand" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("West Stand"); setSelectedSeats([]); }}
              >
                West (₹800)
              </div>
              <div 
                className={`stadium-stand stand-fanzone ${selectedStand === "Fan Zone" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("Fan Zone"); setSelectedSeats([]); }}
              >
                Fan Zone (₹1.2k)
              </div>
              <div 
                className={`stadium-stand stand-corporate ${selectedStand === "Corporate Box" ? "selected" : ""}`}
                onClick={() => { setSelectedStand("Corporate Box"); setSelectedSeats([]); }}
              >
                Corporate (₹5k)
              </div>
            </div>

            {/* Interactive Seat Box grid */}
            {selectedStand ? (
              <div style={{ width: "100%", borderTop: "1px solid var(--border-dark)", paddingTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h4 style={{ color: "white", textTransform: "uppercase" }}>{selectedStand} - Seat Selection</h4>
                <div style={{ display: "flex", gap: "20px", fontSize: "0.8rem", color: "var(--text-secondary)", margin: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-dark)" }}></div> Available
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", background: "var(--accent-gold)" }}></div> Selected
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", background: "#ff3333" }}></div> Booked
                  </div>
                </div>

                <div className="seats-grid">
                  {getSeatsForStand().map((seat) => {
                    const isBooked = reservedSeats.includes(seat);
                    const isSel = selectedSeats.includes(seat);
                    return (
                      <div 
                        key={seat} 
                        className={`seat-box ${isBooked ? "reserved" : isSel ? "selected" : ""}`}
                        onClick={() => handleSeatClick(seat)}
                        title={isBooked ? "Reserved Seat" : `Seat ${seat}`}
                      >
                        {seat.split("-")[1]}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ margin: "20px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                👈 Click on any Stand inside the map to display seat rows.
              </div>
            )}
          </div>

          {/* Right: Booking summary panel */}
          <div>
            <div className="fc-cheer-form" style={{ position: "sticky", top: "110px" }}>
              <h3 style={{ color: "var(--accent-gold)", fontWeight: 800, borderBottom: "1px solid var(--border-dark)", paddingBottom: "10px", marginBottom: "15px" }}>
                SUMMARY & BOOKING
              </h3>
              
              {activeMatchDetails && (
                <div style={{ marginBottom: "15px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Selected Match</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "3px" }}>RCB vs {activeMatchDetails.opponent}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{activeMatchDetails.date} @ {activeMatchDetails.time}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{activeMatchDetails.venue}</div>
                </div>
              )}

              <div style={{ marginBottom: "15px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Selected Stand</span>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "3px" }}>
                  {selectedStand || <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>None Selected</span>}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Selected Seats ({selectedSeats.length})</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {selectedSeats.length === 0 ? (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Choose seat squares...</span>
                  ) : (
                    selectedSeats.map(s => (
                      <span key={s} style={{ background: "rgba(226, 177, 60, 0.15)", color: "var(--accent-gold)", border: "1px solid var(--accent-gold)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem", fontWeight: "bold" }}>
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-dark)", paddingTop: "15px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700" }}>Total Amount</span>
                  <span style={{ color: "var(--accent-gold)", fontSize: "1.5rem", fontWeight: "900" }}>₹{totalPrice}</span>
                </div>
                {selectedStand && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "right", marginTop: "2px" }}>
                    ({selectedSeats.length} x ₹{ticketPrice} / seat)
                  </div>
                )}
              </div>

              <button 
                className={selectedSeats.length > 0 ? "btn-primary" : "btn-disabled"} 
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onClick={handleBookTickets}
                disabled={selectedSeats.length === 0 || bookingLoading}
              >
                <FaTicketAlt /> {bookingLoading ? "Processing Booking..." : user ? "Confirm & Pay" : "Sign In to Book"}
              </button>

              {!user && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
                  *You must be signed in to purchase tickets.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
