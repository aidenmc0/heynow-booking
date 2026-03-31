import { useState, useMemo, useEffect } from "react";
const pad = (n) => String(n).padStart(2, "0");

// ── Google Fonts ───────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.querySelector("#hn-fonts")) {
  const l = document.createElement("link");
  l.id = "hn-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";
  document.head.appendChild(l);
}

// ── Responsive hook ────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 900) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setMobile(mq.matches);
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  cream: "#f9f4ec", sand: "#e8dccb", clay: "#c9b89a",
  earth: "#8b6f47", bark: "#5c4429", charcoal: "#2a2520",
  sage: "#7a8c6e", white: "#ffffff", muted: "#9a8b7a",
  red: "#c0392b", redLight: "#fdf2f2", redMid: "#e8b4b4",
};

// ── Room data ──────────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: "lanna-suite",
    name: "Lanna Suite",
    tagline: "Hilltop sanctuary with panoramic Doi Luang views",
    price: 4800, capacity: 2, size: 48, beds: "1 King",
    img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    amenities: ["Private plunge pool", "Outdoor terrace", "Rain shower", "Minibar"],
    isAvailable: (y, m, d) => m === 4 && d === 1,
  },
  {
    id: "garden-villa",
    name: "Garden Villa",
    tagline: "Secluded bamboo villa nestled in tropical garden",
    price: 3200, capacity: 3, size: 56, beds: "1 King + Daybed",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["Private garden", "Outdoor bathtub", "Hammock", "Nespresso"],
    isAvailable: (y, m, d) => m === 4 && d === 2,
  },
  {
    id: "mountain-retreat",
    name: "Mountain Retreat",
    tagline: "Barefoot luxury in a handcrafted teak bungalow",
    price: 2600, capacity: 2, size: 36, beds: "1 Queen",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    amenities: ["Forest-view deck", "Outdoor shower", "Campfire kit", "Telescope"],
    isAvailable: (y, m, d) => m === 4 && d === 3,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isRoomAvail(room, key) {
  const [y, m, d] = key.split('-').map(Number);
  return room.isAvailable(y, m, d);
}
function isAnyRoomAvail(key) { return ROOMS.some(r => isRoomAvail(r, key)); }
function availRoomCount(key) { return ROOMS.filter(r => isRoomAvail(r, key)).length; }

function isRoomAvailForRange(room, from, to) {
  let d = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (d < end) {
    const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!isRoomAvail(room, key)) return false;
    d.setDate(d.getDate() + 1);
  }
  return true;
}
function isAnyRoomAvailForRange(from, to) { return ROOMS.some(r => isRoomAvailForRange(r, from, to)); }

function nextDayKey(key) {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function nightsBetween(from, to) {
  return Math.round((new Date(to + "T00:00:00") - new Date(from + "T00:00:00")) / 86400000);
}

// ── Unified Calendar ───────────────────────────────────────────────────────────
function AvailabilityCalendar({ selectedRoomId, checkIn, checkOut, onSelectDate, onClear, mobile }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay    = new Date(view.year, view.month, 1).getDay();
  const room        = ROOMS.find(r => r.id === selectedRoomId);

  function prevMonth() {
    setView(v => v.month === 0 ? { year: v.year-1, month:11 } : {...v, month:v.month-1});
  }
  function nextMonth() {
    setView(v => v.month===11 ? { year:v.year+1, month:0 } : {...v, month:v.month+1});
  }

  function handleDay(d) {
    const key  = toKey(view.year, view.month, d);
    const date = new Date(view.year, view.month, d);
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < midnight) return;
    if (checkIn && !checkOut && key > checkIn) {
      if (room ? !isRoomAvailForRange(room, checkIn, key) : !isAnyRoomAvailForRange(checkIn, key)) return;
      onSelectDate(key); return;
    }
    if (room ? !isRoomAvail(room, key) : !isAnyRoomAvail(key)) return;
    onSelectDate(key);
  }

  function getDayState(d) {
    const key  = toKey(view.year, view.month, d);
    const date = new Date(view.year, view.month, d);
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < midnight) return "past";
    if (checkIn && !checkOut && key > checkIn) {
      if (room ? !isRoomAvailForRange(room, checkIn, key) : !isAnyRoomAvailForRange(checkIn, key)) return "booked_full";
      return "checkout_ok";
    }
    if (room ? !isRoomAvail(room, key) : !isAnyRoomAvail(key)) return "booked_full";
    if (key === checkIn)  return "checkin";
    if (key === checkOut) return "checkout";
    if (checkIn && checkOut && key > checkIn && key < checkOut) return "range";
    return "available";
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const stateStyle = {
    past:          { background:"transparent", color:"#cec5bb", cursor:"default" },
    booked_full:   { background:C.redLight, color:C.redMid, cursor:"not-allowed" },
    checkin:       { background:C.earth, color:C.white, fontWeight:500, borderRadius:"8px 0 0 8px" },
    checkout:      { background:C.earth, color:C.white, fontWeight:500, borderRadius:"0 8px 8px 0" },
    range:         { background:`${C.clay}28`, color:C.bark, borderRadius:0 },
    available:     { background:C.cream, color:C.charcoal },
    checkout_ok:   { background:"#eee8da", color:C.bark },
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: mobile ? 12 : 16 }}>
        <button style={S.calNav} onClick={prevMonth}>‹</button>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: mobile ? 17 : 19, fontWeight:400, color:C.bark }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button style={S.calNav} onClick={nextMonth}>›</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap: mobile ? 2 : 3, marginBottom:2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ fontSize: mobile ? 9 : 10, letterSpacing:1, textTransform:"uppercase", color:C.muted, textAlign:"center", paddingBottom: mobile ? 4 : 6 }}>{d}</div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap: mobile ? 2 : 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const st = getDayState(d);
          const key = toKey(view.year, view.month, d);
          const cnt = !room ? availRoomCount(key) : null;
          const nights = (st === "checkout_ok") ? nightsBetween(checkIn, key) : 0;
          return (
            <button
              key={d}
              title={
                st === "checkout_ok" ? `${nights} night${nights !== 1 ? "s" : ""}` :
                st === "booked_full" ? "Fully booked" :
                cnt !== null ? `${cnt} room${cnt !== 1 ? "s" : ""} available` : ""
              }
              style={{
                ...S.calDay,
                ...stateStyle[st],
                position:"relative",
                height: mobile ? 38 : 36,
                fontSize: mobile ? 13 : 13,
              }}
              onClick={() => handleDay(d)}
            >
              {d}
              {st === "checkout_ok" && (
                <span style={{
                  position:"absolute", bottom: mobile ? 1 : 2, left:"50%", transform:"translateX(-50%)",
                  fontSize: mobile ? 7 : 7, color:C.earth, lineHeight:1, fontWeight:500,
                }}>{nights}n</span>
              )}
              {st === "booked_full" && (
                <span style={{
                  position:"absolute", bottom: mobile ? 2 : 3, left:"50%", transform:"translateX(-50%)",
                  fontSize:8, color:C.redMid, lineHeight:1,
                }}>✕</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap: mobile ? 8 : 12, marginTop: mobile ? 10 : 14, flexWrap:"wrap" }}>
        {[
          [C.cream,        C.sand,   "Available"],
          ["#eee8da",      C.clay,   "Valid check-out"],
          [C.redLight,     C.redMid, "Fully booked"],
          [C.earth,        C.earth,  "Selected"],
        ].map(([bg, border, label]) => (
          <span key={label} style={{ display:"flex", alignItems:"center", gap: mobile ? 4 : 5, fontSize: mobile ? 10 : 11, color:C.muted }}>
            <span style={{ width: mobile ? 8 : 10, height: mobile ? 8 : 10, borderRadius:"50%", background:bg, border:`1.5px solid ${border}`, display:"inline-block", flexShrink:0 }} />
            {label}
          </span>
        ))}
      </div>

      {(checkIn || checkOut) && (
        <div style={{ display:"flex", alignItems:"center", gap: mobile ? 6 : 8, marginTop: mobile ? 12 : 16, flexWrap:"wrap" }}>
          <div style={{ flex:1, background:C.cream, border:`1.5px solid ${checkIn ? C.earth : C.sand}`, borderRadius:8, padding: mobile ? "6px 10px" : "8px 12px", minWidth: mobile ? 80 : 100 }}>
            <span style={{ fontSize: mobile ? 9 : 10, letterSpacing:1, textTransform:"uppercase", color:C.muted, display:"block" }}>Check-in</span>
            <span style={{ fontSize: mobile ? 12 : 13, fontWeight:500, color: checkIn ? C.bark : C.clay, display:"block", marginTop:1 }}>
              {checkIn || "—"}
            </span>
          </div>
          <span style={{ color:C.clay, fontSize: mobile ? 12 : 14 }}>→</span>
          <div style={{ flex:1, background:C.cream, border:`1.5px solid ${checkOut ? C.earth : C.sand}`, borderRadius:8, padding: mobile ? "6px 10px" : "8px 12px", minWidth: mobile ? 80 : 100 }}>
            <span style={{ fontSize: mobile ? 9 : 10, letterSpacing:1, textTransform:"uppercase", color:C.muted, display:"block" }}>Check-out</span>
            <span style={{ fontSize: mobile ? 12 : 13, fontWeight:500, color: checkOut ? C.bark : C.clay, display:"block", marginTop:1 }}>
              {checkOut || "—"}
            </span>
          </div>
          <button
            style={{ background:"none", border:`1px solid ${C.sand}`, borderRadius:6, fontSize:13, color:C.muted, cursor:"pointer", padding: mobile ? "5px 8px" : "6px 10px", lineHeight:1 }}
            onClick={onClear}
          >✕</button>
        </div>
      )}
    </div>
  );
}

// ── Room Card (compact) ────────────────────────────────────────────────────────
function RoomCard({ room, selected, available, onSelect, nights, mobile }) {
  const [hovered, setHovered] = useState(false);
  const total = nights * room.price;

  // ★ Mobile: แนวตั้ง — รูปด้านบน เต็มกว้าง คอนเทนต์ด้านล่าง
  if (mobile) {
    return (
      <div
        style={{
          background: C.white,
          borderRadius: 12,
          overflow: "hidden",
          border: `1.5px solid ${selected ? C.earth : !available ? C.redMid : C.sand}`,
          cursor: available ? "pointer" : "not-allowed",
          opacity: available ? 1 : 0.55,
        }}
        onClick={() => available && onSelect(room.id)}
      >
        <div style={{ position:"relative", height:160, overflow:"hidden" }}>
          <img
            src={room.img} alt={room.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          {selected ? (
            <span style={{
              position:"absolute", top:10, right:10,
              fontSize:11, background:C.earth, color:C.white, padding:"3px 10px", borderRadius:20,
            }}>✓ Selected</span>
          ) : !available ? (
            <span style={{
              position:"absolute", top:10, right:10,
              fontSize:11, background:C.redLight, color:C.red, padding:"3px 10px", borderRadius:20,
            }}>Unavailable</span>
          ) : null}
          {nights > 0 && available && !selected && (
            <span style={{
              position:"absolute", bottom:10, right:10,
              fontSize:13, color:C.white, fontWeight:500, fontFamily:"'Cormorant Garamond',serif",
              background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
              padding:"3px 10px", borderRadius:8,
            }}>฿{total.toLocaleString()}</span>
          )}
        </div>
        <div style={{ padding:"12px 14px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, margin:"0 0 2px", color:C.bark }}>{room.name}</h3>
              <p style={{ fontSize:11, color:C.muted, margin:0, lineHeight:1.3 }}>{room.tagline}</p>
            </div>
            <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:C.earth, fontWeight:500 }}>฿{room.price.toLocaleString()}</span>
              <span style={{ fontSize:10, color:C.muted, display:"block" }}>/night</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 }}>
            {[`${room.size} m²`, room.beds, `Max ${room.capacity}`].map(m => (
              <span key={m} style={{ fontSize:10, color:C.muted, background:C.cream, border:`1px solid ${C.sand}`, padding:"2px 6px", borderRadius:4 }}>{m}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {room.amenities.slice(0,4).map(a => (
              <span key={a} style={{ fontSize:9, color:C.sage, background:"#f0f4ec", border:"1px solid #c8d5bf", padding:"2px 5px", borderRadius:4 }}>{a}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ★ Desktop: เหมือนเดิมทุกอย่าง
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        overflow: "hidden",
        border: `1.5px solid ${selected ? C.earth : !available ? C.redMid : hovered ? C.clay : C.sand}`,
        cursor: available ? "pointer" : "not-allowed",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        opacity: available ? 1 : 0.55,
        boxShadow: selected ? `0 0 0 3px ${C.clay}35` : hovered && available ? `0 4px 20px rgba(0,0,0,0.07)` : "none",
        transform: hovered && available && !selected ? "translateY(-2px)" : "none",
      }}
      onClick={() => available && onSelect(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display:"flex", gap:0 }}>
        <div style={{ width:130, flexShrink:0, overflow:"hidden" }}>
          <img
            src={room.img} alt={room.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform .4s", transform: hovered && available ? "scale(1.05)" : "scale(1)" }}
          />
        </div>
        <div style={{ padding:"14px 16px", flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6 }}>
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, margin:"0 0 3px", color:C.bark }}>{room.name}</h3>
              <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.4 }}>{room.tagline}</p>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:C.earth, fontWeight:500 }}>฿{room.price.toLocaleString()}</span>
              <span style={{ fontSize:11, color:C.muted, display:"block" }}>/night</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            {[`${room.size} m²`, room.beds, `Max ${room.capacity}`].map(m => (
              <span key={m} style={{ fontSize:11, color:C.muted, background:C.cream, border:`1px solid ${C.sand}`, padding:"2px 7px", borderRadius:4 }}>{m}</span>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {room.amenities.slice(0,3).map(a => (
                <span key={a} style={{ fontSize:10, color:C.sage, background:"#f0f4ec", border:"1px solid #c8d5bf", padding:"2px 6px", borderRadius:4 }}>{a}</span>
              ))}
              {room.amenities.length > 3 && <span style={{ fontSize:10, color:C.muted }}>+{room.amenities.length-3}</span>}
            </div>
            {selected ? (
              <span style={{ fontSize:11, background:C.earth, color:C.white, padding:"3px 10px", borderRadius:20, flexShrink:0, marginLeft:8 }}>✓ Selected</span>
            ) : !available ? (
              <span style={{ fontSize:11, background:C.redLight, color:C.red, padding:"3px 10px", borderRadius:20, flexShrink:0, marginLeft:8 }}>Unavailable</span>
            ) : nights > 0 ? (
              <span style={{ fontSize:12, color:C.earth, fontWeight:500, flexShrink:0, marginLeft:8, fontFamily:"'Cormorant Garamond',serif" }}>฿{total.toLocaleString()} total</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function BookingRoom() {
  const [checkIn,       setCheckIn]       = useState(null);
  const [checkOut,      setCheckOut]      = useState(null);
  const [selectedRoom,  setSelectedRoom]  = useState(null);
  const [guests,        setGuests]        = useState(1);
  const [step,          setStep]          = useState("select");
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [note,          setNote]          = useState("");

  const M = useIsMobile(900);

  const room   = ROOMS.find(r => r.id === selectedRoom);
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return nightsBetween(checkIn, checkOut);
  }, [checkIn, checkOut]);
  const total = room ? nights * room.price : 0;

  const availableRooms = useMemo(() => {
    if (!checkIn) return ROOMS;
    const effectiveOut = checkOut || nextDayKey(checkIn);
    return ROOMS.filter(r => isRoomAvailForRange(r, checkIn, effectiveOut));
  }, [checkIn, checkOut]);

  const availableRoomIds = new Set(availableRooms.map(r => r.id));

  function handleDateSelect(key) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key); setCheckOut(null);
      if (selectedRoom) {
        const r = ROOMS.find(x => x.id === selectedRoom);
        if (r && !isRoomAvail(r, key)) setSelectedRoom(null);
      }
    } else {
      if (key <= checkIn) { setCheckIn(key); setCheckOut(null); return; }
      if (room && !isRoomAvailForRange(room, checkIn, key)) { setCheckIn(key); setCheckOut(null); return; }
      setCheckOut(key);
      const avail = ROOMS.filter(r => isRoomAvailForRange(r, checkIn, key));
      if (avail.length === 1) setSelectedRoom(avail[0].id);
      else if (selectedRoom && !avail.some(r => r.id === selectedRoom)) setSelectedRoom(null);
    }
  }

  function handleRoomSelect(id) {
    if (checkIn && !availableRoomIds.has(id)) return;
    setSelectedRoom(prev => prev === id ? null : id);
  }

  const canBook = selectedRoom && checkIn && checkOut && nights > 0 && availableRoomIds.has(selectedRoom);

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div style={{ ...S.root, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding: M ? "24px 16px" : undefined }}>
        <div style={{ maxWidth:460, width:"100%", padding: M ? "32px 16px" : "40px 24px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 44 : 56, color:C.earth, marginBottom: M ? 12 : 16 }}>✦</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 28 : 36, fontWeight:300, color:C.bark, margin:"0 0 10px" }}>Reservation Confirmed</h1>
          <p style={{ fontSize: M ? 14 : 15, color:C.muted, lineHeight:1.7, margin:"0 0 24px" }}>
            Thank you, <em style={{ color:C.bark }}>{name}</em>. A confirmation will be sent to <em style={{ color:C.bark }}>{email}</em>.
          </p>
          <div style={{ background:C.white, border:`1.5px solid ${C.sand}`, borderRadius:12, padding: M ? "16px" : "20px 24px", textAlign:"left", marginBottom: M ? 20 : 28 }}>
            {[["Room",room?.name],["Check-in",checkIn],["Check-out",checkOut],["Guests",guests],["Nights",nights]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize: M ? 13 : 14, padding:"4px 0", borderBottom:`1px solid ${C.cream}` }}>
                <span style={{ color:C.muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 2px", marginTop:4 }}>
              <span style={{ fontWeight:500 }}>Total</span>
              <strong style={{ color:C.earth, fontSize: M ? 16 : 18 }}>฿{total.toLocaleString()}</strong>
            </div>
          </div>
          <button style={{ ...S.btnPrimary, width:"100%" }} onClick={() => { setStep("select"); setCheckIn(null); setCheckOut(null); setSelectedRoom(null); setName(""); setEmail(""); }}>
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div style={S.root}>
        <div style={{ maxWidth: M ? "100%" : 860, margin:"0 auto", padding: M ? "20px 16px 60px" : "40px 24px 80px" }}>
          <button style={{ background:"none", border:"none", fontSize:14, color:C.earth, cursor:"pointer", padding:0, marginBottom: M ? 20 : 28, fontFamily:"'DM Sans',sans-serif" }} onClick={() => setStep("select")}>
            ← Back
          </button>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 30 : 40, fontWeight:300, margin:"0 0 24px", color:C.bark }}>
            Complete Your <em>Reservation</em>
          </h1>
          {/* ★ Mobile: single column */}
          <div style={{ display:"grid", gridTemplateColumns: M ? "1fr" : "1fr 1fr", gap: M ? 20 : 40, alignItems:"start" }}>
            <div style={{ background:C.white, borderRadius:12, border:`1.5px solid ${C.sand}`, overflow:"hidden" }}>
              <img src={room?.img} alt={room?.name} style={{ width:"100%", height: M ? 180 : 160, objectFit:"cover", display:"block" }} />
              <div style={{ padding: M ? "14px 16px" : "16px 20px 20px" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 18 : 20, fontWeight:400, margin:"0 0 12px", color:C.bark }}>{room?.name}</h3>
                {[["Check-in",checkIn],["Check-out",checkOut],["Guests",guests],["Duration",`${nights} night${nights>1?"s":""}`],["Rate",`฿${room?.price.toLocaleString()}/night`]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize: M ? 12 : 13, padding:"4px 0", borderBottom:`1px solid ${C.cream}` }}>
                    <span style={{ color:C.muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0" }}>
                  <span style={{ fontWeight:500 }}>Total</span>
                  <strong style={{ color:C.earth, fontSize: M ? 16 : 18 }}>฿{total.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 18 : 20, fontWeight:400, color:C.bark, margin:"0 0 16px" }}>Guest Information</h3>
              {[
                { label:"Full name *",     val:name,  set:setName,  type:"text",  ph:"Your full name" },
                { label:"Email address *", val:email, set:setEmail, type:"email", ph:"your@email.com" },
                { label:"Phone number",    val:phone, set:setPhone, type:"tel",   ph:"+66 8x xxxx xxxx" },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: M ? 10 : 14 }}>
                  <label style={{ fontSize:11, letterSpacing:1.2, textTransform:"uppercase", color:C.muted, display:"block", marginBottom:4 }}>{f.label}</label>
                  <input type={f.type} value={f.val} placeholder={f.ph} onChange={e => f.set(e.target.value)} style={S.input} />
                </div>
              ))}
              <div style={{ marginBottom: M ? 14 : 18 }}>
                <label style={{ fontSize:11, letterSpacing:1.2, textTransform:"uppercase", color:C.muted, display:"block", marginBottom:4 }}>Special requests</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Dietary needs, arrival time, special occasions…" style={{ ...S.input, height:72, resize:"vertical" }} />
              </div>
              <div style={{ fontSize:12, color:C.muted, background:C.cream, borderRadius:6, padding:"10px 12px", marginBottom: M ? 14 : 18, lineHeight:1.6 }}>
                Full refund if cancelled 7+ days before check-in.
              </div>
              <button
                style={{ ...S.btnPrimary, width:"100%", opacity: name && email ? 1 : 0.45, cursor: name && email ? "pointer" : "not-allowed" }}
                disabled={!name || !email}
                onClick={() => (name && email) && setStep("done")}
              >
                Confirm Reservation — ฿{total.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SELECT ────────────────────────────────────────────────────────────────
  const roomsToShow = ROOMS;
  const calTitle = !checkIn
    ? "All rooms · Select your check-in date"
    : !checkOut
      ? "Select your check-out date"
      : selectedRoom
        ? `${room?.name} · ${nights} night${nights>1?"s":""}`
        : `${availableRooms.length} room${availableRooms.length!==1?"s":""} available · ${nights} night${nights>1?"s":""}`;

  return (
    <div style={S.root}>
      {/* ── Hero ── */}
      <div style={{
        position:"relative",
        height: M ? 200 : 280,
        overflow:"hidden",
        background:`url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80') center/cover no-repeat`,
      }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(25,18,10,0.38) 0%,rgba(25,18,10,0.72) 100%)" }} />
        <div style={{
          position:"relative", zIndex:1,
          padding: M ? "32px 20px 0" : "52px 48px 0",
          maxWidth: M ? "100%" : 880,
        }}>
          <div style={{ fontSize: M ? 10 : 11, letterSpacing: M ? 3 : 4, textTransform:"uppercase", color:C.clay, marginBottom: M ? 6 : 10 }}>Hey Now · Chiang Dao</div>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize: M ? 34 : 52,
            fontWeight:300, lineHeight:1.1, color:C.white,
            margin:"0 0 6px",
          }}>
            Reserve Your <em>Sanctuary</em>
          </h1>
          <p style={{ fontSize: M ? 13 : 14, color:"rgba(255,255,255,0.65)", margin:0 }}>Pick a date to see which rooms are available</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: M ? "100%" : 1160, margin:"0 auto", padding: M ? "24px 16px 60px" : "40px 24px 80px" }}>

        {/* ── Step bar ── */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom: M ? 24 : 36 }}>
          {[
            { n:1, label:"Select dates", done: !!(checkIn && checkOut) },
            { n:2, label:"Choose a room", done: !!selectedRoom },
            { n:3, label:"Guest details", done: false },
          ].map((s,i) => (
            <div key={s.n} style={{ display:"flex", alignItems:"center", gap: M ? 6 : 10 }}>
              <div style={{
                width: M ? 26 : 30, height: M ? 26 : 30, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: M ? 11 : 12, fontWeight:500, transition:"all .2s",
                border:`1.5px solid ${s.done ? C.sage : i===0 && !checkIn ? C.earth : C.clay}`,
                background: s.done ? C.sage : i===0 && !checkIn ? C.earth : "transparent",
                color: s.done || (i===0 && !checkIn) ? C.white : C.muted,
              }}>
                {s.done ? "✓" : s.n}
              </div>
              <span style={{ fontSize: M ? 12 : 13, color: s.done ? C.bark : C.muted }}>{s.label}</span>
              {i < 2 && <div style={{ width: M ? 24 : 40, height:1, background:C.sand, margin:"0 6px" }} />}
            </div>
          ))}
        </div>

        {/* ★ Desktop: 2 columns (เหมือนเดิม 100%)
            ★ Mobile:  1 column — ปฏิทินขึ้นก่อน ห้องด้านล่าง */}
        <div style={{ display:"grid", gridTemplateColumns: M ? "1fr" : "400px 1fr", gap: M ? 20 : 40, alignItems:"start" }}>

          {/* LEFT — Calendar */}
          <div style={{ position: M ? "relative" : "sticky", top: M ? 0 : 24 }}>
            <div style={{ ...S.widget, padding: M ? "16px" : "20px" }}>
              <div style={{ marginBottom: M ? 12 : 16 }}>
                <p style={{ ...S.widgetTitle, fontSize: M ? 15 : 17, marginBottom: M ? 3 : 4 }}>{calTitle}</p>
                {!checkIn && (
                  <p style={{ fontSize: M ? 11 : 12, color:C.muted, margin:0, lineHeight:1.5 }}>
                    Dates in <span style={{ color:C.bark }}>cream</span> have available rooms · <span style={{ color:C.red }}>red</span> = fully booked
                  </p>
                )}
                {checkIn && !checkOut && (
                  <p style={{ fontSize: M ? 11 : 12, color:C.muted, margin:0, lineHeight:1.5 }}>
                    <span style={{ color:C.bark }}>Highlighted</span> dates are valid check-outs
                  </p>
                )}
              </div>
              <AvailabilityCalendar
                selectedRoomId={selectedRoom}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectDate={handleDateSelect}
                onClear={() => { setCheckIn(null); setCheckOut(null); setSelectedRoom(null); }}
                mobile={M}
              />
            </div>

            {/* Guests */}
            {checkIn && (
              <div style={{ ...S.widget, marginTop: M ? 12 : 14, padding: M ? "14px 16px" : "20px" }}>
                <p style={{ ...S.widgetTitle, fontSize: M ? 15 : 17, marginBottom: M ? 8 : 14 }}>Guests</p>
                <div style={{ display:"flex", alignItems:"center", gap: M ? 12 : 16 }}>
                  <button style={S.counterBtn} onClick={() => setGuests(Math.max(1, guests-1))}>−</button>
                  <span style={{ fontSize: M ? 14 : 15, fontWeight:500, color:C.bark, minWidth: M ? 60 : 80, textAlign:"center" }}>
                    {guests} {guests===1?"guest":"guests"}
                  </span>
                  <button style={S.counterBtn} onClick={() => setGuests(Math.min(room?.capacity||3, guests+1))}>+</button>
                </div>
                {room && guests > room.capacity && (
                  <p style={{ fontSize:12, color:C.red, marginTop:6, marginBottom:0 }}>Max {room.capacity} guests</p>
                )}
              </div>
            )}

            {/* Price summary */}
            {canBook && (
              <div style={{ ...S.widget, marginTop: M ? 12 : 14, padding: M ? "14px 16px" : "20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize: M ? 13 : 14, color:C.muted, padding:"3px 0" }}>
                  <span>฿{room?.price.toLocaleString()} × {nights} night{nights>1?"s":""}</span>
                  <span style={{ color:C.charcoal }}>฿{total.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:500, borderTop:`1px solid ${C.sand}`, marginTop:6, paddingTop:6 }}>
                  <span>Total</span>
                  <span style={{ color:C.earth, fontSize: M ? 16 : 18 }}>฿{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* CTA button */}
            <button
              style={{
                ...S.btnPrimary, width:"100%", marginTop: M ? 12 : 14,
                opacity: canBook ? 1 : 0.45,
                cursor: canBook ? "pointer" : "not-allowed",
                padding: M ? "12px 16px" : "14px 24px",
                fontSize: M ? 13 : 14,
              }}
              disabled={!canBook}
              onClick={() => setStep("confirm")}
            >
              {!checkIn
                ? "Select dates to begin"
                : !checkOut
                  ? "Select check-out date"
                  : !selectedRoom
                    ? "Choose a room below"
                    : `Reserve ${room?.name} →`}
            </button>
          </div>

          {/* RIGHT — Rooms */}
          <div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: M ? 12 : 16 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: M ? 22 : 26, fontWeight:400, color:C.bark, margin:0 }}>
                {checkIn && checkOut
                  ? `${availableRooms.length} room${availableRooms.length!==1?"s":""} available`
                  : checkIn
                    ? `${availableRooms.length} room${availableRooms.length!==1?"s":""} available`
                    : "Our Accommodations"}
              </h2>
              {checkIn && checkOut && (
                <span style={{ fontSize: M ? 11 : 12, color:C.muted }}>{checkIn} → {checkOut}</span>
              )}
            </div>

            {/* Hint — Desktop only */}
            {!checkIn && !M && (
              <div style={{ background:C.white, border:`1.5px solid ${C.sand}`, borderRadius:10, padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:20, lineHeight:1 }}>📅</span>
                <div>
                  <p style={{ fontSize:14, color:C.bark, margin:"0 0 3px", fontWeight:500 }}>Start by selecting your dates</p>
                  <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.5 }}>
                    Pick check-in &amp; check-out on the calendar — only rooms available for your entire stay will be shown as bookable.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap: M ? 12 : 14 }}>
              {roomsToShow.map(r => (
                <RoomCard
                  key={r.id}
                  room={r}
                  selected={selectedRoom === r.id}
                  available={!checkIn || availableRoomIds.has(r.id)}
                  onSelect={handleRoomSelect}
                  nights={nights}
                  mobile={M}
                />
              ))}
            </div>

            {checkIn && availableRooms.length === 0 && (
              <div style={{ background:C.redLight, border:`1.5px solid ${C.redMid}`, borderRadius:10, padding: M ? "14px 16px" : "16px 20px", marginTop:8, textAlign:"center" }}>
                <p style={{ fontSize: M ? 13 : 14, color:C.red, margin:"0 0 3px", fontWeight:500 }}>No rooms available for these dates</p>
                <p style={{ fontSize: M ? 12 : 13, color:"#a05050", margin:0 }}>Please select different dates on the calendar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop:`1px solid ${C.sand}`, padding: M ? "16px 20px" : "20px 48px", textAlign:"center", background:C.white }}>
        <p style={{ fontSize: M ? 12 : 13, color:C.muted, margin:"0 0 2px" }}>Hey Now Chiang Dao Stay · เชียงดาว, เชียงใหม่ · +66 8x xxx xxxx</p>
        <p style={{ fontSize: M ? 11 : 12, color:C.clay, margin:0 }}>For groups of 5+ or special requests, please contact us directly.</p>
      </div>
    </div>
  );
}

// ── Shared styles (เหมือนเดิม 100%) ──────────────────────────────────────────
const S = {
  root: { fontFamily:"'DM Sans',sans-serif", background:C.cream, minHeight:"100vh", color:C.charcoal },
  widget: { background:C.white, border:`1.5px solid ${C.sand}`, borderRadius:12, padding:"20px" },
  widgetTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontWeight:400, color:C.bark, margin:"0 0 14px" },
  calNav: {
    background:"none", border:`1px solid ${C.clay}`, borderRadius:6,
    width:30, height:30, fontSize:16, cursor:"pointer", color:C.earth,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  calDay: {
    position:"relative", fontSize:13, height:36, borderRadius:6,
    border:"none", cursor:"pointer", transition:"background .12s, color .12s",
    display:"flex", alignItems:"center", justifyContent:"center",
    background:C.cream, color:C.charcoal,
  },
  counterBtn: {
    width:32, height:32, borderRadius:"50%", border:`1.5px solid ${C.clay}`,
    background:"none", fontSize:18, cursor:"pointer", color:C.earth,
    display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1,
  },
  btnPrimary: {
    background:C.earth, color:C.white, border:"none", borderRadius:10,
    padding:"14px 24px", fontSize:14, fontFamily:"'DM Sans',sans-serif",
    fontWeight:500, letterSpacing:0.5, cursor:"pointer", textAlign:"center",
    transition:"background .2s",
  },
  input: {
    width:"100%", boxSizing:"border-box", background:C.white,
    border:`1.5px solid ${C.sand}`, borderRadius:8, padding:"10px 14px",
    fontSize:14, color:C.charcoal, fontFamily:"'DM Sans',sans-serif", outline:"none",
  },
};