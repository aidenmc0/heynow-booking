
const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatPrice = (n) => n.toLocaleString('th-TH');

const parseDate = (key) => {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const nightsBetween = (from, to) => {
  if (!from || !to) return 0;
  const d1 = parseDate(from);
  const d2 = parseDate(to);
  return Math.round((d2 - d1) / 86400000);
};

const formatDate = (key) => {
  if (!key) return "";
  const d = parseDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

// ── Mock Data with Random Availability ───────────────────────────────
const generateBookedDates = () => {
  const dates = new Set();
  const today = new Date();
  // Randomly book ~30% of days in the next 60 days
  for (let i = 0; i < 60; i++) {
    if (Math.random() < 0.3) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.add(toKey(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  }
  return Array.from(dates);
};

const ROOMS = [
  {
    id: "lanna-suite",
    name: "Lanna Suite",
    tagline: "Hilltop sanctuary with panoramic mountain views",
    price: 4800,
    capacity: 2,
    maxKids: 1,
    size: 48,
    beds: "1 King Bed",
    img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    amenities: ["Private Pool", "Mountain View", "Rain Shower"],
    bookedDates: generateBookedDates() // Random data on load
  },
  {
    id: "garden-villa",
    name: "Garden Villa",
    tagline: "Secluded bamboo villa in tropical gardens",
    price: 3200,
    capacity: 3,
    maxKids: 2,
    size: 56,
    beds: "1 King + Daybed",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["Private Garden", "Outdoor Bath", "Hammock"],
    bookedDates: generateBookedDates()
  },
  {
    id: "mountain-retreat",
    name: "Mountain Retreat",
    tagline: "Handcrafted teak bungalow",
    price: 2600,
    capacity: 2,
    maxKids: 1,
    size: 36,
    beds: "1 Queen Bed",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    amenities: ["Forest Deck", "Outdoor Shower", "Fire Pit"],
    bookedDates: generateBookedDates()
  }
];

// ── Styles Object (CSS-in-JS) ────────────────────────────────────────
const C = { // Colors
  cream: "#FAF6F0", creamLight: "#FDFBF8", sand: "#E8DFD3", clay: "#C4B09A",
  earth: "#8B7355", bark: "#5C4A3A", charcoal: "#2D2824", sage: "#8A9A7C",
  white: "#FFFFFF", muted: "#9A8B7A", red: "#C0392B", redLight: "#FEF2F2"
};

const S = { // Styles
  root: { fontFamily: "'DM Sans', sans-serif", background: C.cream, minHeight: "100vh", color: C.charcoal },
  widget: { background: C.white, border: `1.5px solid ${C.sand}`, borderRadius: "16px", overflow: "hidden" },
  btnPrimary: {
    background: C.earth, color: C.white, border: "none", padding: "14px 32px", borderRadius: "8px",
    fontWeight: 500, fontSize: 14, cursor: "pointer", transition: "all 0.3s", width: "100%"
  },
  btnSecondary: {
    background: "transparent", color: C.earth, border: `1.5px solid ${C.clay}`, padding: "12px 24px",
    borderRadius: "8px", fontWeight: 500, fontSize: 14, cursor: "pointer", transition: "all 0.3s"
  },
  input: {
    width: "100%", background: C.white, border: `1.5px solid ${C.sand}`, borderRadius: "10px",
    padding: "14px 18px", fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: C.charcoal,
    outline: "none", transition: "border-color 0.3s"
  },
  counterBtn: {
    width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${C.clay}`,
    background: "transparent", fontSize: 18, cursor: "pointer", color: C.earth,
    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
  },
  calendarDay: {
    aspectRatio: "1", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
    background: C.cream, color: C.charcoal
  }
};

// ── Main Component ───────────────────────────────────────────────────
export default function BookingRoom() {
  // State
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [kidAges, setKidAges] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Inject Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Logic
  const isRoomAvailable = (room, startKey, endKey) => {
    if (!startKey || !endKey) return true;
    const start = parseDate(startKey);
    const end = parseDate(endKey);
    let current = new Date(start);
    
    while (current < end) {
      const key = toKey(current.getFullYear(), current.getMonth(), current.getDate());
      if (room.bookedDates.includes(key)) return false;
      current.setDate(current.getDate() + 1);
    }
    return true;
  };

  const availableRooms = useMemo(() => {
    if (!checkIn || !checkOut) return ROOMS;
    return ROOMS.filter(r => isRoomAvailable(r, checkIn, checkOut));
  }, [checkIn, checkOut]);

  const totalNights = nightsBetween(checkIn, checkOut);
  const selectedRoomData = ROOMS.find(r => r.id === selectedRoom);
  const totalPrice = selectedRoomData ? (totalNights * selectedRoomData.price) + (kids * 300) : 0;

  const handleDateClick = (key) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (parseDate(key) < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key);
      setCheckOut(null);
      setSelectedRoom(null);
    } else {
      if (key <= checkIn) {
        setCheckIn(key);
        setCheckOut(null);
      } else {
        setCheckOut(key);
      }
    }
  };

  const handleConfirm = () => {
    if (!guestName || !email) return;
    setStep(5); // Done
  };
  
  const resetBooking = () => {
    setStep(1);
    setCheckIn(null);
    setCheckOut(null);
    setSelectedRoom(null);
    setAdults(1);
    setKids(0);
    setKidAges([]);
    setGuestName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
  };

  // Renderers
  const renderCalendar = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    
    const days = [];
    for(let i=0; i<firstDay; i++) days.push(<div key={`e${i}`} />);
    
    for (let d=1; d<=daysInMonth; d++) {
      const key = toKey(viewYear, viewMonth, d);
      const date = new Date(viewYear, viewMonth, d);
      const isPast = date < today;
      const isCheckIn = checkIn === key;
      const isCheckOut = checkOut === key;
      const inRange = checkIn && checkOut && key > checkIn && key < checkOut;
      
      // Check if ANY room is available on this date (simplified for demo)
      const isBooked = !ROOMS.some(r => !r.bookedDates.includes(key));
      
      let style = {...S.calendarDay};
      let disabled = false;
      
      if (isPast) { style.color = "#D4CCC0"; style.cursor = "default"; disabled = true; }
      else if (isCheckIn || isCheckOut) { style.background = C.earth; style.color = C.white; style.fontWeight = 600; }
      else if (inRange) { style.background = "#F5EFE0"; style.color = C.bark; }
      else if (isBooked) { style.background = C.redLight; style.color = "#CA8A8A"; disabled = true; }
      else if (checkIn && !checkOut && key > checkIn) { style.background = "#E8EDE4"; style.color = C.sage; }
      
      days.push(
        <button key={d} style={style} disabled={disabled} onClick={() => handleDateClick(key)}>
          {d}
        </button>
      );
    }

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button style={S.counterBtn} onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear(viewYear-1)) : setViewMonth(viewMonth-1)}>‹</button>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.bark }}>
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          <button style={S.counterBtn} onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear(viewYear+1)) : setViewMonth(viewMonth+1)}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 12, color: C.muted, paddingBottom: 8 }}>{d}</div>)}
          {days}
        </div>
      </div>
    );
  };

  // Step 5: Confirmation
  if (step === 5) {
    return (
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...S.widget, maxWidth: 500, width: "100%", padding: "40px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#E8EDE4", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C.sage, fontSize: 28 }}>✓</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.bark, marginBottom: 12 }}>Reservation Confirmed</h1>
          <p style={{ color: C.muted, marginBottom: 24 }}>Thank you, {guestName}. A confirmation has been sent to {email}.</p>
          
          <div style={{ background: C.cream, padding: 20, borderRadius: 12, textAlign: "left", marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <img src={selectedRoomData?.img} style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} alt="" />
              <div>
                <p style={{ fontWeight: 600, color: C.bark }}>{selectedRoomData?.name}</p>
                <p style={{ fontSize: 13, color: C.muted }}>{formatDate(checkIn)} - {formatDate(checkOut)}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, borderTop: `1px solid ${C.sand}`, paddingTop: 12 }}>
              <span>Total Paid</span>
              <strong style={{ color: C.earth, fontSize: 18 }}>฿{formatPrice(totalPrice)}</strong>
            </div>
          </div>
          
          <button style={S.btnPrimary} onClick={resetBooking}>Book Another Stay</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Resort" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "48px 32px" }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#E8DFD3", marginBottom: 8 }}>Sanctuary Resort</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: C.white, margin: 0 }}>
            Reserve Your <em>Escape</em>
          </h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${step >= s ? C.earth : C.clay}`,
                background: step >= s ? C.earth : "transparent", color: step >= s ? C.white : C.muted,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}>
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div style={{ width: 40, height: 1, background: C.sand }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 80px" }}>
        
        {/* STEP 1: Dates */}
        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            <div style={S.widget}>
              {renderCalendar()}
            </div>
            <div style={{ ...S.widget, padding: 24, height: "fit-content" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.bark, marginBottom: 20 }}>Your Stay</h3>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: 16, borderRadius: 12, background: C.cream }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>Check-in</p>
                  <p style={{ fontWeight: 500, color: checkIn ? C.bark : C.clay }}>{checkIn ? formatDate(checkIn) : "Select Date"}</p>
                </div>
                <div style={{ flex: 1, padding: 16, borderRadius: 12, background: C.cream }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>Check-out</p>
                  <p style={{ fontWeight: 500, color: checkOut ? C.bark : C.clay }}>{checkOut ? formatDate(checkOut) : "Select Date"}</p>
                </div>
              </div>
              
              {checkIn && checkOut && (
                <div style={{ padding: 12, borderRadius: 10, background: "#E8EDE4", color: C.sage, marginBottom: 20, textAlign: "center" }}>
                  {totalNights} nights · {availableRooms.length} rooms available
                </div>
              )}

              <button 
                style={{ ...S.btnPrimary, opacity: checkIn && checkOut ? 1 : 0.5 }} 
                disabled={!checkIn || !checkOut}
                onClick={() => setStep(2)}
              >
                Select Room
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Room Selection */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ ...S.btnSecondary, marginBottom: 24 }}>← Back to Dates</button>
            <div style={{ display: "grid", gap: 20 }}>
              {ROOMS.map(room => {
                const isAvailable = availableRooms.some(r => r.id === room.id);
                const isSelected = selectedRoom === room.id;
                return (
                  <div 
                    key={room.id}
                    onClick={() => isAvailable && setSelectedRoom(room.id)}
                    style={{
                      ...S.widget, padding: 16, cursor: isAvailable ? "pointer" : "not-allowed",
                      opacity: isAvailable ? 1 : 0.6,
                      border: isSelected ? `2px solid ${C.earth}` : `1px solid ${C.sand}`,
                      display: "grid", gridTemplateColumns: "140px 1fr", gap: 16
                    }}
                  >
                    <img src={room.img} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} alt={room.name} />
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.bark }}>{room.name}</h3>
                        <span style={{ color: C.earth, fontWeight: 600 }}>฿{formatPrice(room.price)}/n</span>
                      </div>
                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{room.tagline}</p>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, background: C.cream }}>{room.beds}</span>
                        <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, background: "#E8EDE4", color: C.sage }}>Max {room.maxKids} Kids</span>
                      </div>
                      {isSelected && <span style={{ fontSize: 12, color: C.white, background: C.earth, padding: "4px 12px", borderRadius: 20 }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
              <button 
                style={{ ...S.btnPrimary, opacity: selectedRoom ? 1 : 0.5, maxWidth: 200, marginLeft: "auto" }}
                disabled={!selectedRoom}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 & 4: Guest Details & Summary (Combined for UX speed) */}
        {(step === 3 || step === 4) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <button onClick={() => setStep(2)} style={{ ...S.btnSecondary, marginBottom: 20 }}>← Back</button>
              <div style={{ ...S.widget, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, marginBottom: 16 }}>Guests</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Adults */}
                  <div>
                    <label style={{ fontSize: 12, color: C.muted }}>Adults</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <button style={S.counterBtn} onClick={() => setAdults(Math.max(1, adults-1))}>−</button>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{adults}</span>
                      <button style={S.counterBtn} onClick={() => setAdults(Math.min(selectedRoomData?.capacity||4, adults+1))}>+</button>
                    </div>
                  </div>
                  {/* Kids */}
                  <div>
                    <label style={{ fontSize: 12, color: C.muted }}>Children</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <button style={S.counterBtn} onClick={() => { if(kids > 0) { setKids(kids-1); setKidAges(kidAges.slice(0, -1)); } }}>−</button>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{kids}</span>
                      <button style={S.counterBtn} onClick={() => { if(kids < selectedRoomData?.maxKids) { setKids(kids+1); setKidAges([...kidAges, null]); } }}>+</button>
                    </div>
                  </div>
                </div>
                {/* Kid Ages */}
                {kidAges.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 12, color: C.muted }}>Children's Ages</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {kidAges.map((age, i) => (
                        <select key={i} style={{ ...S.input, width: 70 }} value={age || ""} onChange={(e) => {
                          const newAges = [...kidAges];
                          newAges[i] = e.target.value;
                          setKidAges(newAges);
                        }}>
                          <option value="">Age</option>
                          {[...Array(12)].map((_, x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ ...S.widget, padding: 24 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, marginBottom: 16 }}>Details</h3>
                <input style={{ ...S.input, marginBottom: 12 }} placeholder="Full Name *" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                <input style={{ ...S.input, marginBottom: 12 }} type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input style={{ ...S.input, marginBottom: 12 }} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <textarea style={{ ...S.input, height: 80 }} placeholder="Special Requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
              </div>
            </div>

            {/* Summary Column */}
            <div>
              <div style={{ ...S.widget, padding: 24, position: "sticky", top: 20 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, marginBottom: 16 }}>Summary</h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <img src={selectedRoomData?.img} style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} alt="" />
                  <div>
                    <p style={{ fontWeight: 500 }}>{selectedRoomData?.name}</p>
                    <p style={{ fontSize: 13, color: C.muted }}>{formatDate(checkIn)} → {formatDate(checkOut)}</p>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${C.sand}`, borderBottom: `1px solid ${C.sand}`, padding: "12px 0", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                    <span>Room × {totalNights} nights</span>
                    <span>฿{formatPrice(selectedRoomData?.price * totalNights)}</span>
                  </div>
                  {kids > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span>Extra Bedding ({kids})</span>
                      <span>฿{formatPrice(kids * 300)}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: C.earth }}>฿{formatPrice(totalPrice)}</span>
                </div>
                <button 
                  style={{ ...S.btnPrimary, opacity: guestName && email ? 1 : 0.5 }} 
                  disabled={!guestName || !email}
                  onClick={handleConfirm}
                >
                  Confirm Reservation
                </button>
                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 12 }}>Free cancellation 7 days prior</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}