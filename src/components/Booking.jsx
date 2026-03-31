import { useState, useMemo } from "react";

// ── Google Fonts: Cormorant Garamond (display) + DM Sans (UI) ─────────────────
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";

// ── Mock room data ─────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: "lanna-suite",
    name: "Lanna Suite",
    tagline: "Hilltop sanctuary with panoramic Doi Luang views",
    price: 4800,
    capacity: 2,
    size: 48,
    beds: "1 King",
    img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    amenities: ["Private plunge pool", "Outdoor terrace", "Rain shower", "Minibar", "Bluetooth speaker"],
    bookedDates: [
      "2025-04-03","2025-04-04","2025-04-05",
      "2025-04-10","2025-04-11",
      "2025-04-18","2025-04-19","2025-04-20",
    ],
  },
  {
    id: "garden-villa",
    name: "Garden Villa",
    tagline: "Secluded bamboo villa nestled in tropical garden",
    price: 3200,
    capacity: 3,
    size: 56,
    beds: "1 King + Daybed",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["Private garden", "Outdoor bathtub", "Hammock", "Nespresso machine", "Yoga mat"],
    bookedDates: [
      "2025-04-01","2025-04-02",
      "2025-04-14","2025-04-15","2025-04-16",
      "2025-04-22","2025-04-23",
    ],
  },
  {
    id: "mountain-retreat",
    name: "Mountain Retreat",
    tagline: "Barefoot luxury in a handcrafted teak bungalow",
    price: 2600,
    capacity: 2,
    size: 36,
    beds: "1 Queen",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    amenities: ["Forest-view deck", "Outdoor shower", "Campfire kit", "Artisan toiletries", "Telescope"],
    bookedDates: [
      "2025-04-06","2025-04-07","2025-04-08",
      "2025-04-25","2025-04-26","2025-04-27",
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ── Calendar Component ─────────────────────────────────────────────────────────
function Calendar({ bookedDates, checkIn, checkOut, onSelect }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay    = new Date(view.year, view.month, 1).getDay();

  function handleDay(d) {
    const key  = toKey(view.year, view.month, d);
    const date = new Date(view.year, view.month, d);
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < midnight || bookedDates.includes(key)) return;
    onSelect(key);
  }

  function prevMonth() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function nextMonth() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  function dayState(d) {
    const key  = toKey(view.year, view.month, d);
    const date = new Date(view.year, view.month, d);
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < midnight)          return "past";
    if (bookedDates.includes(key)) return "booked";
    if (key === checkIn)           return "checkin";
    if (key === checkOut)          return "checkout";
    if (checkIn && checkOut && key > checkIn && key < checkOut) return "range";
    return "available";
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <button style={S.calNav} onClick={prevMonth}>‹</button>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, color:C.bark }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button style={S.calNav} onClick={nextMonth}>›</button>
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {DAYS.map(d => (
          <div key={d} style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", color:C.muted, textAlign:"center", paddingBottom:8 }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const st = dayState(d);
          const base = S.calDay;
          const extra = {
            past:      { background:"transparent", color:"#d0c8be", cursor:"not-allowed" },
            booked:    { background:"#f7f0ed", color:"#d4b8b0", cursor:"not-allowed", textDecoration:"line-through" },
            checkin:   { background:C.earth, color:C.white, fontWeight:500, borderRadius:"8px 0 0 8px" },
            checkout:  { background:C.earth, color:C.white, fontWeight:500, borderRadius:"0 8px 8px 0" },
            range:     { background:`${C.clay}30`, color:C.bark, borderRadius:0 },
            available: { background:C.cream, color:C.charcoal },
          }[st] || {};
          return (
            <button key={d} style={{ ...base, ...extra }} onClick={() => handleDay(d)}>
              {d}
              {st === "booked" && (
                <span style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", width:3, height:3, borderRadius:"50%", background:"#c07070" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:14, marginTop:12, flexWrap:"wrap" }}>
        {[["#e8dccb","Available"],["#f7f0ed","Unavailable"],[C.earth,"Selected"]].map(([bg, label]) => (
          <span key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.muted }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:bg, border:`1px solid ${C.sand}`, display:"inline-block" }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Room Card ──────────────────────────────────────────────────────────────────
function RoomCard({ room, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...S.roomCard,
        borderColor: selected ? C.earth : hovered ? C.clay : C.sand,
        boxShadow: selected ? `0 0 0 3px ${C.clay}35` : hovered ? `0 4px 20px rgba(0,0,0,0.07)` : "none",
        transform: hovered && !selected ? "translateY(-2px)" : "none",
      }}
      onClick={() => onSelect(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position:"relative", height:200, overflow:"hidden" }}>
        <img src={room.img} alt={room.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform .4s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        {selected && (
          <div style={{ position:"absolute", top:12, right:12, background:C.earth, color:C.white, fontSize:10, letterSpacing:2, textTransform:"uppercase", padding:"4px 10px", borderRadius:4 }}>
            ✓ Selected
          </div>
        )}
      </div>

      <div style={{ padding:"16px 20px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
          <div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, margin:"0 0 4px", color:C.bark }}>{room.name}</h3>
            <p style={{ fontSize:13, color:C.muted, margin:0, lineHeight:1.5 }}>{room.tagline}</p>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:C.earth, fontWeight:500 }}>฿{room.price.toLocaleString()}</span>
            <span style={{ fontSize:12, color:C.muted, display:"block" }}>/night</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
          {[`${room.size} m²`, room.beds, `Up to ${room.capacity} guests`].map(m => (
            <span key={m} style={{ fontSize:12, color:C.muted, background:C.cream, border:`1px solid ${C.sand}`, padding:"3px 8px", borderRadius:4 }}>{m}</span>
          ))}
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {room.amenities.map(a => (
            <span key={a} style={{ fontSize:11, color:C.sage, background:"#f0f4ec", border:"1px solid #c8d5bf", padding:"3px 8px", borderRadius:4 }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main BookingPage ──────────────────────────────────────────────────────────
export default function BookingRoom() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn,  setCheckIn]  = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests]     = useState(1);
  const [step, setStep]         = useState("select"); // select | confirm | done
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note,  setNote]  = useState("");

  const room = ROOMS.find(r => r.id === selectedRoom);

  // Inject Google Fonts once
  if (typeof document !== "undefined" && !document.querySelector("#hn-fonts")) {
    const link = document.createElement("link");
    link.id = "hn-fonts"; link.rel = "stylesheet"; link.href = FONT_LINK;
    document.head.appendChild(link);
  }

  function handleDateSelect(key) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key); setCheckOut(null);
    } else {
      if (key <= checkIn) { setCheckIn(key); setCheckOut(null); }
      else {
        const blocked = room?.bookedDates.some(b => b > checkIn && b < key);
        if (blocked) { setCheckIn(key); setCheckOut(null); }
        else setCheckOut(key);
      }
    }
  }

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  }, [checkIn, checkOut]);

  const total    = room ? nights * room.price : 0;
  const canBook  = selectedRoom && checkIn && checkOut && nights > 0;

  function handleConfirm() {
    if (!name || !email) return;
    setStep("done");
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div style={{ ...S.root, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <div style={{ maxWidth:460, width:"100%", padding:"0 24px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:56, color:C.earth, marginBottom:16, lineHeight:1 }}>✦</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:C.bark, margin:"0 0 12px" }}>
            Reservation Confirmed
          </h1>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, margin:"0 0 32px" }}>
            Thank you, <em style={{ color:C.bark }}>{name}</em>. A confirmation will be sent to{" "}
            <em style={{ color:C.bark }}>{email}</em>.
          </p>
          <div style={{ background:C.white, border:`1.5px solid ${C.sand}`, borderRadius:12, padding:"20px 24px", textAlign:"left", marginBottom:28 }}>
            {[["Room", room?.name],["Check-in", checkIn],["Check-out", checkOut],["Guests", guests]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14, padding:"5px 0" }}>
                <span style={{ color:C.muted }}>{k}</span><strong style={{ color:C.charcoal }}>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, padding:"12px 0 5px", borderTop:`1px solid ${C.sand}`, marginTop:8 }}>
              <span style={{ fontWeight:500 }}>Total</span>
              <strong style={{ color:C.earth, fontSize:18 }}>฿{total.toLocaleString()}</strong>
            </div>
          </div>
          <button style={S.btnPrimary} onClick={() => { setStep("select"); setSelectedRoom(null); setCheckIn(null); setCheckOut(null); setName(""); setEmail(""); }}>
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
        <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px 80px" }}>
          <button style={{ background:"none", border:"none", fontSize:14, color:C.earth, cursor:"pointer", padding:0, marginBottom:28, fontFamily:"'DM Sans',sans-serif" }} onClick={() => setStep("select")}>
            ← Back to rooms
          </button>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:40, fontWeight:300, margin:"0 0 36px", color:C.bark }}>
            Complete Your <em>Reservation</em>
          </h1>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
            {/* Summary */}
            <div style={{ background:C.white, borderRadius:12, border:`1.5px solid ${C.sand}`, overflow:"hidden" }}>
              <img src={room?.img} alt={room?.name} style={{ width:"100%", height:180, objectFit:"cover", display:"block" }} />
              <div style={{ padding:"16px 20px 20px" }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, margin:"0 0 14px", color:C.bark }}>{room?.name}</h3>
                {[["Check-in", checkIn],["Check-out", checkOut],["Guests", guests],["Duration", `${nights} night${nights > 1?"s":""}`],["Rate", `฿${room?.price.toLocaleString()}/night`]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14, padding:"5px 0", borderBottom:`1px solid ${C.cream}` }}>
                    <span style={{ color:C.muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, padding:"12px 0 0", marginTop:4 }}>
                  <span style={{ fontWeight:500 }}>Total</span>
                  <strong style={{ color:C.earth, fontSize:20 }}>฿{total.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:C.bark, margin:"0 0 20px" }}>
                Guest Information
              </h3>
              {[
                { label:"Full name *",      val:name,  set:setName,  type:"text",  ph:"Your full name" },
                { label:"Email address *",  val:email, set:setEmail, type:"email", ph:"your@email.com" },
                { label:"Phone number",     val:phone, set:setPhone, type:"tel",   ph:"+66 8x xxxx xxxx" },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, letterSpacing:1.2, textTransform:"uppercase", color:C.muted, display:"block", marginBottom:6 }}>{f.label}</label>
                  <input
                    type={f.type} value={f.val} placeholder={f.ph}
                    onChange={e => f.set(e.target.value)}
                    style={S.input}
                  />
                </div>
              ))}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, letterSpacing:1.2, textTransform:"uppercase", color:C.muted, display:"block", marginBottom:6 }}>Special requests</label>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Dietary needs, arrival time, special occasions…"
                  style={{ ...S.input, height:80, resize:"vertical" }}
                />
              </div>
              <div style={{ fontSize:12, color:C.muted, background:C.cream, borderRadius:6, padding:"10px 12px", marginBottom:20, lineHeight:1.6 }}>
                By confirming, you agree to our cancellation policy: full refund if cancelled 7+ days before check-in.
              </div>
              <button
                style={{ ...S.btnPrimary, width:"100%", opacity: name && email ? 1 : 0.45, cursor: name && email ? "pointer" : "not-allowed" }}
                disabled={!name || !email}
                onClick={handleConfirm}
              >
                Confirm Reservation — ฿{total.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SELECT (main) ──────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      {/* Hero */}
      <div style={{ position:"relative", height:320, overflow:"hidden", background:`url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80') center/cover no-repeat` }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(25,18,10,0.4) 0%, rgba(25,18,10,0.72) 100%)" }} />
        <div style={{ position:"relative", zIndex:1, padding:"60px 48px 0", maxWidth:900 }}>
          <div style={{ fontSize:11, letterSpacing:4, textTransform:"uppercase", color:C.clay, marginBottom:10 }}>Hey Now · Chiang Dao</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:58, fontWeight:300, lineHeight:1.1, color:C.white, margin:"0 0 12px" }}>
            Reserve Your<br /><em>Sanctuary</em>
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.68)", fontWeight:300, margin:0 }}>
            Handcrafted stays among misty mountains &amp; ancient forests
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 24px 80px" }}>
        {/* Step indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:48 }}>
          {["Choose Room","Pick Dates","Guest Details"].map((s, i) => {
            const done  = (i===0 && selectedRoom) || (i===1 && checkIn && checkOut);
            const active = (i===0 && !selectedRoom) || (i===1 && selectedRoom && !checkOut) || (i===2 && canBook);
            return (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:500, transition:"all .2s",
                  border:`1.5px solid ${done ? C.sage : active ? C.earth : C.clay}`,
                  background: done ? C.sage : active ? C.earth : C.cream,
                  color: done || active ? C.white : C.muted,
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize:13, color: active ? C.bark : C.muted }}>{s}</span>
                {i < 2 && <div style={{ width:48, height:1, background:C.clay, margin:"0 10px" }} />}
              </div>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:48, alignItems:"start" }}>
          {/* LEFT — Rooms */}
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:400, color:C.bark, margin:"0 0 20px" }}>
              Our Accommodations
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {ROOMS.map(r => (
                <RoomCard key={r.id} room={r} selected={selectedRoom === r.id} onSelect={setSelectedRoom} />
              ))}
            </div>
          </div>

          {/* RIGHT — Sticky panel */}
          <div style={{ position:"sticky", top:24, display:"flex", flexDirection:"column", gap:16 }}>
            {/* Guests */}
            <div style={S.widget}>
              <p style={S.widgetTitle}>Guests</p>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <button style={S.counterBtn} onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                <span style={{ fontSize:15, fontWeight:500, color:C.bark, minWidth:80, textAlign:"center" }}>
                  {guests} {guests === 1 ? "guest" : "guests"}
                </span>
                <button style={S.counterBtn} onClick={() => setGuests(Math.min(room?.capacity || 3, guests + 1))}>+</button>
              </div>
              {room && guests > room.capacity && (
                <p style={{ fontSize:12, color:"#b85c5c", marginTop:8, marginBottom:0 }}>Max {room.capacity} guests for this room</p>
              )}
            </div>

            {/* Calendar */}
            <div style={S.widget}>
              <p style={S.widgetTitle}>
                {!selectedRoom ? "Availability Calendar" : !checkIn ? "Select check-in date" : !checkOut ? "Select check-out date" : `${nights} night${nights>1?"s":""} selected`}
              </p>
              {selectedRoom ? (
                <Calendar
                  bookedDates={room?.bookedDates || []}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelect={handleDateSelect}
                />
              ) : (
                <p style={{ fontSize:13, color:C.muted, fontStyle:"italic", textAlign:"center", padding:"24px 0", margin:0 }}>
                  Select a room to view availability
                </p>
              )}
              {checkIn && checkOut && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1, background:C.cream, border:`1.5px solid ${C.earth}`, borderRadius:8, padding:"8px 12px" }}>
                    <span style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", color:C.muted, display:"block" }}>Check-in</span>
                    <span style={{ fontSize:13, fontWeight:500, color:C.bark, display:"block", marginTop:2 }}>{checkIn}</span>
                  </div>
                  <span style={{ color:C.clay }}>→</span>
                  <div style={{ flex:1, background:C.cream, border:`1.5px solid ${C.earth}`, borderRadius:8, padding:"8px 12px" }}>
                    <span style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", color:C.muted, display:"block" }}>Check-out</span>
                    <span style={{ fontSize:13, fontWeight:500, color:C.bark, display:"block", marginTop:2 }}>{checkOut}</span>
                  </div>
                  <button style={{ background:"none", border:"none", fontSize:14, color:C.muted, cursor:"pointer", padding:"4px 6px" }} onClick={() => { setCheckIn(null); setCheckOut(null); }}>✕</button>
                </div>
              )}
            </div>

            {/* Price summary */}
            {canBook && (
              <div style={S.widget}>
                <p style={S.widgetTitle}>Price Summary</p>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, padding:"4px 0" }}>
                  <span style={{ color:C.muted }}>฿{room?.price.toLocaleString()} × {nights} night{nights>1?"s":""}</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:500, borderTop:`1px solid ${C.sand}`, marginTop:8, paddingTop:8 }}>
                  <span>Total</span>
                  <span style={{ color:C.earth, fontSize:18 }}>฿{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              style={{ ...S.btnPrimary, width:"100%", opacity: canBook ? 1 : 0.46, cursor: canBook ? "pointer" : "not-allowed" }}
              disabled={!canBook}
              onClick={() => setStep("confirm")}
            >
              {!selectedRoom
                ? "Select a room to begin"
                : !checkIn
                  ? "Choose your check-in date"
                  : !checkOut
                    ? "Choose your check-out date"
                    : "Continue to Guest Details →"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.sand}`, padding:"24px 48px", textAlign:"center", background:C.white }}>
        <p style={{ fontSize:13, color:C.muted, margin:"0 0 4px" }}>Hey Now Chiang Dao Stay · เชียงดาว, เชียงใหม่ · +66 8x xxx xxxx</p>
        <p style={{ fontSize:12, color:C.clay, margin:0 }}>For groups of 5+ or special requests, please contact us directly.</p>
      </div>
    </div>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cream:    "#f9f4ec",
  sand:     "#e8dccb",
  clay:     "#c9b89a",
  earth:    "#8b6f47",
  bark:     "#5c4429",
  charcoal: "#2a2520",
  sage:     "#7a8c6e",
  white:    "#ffffff",
  muted:    "#9a8b7a",
};

// ── Shared style atoms ─────────────────────────────────────────────────────────
const S = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: C.cream,
    minHeight: "100vh",
    color: C.charcoal,
  },
  widget: {
    background: C.white,
    border: `1.5px solid ${C.sand}`,
    borderRadius: 12,
    padding: "20px",
  },
  widgetTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 17, fontWeight: 400,
    color: C.bark, margin: "0 0 14px",
  },
  calNav: {
    background: "none",
    border: `1px solid ${C.clay}`,
    borderRadius: 6,
    width: 30, height: 30,
    fontSize: 16,
    cursor: "pointer",
    color: C.earth,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calDay: {
    position: "relative",
    fontSize: 13, fontWeight: 400,
    height: 36,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    transition: "background .15s, color .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.cream,
    color: C.charcoal,
  },
  counterBtn: {
    width: 32, height: 32,
    borderRadius: "50%",
    border: `1.5px solid ${C.clay}`,
    background: "none",
    fontSize: 18,
    cursor: "pointer",
    color: C.earth,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  roomCard: {
    background: C.white,
    borderRadius: 12,
    overflow: "hidden",
    border: `1.5px solid ${C.sand}`,
    cursor: "pointer",
    transition: "transform .2s, box-shadow .2s, border-color .2s",
  },
  btnPrimary: {
    background: C.earth,
    color: C.white,
    border: "none",
    borderRadius: 10,
    padding: "15px 24px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    letterSpacing: 0.5,
    cursor: "pointer",
    transition: "background .2s",
    textAlign: "center",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: C.white,
    border: `1.5px solid ${C.sand}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: C.charcoal,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  },
};