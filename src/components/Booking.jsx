import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import {
  CalendarDays, MapPin, Users, CheckCircle, ChevronLeft, ChevronRight,
  Minus, Plus, Phone, Mail, MessageSquare, Sun, Moon, Sparkles,
 Bed, Baby, Wifi, Coffee, Bath, ShieldCheck, Home, ArrowRight
} from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  th: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],
  cn: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
};
const DAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
  cn: ["日", "一", "二", "三", "四", "五", "六"],
};

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

const generateBookedDates = () => {
  const dates = new Set();
  const today = new Date();
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
    id: "lanna-suite", name: "Lanna Suite", nameTh: "ลานนาสวีท",
    tagline: "Hilltop sanctuary with panoramic mountain views",
    taglineTh: "ที่พักบนเนินเขาพร้อมวิวภูเขาแบบพาโนรามา",
    price: 4800, capacity: 2, maxKids: 1, size: 48,
    beds: "1 King Bed", bedsTh: "เตียงคิงไซส์ 1 เตียง",
    img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    amenities: ["Private Pool", "Mountain View", "Rain Shower"],
    amenitiesTh: ["สระว่ายน้ำส่วนตัว", "วิวภูเขา", "ฝักบัวเรนชาเวอร์"],
    bookedDates: generateBookedDates()
  },
  {
    id: "garden-villa", name: "Garden Villa", nameTh: "การ์เด้นวิลล่า",
    tagline: "Secluded bamboo villa in tropical gardens",
    taglineTh: "วิลล่าไผ่ส่วนตัวในสวนเขตร้อน",
    price: 3200, capacity: 3, maxKids: 2, size: 56,
    beds: "1 King + Daybed", bedsTh: "เตียงคิงไซส์ + เดย์เบด",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["Private Garden", "Outdoor Bath", "Hammock"],
    amenitiesTh: ["สวนส่วนตัว", "อ่างอาบน้ำกลางแจ้ง", "เปลญวน"],
    bookedDates: generateBookedDates()
  },
  {
    id: "mountain-retreat", name: "Mountain Retreat", nameTh: "เมาน์เทนรีทรีท",
    tagline: "Handcrafted teak bungalow",
    taglineTh: "บังกะโลไม้สักทำมือ",
    price: 2600, capacity: 2, maxKids: 1, size: 36,
    beds: "1 Queen Bed", bedsTh: "เตียงควีนไซส์ 1 เตียง",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    amenities: ["Forest Deck", "Outdoor Shower", "Fire Pit"],
    amenitiesTh: ["ดาดฟ้าป่า", "อาบน้ำกลางแจ้ง", "หลุมไฟ"],
    bookedDates: generateBookedDates()
  }
];

const stepLabels = {
  en: ["Dates", "Room", "Details", "Review"],
  th: ["วันที่", "ห้อง", "รายละเอียด", "ยืนยัน"],
  cn: ["日期", "房间", "详情", "确认"],
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const slideUp = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

export default function BookingRoom() {
  const { lang, content } = useLanguage();
  const monthLabels = MONTHS[lang] || MONTHS.en;
  const dayLabels = DAYS[lang] || DAYS.en;
  const labels = stepLabels[lang] || stepLabels.en;
  const t = content?.booking || {};

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
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const topRef = useRef(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const langIsTh = lang === 'th';

  const isRoomAvailable = useCallback((room, startKey, endKey) => {
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
  }, []);

  const availableRooms = useMemo(() => {
    if (!checkIn || !checkOut) return ROOMS;
    return ROOMS.filter(r => isRoomAvailable(r, checkIn, checkOut));
  }, [checkIn, checkOut, isRoomAvailable]);

  const totalNights = nightsBetween(checkIn, checkOut);
  const selectedRoomData = ROOMS.find(r => r.id === selectedRoom);
  const totalPrice = selectedRoomData ? (totalNights * selectedRoomData.price) + (kids * 300) : 0;

  const handleDateClick = useCallback((key) => {
    const date = parseDate(key);
    if (date < today) return;
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
  }, [checkIn, checkOut, today]);

  const handleConfirm = () => {
    if (!guestName || !email) return;
    setStep(5);
    scrollToTop();
  };

  const resetBooking = () => {
    setStep(1); setCheckIn(null); setCheckOut(null);
    setSelectedRoom(null); setAdults(1); setKids(0);
    setKidAges([]); setGuestName(""); setEmail("");
    setPhone(""); setSpecialRequests(""); setTouched({});
  };

  const goToStep = (s) => { setStep(s); scrollToTop(); };

  const nextDisabled = {
    1: !checkIn || !checkOut,
    2: !selectedRoom,
    3: !guestName || !email,
  };

  const formatDate = (key) => {
    if (!key) return "";
    const d = parseDate(key);
    return `${d.getDate()} ${monthLabels[d.getMonth()]} ${d.getFullYear()}`;
  };

  const renderCalendar = (monthOffset = 0) => {
    const m = monthOffset === 0 ? viewMonth : (viewMonth + 1 > 11 ? 0 : viewMonth + 1);
    const y = monthOffset === 0 ? viewYear : (viewMonth + 1 > 11 ? viewYear + 1 : viewYear);
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`e${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const key = toKey(y, m, d);
      const date = new Date(y, m, d);
      const isPast = date < today;
      const isCheckIn = checkIn === key;
      const isCheckOut = checkOut === key;
      const inRange = checkIn && checkOut && key > checkIn && key < checkOut;
      const isBooked = !ROOMS.some(r => !r.bookedDates.includes(key));
      const isAvailableHover = checkIn && !checkOut && key > checkIn && !isPast && !isBooked;

      let cls = "relative flex items-center justify-center w-full aspect-square rounded-xl text-sm font-medium transition-all duration-200 border-0 ";
      let disabled = false;

      if (isPast) {
        cls += "text-warm-200 cursor-default";
        disabled = true;
      } else if (isCheckIn || isCheckOut) {
        cls += "bg-forest-500 text-white shadow-lg shadow-forest-500/30 font-semibold scale-105 z-10";
      } else if (inRange) {
        cls += "bg-forest-500/10 text-warm-900 rounded-none";
        if (key === checkIn) cls += " rounded-l-xl";
        if (key === checkOut) cls += " rounded-r-xl";
      } else if (isBooked) {
        cls += "text-red-300 cursor-not-allowed line-through";
        disabled = true;
      } else if (isAvailableHover) {
        cls += "bg-mist-100 text-forest-600 hover:bg-forest-500/15";
      } else {
        cls += "text-warm-800 hover:bg-mist-100 hover:text-forest-600";
      }

      if (isCheckIn && checkOut) cls += " rounded-r-xl";
      if (isCheckOut) cls += " rounded-l-xl";
      if (isCheckIn && !checkOut) cls += " rounded-xl";

      days.push(
        <button key={d} className={cls} disabled={disabled} onClick={() => handleDateClick(key)} type="button">
          <span className={`relative z-10 ${isCheckIn || isCheckOut ? 'text-white' : ''}`}>{d}</span>
          {isCheckIn && !checkOut && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-sans text-forest-500 font-semibold tracking-wide">
              {lang === 'th' ? 'เช็คอิน' : lang === 'cn' ? '入住' : 'IN'}
            </span>
          )}
        </button>
      );
    }
    return { days, month: m, year: y };
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-warm-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-warm-200/50 overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-16 h-16 border border-white/20 rounded-full" />
              <div className="absolute top-8 right-8 w-24 h-24 border border-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-white/5 rounded-full" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          <div className="p-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-serif text-warm-900 mb-2"
            >
              {lang === 'th' ? 'ยืนยันการจองเรียบร้อย' : lang === 'cn' ? '预订已确认' : 'Reservation Confirmed'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-warm-600 mb-6"
            >
              {lang === 'th'
                ? `ขอบคุณ ${guestName} เราได้ส่งรายละเอียดการจองไปยัง ${email} แล้ว`
                : lang === 'cn'
                ? `感谢您 ${guestName}，确认详情已发送至 ${email}`
                : `Thank you, ${guestName}. A confirmation has been sent to ${email}.`}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-warm-50 to-mist-100 rounded-2xl p-6 text-left mb-6 border border-warm-200/50"
            >
              <div className="flex gap-4 mb-4">
                <img src={selectedRoomData?.img} className="w-20 h-20 rounded-xl object-cover shadow-md" alt="" />
                <div>
                  <p className="font-semibold text-warm-900 text-lg">{lang === 'th' ? selectedRoomData?.nameTh : selectedRoomData?.name}</p>
                  <div className="flex items-center gap-1 text-sm text-warm-500 mt-1">
                    <CalendarDays size={14} />
                    <span>{formatDate(checkIn)} – {formatDate(checkOut)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-warm-500 mt-0.5">
                    <Users size={14} />
                    <span>{adults} {lang === 'th' ? 'ผู้ใหญ่' : lang === 'cn' ? '成人' : 'Adults'}{kids > 0 ? `, ${kids} ${lang === 'th' ? 'เด็ก' : lang === 'cn' ? '儿童' : 'Kids'}` : ''}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-warm-200 pt-4 flex justify-between items-center">
                <span className="font-medium text-warm-700">{lang === 'th' ? 'รวมทั้งสิ้น' : lang === 'cn' ? '总计' : 'Total Paid'}</span>
                <span className="text-2xl font-serif text-forest-600 font-bold">฿{formatPrice(totalPrice)}</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={resetBooking}
              className="w-full py-3.5 bg-forest-500 text-white rounded-xl font-medium hover:bg-forest-600 transition-colors shadow-lg shadow-forest-500/20"
            >
              {lang === 'th' ? 'จองอีกครั้ง' : lang === 'cn' ? '再次预订' : 'Book Another Stay'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50" ref={topRef}>
      {/* Hero */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80"
          className="w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-warm-200/80 text-xs tracking-[0.3em] uppercase mb-2 font-sans"
          >
            {lang === 'th' ? 'เฮย์นาว เชียงดาว' : 'Hey Now Chiang Dao'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif text-white leading-tight"
          >
            {lang === 'th' ? 'จองที่พักของคุณ' : lang === 'cn' ? '预订您的住宿' : 'Reserve Your Escape'}
          </motion.h1>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => s < step && goToStep(s)}
                className={`flex items-center gap-2 ${s < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`
                  relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${step > s
                    ? 'bg-forest-500 text-white shadow-md shadow-forest-500/20'
                    : step === s
                    ? 'bg-forest-500 text-white shadow-lg shadow-forest-500/30 scale-110'
                    : 'bg-warm-100 text-warm-400 border-2 border-warm-200'
                  }
                `}>
                  {step > s ? <CheckCircle size={18} /> : s}
                  {step === s && (
                    <motion.span
                      layoutId="pulse"
                      className="absolute inset-0 rounded-full border-2 border-forest-500/40"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className={`hidden md:block text-xs font-medium ${
                  step >= s ? 'text-warm-900' : 'text-warm-400'
                }`}>
                  {labels[s - 1]}
                </span>
              </motion.button>
              {s < 4 && (
                <div className={`w-8 md:w-16 h-px ${
                  step > s ? 'bg-forest-500' : 'bg-warm-200'
                } transition-colors duration-300`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 pb-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: Dates */}
          {step === 1 && (
            <motion.div key="step1" {...slideUp} transition={{ duration: 0.3 }}>
              <div className="grid md:grid-cols-[1fr_320px] gap-6 md:gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-warm-200/60 overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => {
                          if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                          else setViewMonth(viewMonth - 1);
                        }}
                        className="w-10 h-10 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors text-warm-600"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <h3 className="text-lg font-serif text-warm-900">
                        {monthLabels[viewMonth]} {viewYear}
                      </h3>
                      <button
                        onClick={() => {
                          if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                          else setViewMonth(viewMonth + 1);
                        }}
                        className="w-10 h-10 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors text-warm-600"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {dayLabels.map(d => (
                        <div key={d} className="text-center text-xs font-medium text-warm-400 py-2">{d}</div>
                      ))}
                      {(() => {
                        const cal = renderCalendar(0);
                        return cal.days;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200/60 p-5">
                    <h3 className="font-serif text-lg text-warm-900 mb-4 flex items-center gap-2">
                      <CalendarDays size={18} className="text-forest-500" />
                      {lang === 'th' ? 'วันที่เข้าพัก' : lang === 'cn' ? '入住日期' : 'Your Stay'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-warm-50 to-mist-100 rounded-xl p-3.5 border border-warm-200/40">
                        <p className="text-[10px] uppercase tracking-wider text-warm-500 mb-1 font-sans">
                          {lang === 'th' ? 'เช็คอิน' : lang === 'cn' ? '入住' : 'Check-in'}
                        </p>
                        <p className={`font-medium ${checkIn ? 'text-warm-900' : 'text-warm-300'}`}>
                          {checkIn ? formatDate(checkIn) : (lang === 'th' ? 'เลือกวันที่' : lang === 'cn' ? '选择日期' : 'Select date')}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-warm-50 to-mist-100 rounded-xl p-3.5 border border-warm-200/40">
                        <p className="text-[10px] uppercase tracking-wider text-warm-500 mb-1 font-sans">
                          {lang === 'th' ? 'เช็คเอาท์' : lang === 'cn' ? '退房' : 'Check-out'}
                        </p>
                        <p className={`font-medium ${checkOut ? 'text-warm-900' : 'text-warm-300'}`}>
                          {checkOut ? formatDate(checkOut) : (lang === 'th' ? 'เลือกวันที่' : lang === 'cn' ? '选择日期' : 'Select date')}
                        </p>
                      </div>
                    </div>
                    {checkIn && checkOut && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gradient-to-r from-forest-500/5 to-forest-500/10 rounded-xl p-3.5 text-center border border-forest-500/10"
                      >
                        <p className="text-forest-700 font-medium">
                          <span className="text-2xl font-serif">{totalNights}</span>
                          <span className="ml-1.5">{lang === 'th' ? 'คืน' : lang === 'cn' ? '晚' : 'nights'}</span>
                          <span className="mx-2 text-forest-400">·</span>
                          <span>{availableRooms.length} {lang === 'th' ? 'ห้องว่าง' : lang === 'cn' ? '间可用' : 'rooms available'}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: checkIn && checkOut ? 1.01 : 1 }}
                    whileTap={{ scale: checkIn && checkOut ? 0.99 : 1 }}
                    onClick={() => goToStep(2)}
                    disabled={!checkIn || !checkOut}
                    className={`
                      w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                      ${checkIn && checkOut
                        ? 'bg-forest-500 text-white hover:bg-forest-600 shadow-lg shadow-forest-500/20'
                        : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {lang === 'th' ? 'เลือกห้อง' : lang === 'cn' ? '选择房间' : 'Select Room'}
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Room Selection */}
          {step === 2 && (
            <motion.div key="step2" {...slideUp} transition={{ duration: 0.3 }}>
              <button
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-900 transition-colors mb-5 group"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                {lang === 'th' ? 'กลับไปเลือกวันที่' : lang === 'cn' ? '返回选择日期' : 'Back to Dates'}
              </button>

              <div className="grid gap-4">
                {ROOMS.map(room => {
                  const isAvailable = availableRooms.some(r => r.id === room.id);
                  const isSelected = selectedRoom === room.id;
                  const roomName = lang === 'th' ? room.nameTh : room.name;
                  const roomTag = lang === 'th' ? room.taglineTh : room.tagline;
                  const roomBeds = lang === 'th' ? room.bedsTh : room.beds;
                  const roomAmenities = lang === 'th' ? room.amenitiesTh : room.amenities;

                  return (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: isAvailable ? 1.005 : 1 }}
                      onClick={() => isAvailable && setSelectedRoom(room.id)}
                      className={`
                        relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300
                        ${isSelected
                          ? 'border-forest-500 shadow-lg shadow-forest-500/10'
                          : isAvailable
                          ? 'border-warm-200/60 hover:border-warm-300 shadow-sm hover:shadow-md'
                          : 'border-warm-200/40 opacity-60 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-40 sm:h-auto relative overflow-hidden flex-shrink-0">
                          <img
                            src={room.img}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={roomName}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="bg-white/90 text-warm-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                {lang === 'th' ? 'ไม่ว่าง' : lang === 'cn' ? '已满' : 'Unavailable'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4 md:p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-serif text-xl text-warm-900">{roomName}</h3>
                              <p className="text-sm text-warm-500 mt-0.5">{roomTag}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="text-2xl font-serif font-bold text-forest-600">฿{formatPrice(room.price)}</p>
                              <p className="text-[10px] uppercase tracking-wider text-warm-500 font-sans">
                                /{lang === 'th' ? 'คืน' : lang === 'cn' ? '晚' : 'night'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs bg-warm-100 text-warm-700 px-2.5 py-1 rounded-lg">
                              <Bed size={12} />
                              {roomBeds}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs bg-mist-100 text-forest-700 px-2.5 py-1 rounded-lg">
                              <Users size={12} />
                              {room.capacity} {lang === 'th' ? 'ท่าน' : lang === 'cn' ? '人' : 'guests'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs bg-mist-100 text-forest-700 px-2.5 py-1 rounded-lg">
                              <Home size={12} />
                              {room.size}m²
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {roomAmenities.map(a => (
                              <span key={a} className="text-[11px] text-warm-500 bg-warm-50 px-2 py-0.5 rounded-md">
                                {a}
                              </span>
                            ))}
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-3 right-3 sm:top-auto sm:bottom-3 sm:right-3"
                            >
                              <span className="bg-forest-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md shadow-forest-500/30 inline-flex items-center gap-1">
                                <CheckCircle size={12} />
                                {lang === 'th' ? 'เลือกแล้ว' : lang === 'cn' ? '已选' : 'Selected'}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: selectedRoom ? 1.01 : 1 }}
                  whileTap={{ scale: selectedRoom ? 0.99 : 1 }}
                  onClick={() => goToStep(3)}
                  disabled={!selectedRoom}
                  className={`
                    px-8 py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                    ${selectedRoom
                      ? 'bg-forest-500 text-white hover:bg-forest-600 shadow-lg shadow-forest-500/20'
                      : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                    }
                  `}
                >
                  {lang === 'th' ? 'ดำเนินการต่อ' : lang === 'cn' ? '继续' : 'Continue'}
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 & 4: Guest Details + Summary */}
          {(step === 3 || step === 4) && (
            <motion.div key="step3" {...slideUp} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">
                {/* Left: Form */}
                <div>
                  <button
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-900 transition-colors mb-5 group"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    {lang === 'th' ? 'กลับไปเลือกห้อง' : lang === 'cn' ? '返回选择房间' : 'Back to Rooms'}
                  </button>

                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200/60 p-5 md:p-6 mb-4">
                    <h3 className="font-serif text-lg text-warm-900 mb-5 flex items-center gap-2">
                      <Users size={18} className="text-forest-500" />
                      {lang === 'th' ? 'จำนวนผู้เข้าพัก' : lang === 'cn' ? '住客信息' : 'Guests'}
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-warm-500 mb-2 block font-sans">
                          {lang === 'th' ? 'ผู้ใหญ่' : lang === 'cn' ? '成人' : 'Adults'}
                        </label>
                        <div className="flex items-center gap-3 bg-warm-50 rounded-xl p-1.5 border border-warm-200/40">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-9 h-9 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-warm-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="flex-1 text-center text-lg font-semibold text-warm-900">{adults}</span>
                          <button
                            onClick={() => setAdults(Math.min(selectedRoomData?.capacity || 4, adults + 1))}
                            className="w-9 h-9 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-warm-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-warm-500 mb-2 block font-sans">
                          {lang === 'th' ? 'เด็ก' : lang === 'cn' ? '儿童' : 'Children'}
                        </label>
                        <div className="flex items-center gap-3 bg-warm-50 rounded-xl p-1.5 border border-warm-200/40">
                          <button
                            onClick={() => { if (kids > 0) { setKids(kids - 1); setKidAges(kidAges.slice(0, -1)); } }}
                            className="w-9 h-9 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-warm-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="flex-1 text-center text-lg font-semibold text-warm-900">{kids}</span>
                          <button
                            onClick={() => { if (kids < (selectedRoomData?.maxKids || 2)) { setKids(kids + 1); setKidAges([...kidAges, null]); } }}
                            className="w-9 h-9 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-warm-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {kidAges.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-warm-100"
                      >
                        <label className="text-xs text-warm-500 mb-2 block font-sans">
                          {lang === 'th' ? 'อายุของเด็ก' : lang === 'cn' ? '儿童年龄' : "Children's Ages"}
                        </label>
                        <div className="flex gap-2">
                          {kidAges.map((age, i) => (
                            <select
                              key={i}
                              value={age || ""}
                              onChange={(e) => {
                                const newAges = [...kidAges];
                                newAges[i] = e.target.value;
                                setKidAges(newAges);
                              }}
                              className="w-20 bg-warm-50 border border-warm-200/60 rounded-lg px-3 py-2.5 text-sm text-warm-900 outline-none focus:border-forest-500 transition-colors"
                            >
                              <option value="">{lang === 'th' ? 'อายุ' : lang === 'cn' ? '年龄' : 'Age'}</option>
                              {[...Array(12)].map((_, x) => <option key={x} value={x}>{x}</option>)}
                            </select>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200/60 p-5 md:p-6">
                    <h3 className="font-serif text-lg text-warm-900 mb-5 flex items-center gap-2">
                      <Mail size={18} className="text-forest-500" />
                      {lang === 'th' ? 'ข้อมูลผู้จอง' : lang === 'cn' ? '预订人信息' : 'Your Details'}
                    </h3>

                    <div className="space-y-3.5">
                      <div>
                        <div className={`
                          flex items-center gap-3 bg-white border rounded-xl px-4 transition-all duration-300
                          ${focusedField === 'name' ? 'border-forest-500 shadow-sm shadow-forest-500/10' : 'border-warm-200/60'}
                          ${touched.name && !guestName ? 'border-red-300' : ''}
                        `}>
                          <Users size={16} className="text-warm-400 flex-shrink-0" />
                          <input
                            placeholder={lang === 'th' ? 'ชื่อ-นามสกุล *' : lang === 'cn' ? '姓名 *' : 'Full Name *'}
                            value={guestName}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => { setFocusedField(null); setTouched(p => ({...p, name: true})); }}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="flex-1 py-3.5 text-sm text-warm-900 outline-none bg-transparent placeholder:text-warm-300"
                          />
                          {guestName && <CheckCircle size={16} className="text-forest-500" />}
                        </div>
                        {touched.name && !guestName && (
                          <p className="text-red-400 text-xs mt-1 ml-1">
                            {lang === 'th' ? 'กรุณากรอกชื่อ' : lang === 'cn' ? '请输入姓名' : 'Name is required'}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className={`
                          flex items-center gap-3 bg-white border rounded-xl px-4 transition-all duration-300
                          ${focusedField === 'email' ? 'border-forest-500 shadow-sm shadow-forest-500/10' : 'border-warm-200/60'}
                          ${touched.email && !email ? 'border-red-300' : ''}
                        `}>
                          <Mail size={16} className="text-warm-400 flex-shrink-0" />
                          <input
                            type="email"
                            placeholder={lang === 'th' ? 'อีเมล *' : lang === 'cn' ? '邮箱 *' : 'Email *'}
                            value={email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => { setFocusedField(null); setTouched(p => ({...p, email: true})); }}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 py-3.5 text-sm text-warm-900 outline-none bg-transparent placeholder:text-warm-300"
                          />
                          {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <CheckCircle size={16} className="text-forest-500" />}
                        </div>
                        {touched.email && !email && (
                          <p className="text-red-400 text-xs mt-1 ml-1">
                            {lang === 'th' ? 'กรุณากรอกอีเมล' : lang === 'cn' ? '请输入邮箱' : 'Email is required'}
                          </p>
                        )}
                      </div>

                      <div className={`
                        flex items-center gap-3 bg-white border rounded-xl px-4 transition-all duration-300
                        ${focusedField === 'phone' ? 'border-forest-500 shadow-sm shadow-forest-500/10' : 'border-warm-200/60'}
                      `}>
                        <Phone size={16} className="text-warm-400 flex-shrink-0" />
                        <input
                          placeholder={lang === 'th' ? 'เบอร์โทรศัพท์' : lang === 'cn' ? '电话号码' : 'Phone Number'}
                          value={phone}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 py-3.5 text-sm text-warm-900 outline-none bg-transparent placeholder:text-warm-300"
                        />
                      </div>

                      <div className={`
                        flex items-start gap-3 bg-white border rounded-xl px-4 transition-all duration-300
                        ${focusedField === 'requests' ? 'border-forest-500 shadow-sm shadow-forest-500/10' : 'border-warm-200/60'}
                      `}>
                        <MessageSquare size={16} className="text-warm-400 flex-shrink-0 mt-4" />
                        <textarea
                          placeholder={lang === 'th' ? 'คำขอพิเศษ (เช่น เตียงเสริม, อาหาร)' : lang === 'cn' ? '特殊要求' : 'Special Requests (extra bed, dietary needs...)'}
                          value={specialRequests}
                          onFocus={() => setFocusedField('requests')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={3}
                          className="flex-1 py-3.5 text-sm text-warm-900 outline-none bg-transparent placeholder:text-warm-300 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:sticky lg:top-6 self-start">
                  <div className="bg-white rounded-2xl shadow-sm border border-warm-200/60 p-5 md:p-6">
                    <h3 className="font-serif text-lg text-warm-900 mb-5 flex items-center gap-2">
                      <Sparkles size={18} className="text-forest-500" />
                      {lang === 'th' ? 'สรุปการจอง' : lang === 'cn' ? '预订摘要' : 'Booking Summary'}
                    </h3>

                    <div className="flex gap-3 mb-5 pb-5 border-b border-warm-100">
                      <img src={selectedRoomData?.img} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-semibold text-warm-900">{lang === 'th' ? selectedRoomData?.nameTh : selectedRoomData?.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-warm-500 mt-1">
                          <CalendarDays size={12} />
                          <span>{formatDate(checkIn)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-warm-500">
                          <CalendarDays size={12} />
                          <span>{formatDate(checkOut)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pb-4 border-b border-warm-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-warm-600">
                          {selectedRoomData?.name} × {totalNights} {totalNights > 1
                            ? (lang === 'th' ? 'คืน' : lang === 'cn' ? '晚' : 'nights')
                            : (lang === 'th' ? 'คืน' : lang === 'cn' ? '晚' : 'night')}
                        </span>
                        <span className="text-warm-900 font-medium">฿{formatPrice((selectedRoomData?.price || 0) * totalNights)}</span>
                      </div>
                      {kids > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">
                            {lang === 'th' ? 'ค่าที่นอนเด็ก' : lang === 'cn' ? '儿童加床' : 'Extra Bedding'} ({kids} {lang === 'th' ? 'คน' : lang === 'cn' ? '人' : 'pax'})
                          </span>
                          <span className="text-warm-900 font-medium">฿{formatPrice(kids * 300)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <span className="font-semibold text-warm-900">
                        {lang === 'th' ? 'รวมทั้งสิ้น' : lang === 'cn' ? '总计' : 'Total'}
                      </span>
                      <span className="text-2xl font-serif font-bold text-forest-600">฿{formatPrice(totalPrice)}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: guestName && email ? 1.01 : 1 }}
                      whileTap={{ scale: guestName && email ? 0.99 : 1 }}
                      onClick={handleConfirm}
                      disabled={!guestName || !email}
                      className={`
                        w-full mt-5 py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${guestName && email
                          ? 'bg-forest-500 text-white hover:bg-forest-600 shadow-lg shadow-forest-500/20'
                          : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <ShieldCheck size={18} />
                      {lang === 'th' ? 'ยืนยันการจอง' : lang === 'cn' ? '确认预订' : 'Confirm Reservation'}
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-warm-400">
                      <ShieldCheck size={12} />
                      <span>
                        {lang === 'th'
                          ? 'ยกเลิกฟรี 7 วันก่อนเข้าพัก'
                          : lang === 'cn'
                          ? '入住前7天可免费取消'
                          : 'Free cancellation 7 days prior'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
