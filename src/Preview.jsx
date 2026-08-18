import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// Til tarjimalari (sizning eski kodingizdan olingan, uz/ru/en)
const T = {
  uz: {
    invitation: "SIZ TAKLIFNOMA OLDINGIZ", quote: "Va U ularning qalblarini birlashtirdi", quoteRef: "Anfol surasi, 63", unlock: "OCHISH",
    dear: "Aziz mehmonlarimiz!", invite: "Sizni to'y marosimimizga taklif qilamiz", date: "SANA", countdown: "TO'YGACHA QOLDI",
    days: "kun", hours: "soat", minutes: "daqiqa", seconds: "soniya", startAt: "BOSHLANISHI", schedule: "DASTUR",
    guests: "MEHMONLARNI KUTIB OLISH", ceremony: "NIKOH MAROSIMI", banquet: "BAYRAM ZIYOFATI", end: "OQSHOM YAKUNI",
    venue: "TO'Y JOYI", welcome: "Sizni ko'rishdan baxtiyor bo'lamiz!", yandexMap: "Yandex xaritada", googleMap: "Google xaritada",
    closing: "SIZNING ISHTIROKINGIZ", closingDesc: "biz uchun eng qimmatli sovg'a!",
    months: "Yanvar Fevral Mart Aprel May Iyun Iyul Avgust Sentyabr Oktyabr Noyabr Dekabr", weekdays: "Du Se Ch Pa Ju Sh Ya",
  },
  ru: {
    invitation: "ВЫ ПОЛУЧИЛИ ПРИГЛАШЕНИЕ", quote: "И Он сплотил их сердца", quoteRef: "Аль-Анфаль, 63", unlock: "ОТКРЫТЬ",
    dear: "Дорогие наши!", invite: "Мы рады пригласить вас на нашу свадьбу", date: "ДАТА", countdown: "ДО СВАДЬБЫ ОСТАЛОСЬ",
    days: "дней", hours: "часов", minutes: "минут", seconds: "секунд", startAt: "НАЧАЛО В", schedule: "РАСПИСАНИЕ",
    guests: "ВСТРЕЧА ГОСТЕЙ", ceremony: "ЦЕРЕМОНИЯ", banquet: "БАНКЕТ", end: "ОКОНЧАНИЕ ВЕЧЕРА",
    venue: "МЕСТО ПРОВЕДЕНИЯ", welcome: "Будем рады видеть вас!", yandexMap: "Яндекс карта", googleMap: "Google карта",
    closing: "ВАШЕ ПРИСУТСТВИЕ", closingDesc: "лучший подарок для нас!",
    months: "Январь Февраль Март Апрель Май Июнь Июль Август Сентябрь Октябрь Ноябрь Декабрь", weekdays: "Пн Вт Ср Чт Пт Сб Вс",
  },
  en: {
    invitation: "YOU RECEIVED AN INVITATION", quote: "And He united their hearts", quoteRef: "Al-Anfal, 63", unlock: "UNLOCK",
    dear: "Dear our loved ones!", invite: "We are delighted to invite you to our wedding", date: "DATE", countdown: "TIME REMAINING",
    days: "days", hours: "hours", minutes: "minutes", seconds: "seconds", startAt: "START AT", schedule: "SCHEDULE",
    guests: "GUEST ARRIVAL", ceremony: "CEREMONY", banquet: "BANQUET", end: "END OF THE EVENING",
    venue: "VENUE", welcome: "We will be happy to see you!", yandexMap: "Yandex maps", googleMap: "Google maps",
    closing: "YOUR PRESENCE", closingDesc: "is the most important gift for us!",
    months: "January February March April May June July August September October November December", weekdays: "Mon Tue Wed Thu Fri Sat Sun",
  },
};

function Preview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Shablon ichidagi holatlar (til, ochish, musiqa)
  const [lang, setLang] = useState("uz");
  const t = T[lang];
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // Sana hisoblagich (Countdown)
  const [now, setNow] = useState(null);
  useEffect(() => {
    if (!unlocked || !data?.user_data?.date) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [unlocked, data]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) fetchInvitation(id);
    else { setErrorMsg("URL da ID topilmadi."); setLoading(false); }
  }, []);

  const fetchInvitation = async (id) => {
    const { data, error } = await supabase.from("v2_invitations").select("*").eq("id", id).single();
    if (error) setErrorMsg("Ma'lumot olishda xato: " + error.message);
    else { setData(data); handlePreviewLogic(data); }
    setLoading(false);
  };

  const handlePreviewLogic = async (invData) => {
    if (invData.is_active) return;
    if (invData.preview_count >= 3) { setIsBlocked(true); return; }
    const newCount = invData.preview_count + 1;
    await supabase.from("v2_invitations").update({ preview_count: newCount }).eq("id", invData.id);
    setData({ ...invData, preview_count: newCount });
  };

  const togglePlay = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const unlock = () => {
    setUnlocked(true);
    const a = audioRef.current; if (a) a.play().then(() => setPlaying(true)).catch(() => {});
    setTimeout(() => document.getElementById("content")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Ma'lumotlarni olish (xavfsiz)
  const uData = data?.user_data || {};
  const groomName = uData.groomName || "Yigit";
  const brideName = uData.brideName || "Qiz";
  const dateStr = uData.date || "Sana aniqlanmagan";
  const locationStr = uData.location || "Manzil aniqlanmagan";
  const imageUrl = uData.imageUrl;
  const musicUrl = uData.musicUrl;

  // Countdown hisoblash
  let countdown = null;
  if (now && uData.date) {
    // Sana formati "2026-10-29T18:00" bo'lishi kerak
    const weddingDate = new Date(uData.date); 
    if (!isNaN(weddingDate)) {
      const diff = Math.max(0, weddingDate.getTime() - now);
      countdown = {
        days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60),
      };
    }
  }

  // --- UI COMPONENTLARI (Sizning shabloningiznikilar) ---
  const Petals = () => (<div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">{Array.from({ length: 16 }).map((_, i) => (<span key={i} className="petal absolute rounded-full" style={{ left: `${(i * 53) % 100}%`, width: 5 + (i % 5) * 2, height: 5 + (i % 5) * 2, background: "radial-gradient(circle, oklch(0.92 0.12 80) 0%, oklch(0.78 0.11 70 / 0.4) 60%, transparent 100%)", animationDelay: `-${(i * 1.7) % 12}s`, animationDuration: `${16 + (i % 7) * 2}s` }} />))}</div>);
  
  const Ornament = ({ symbol = "✦" }) => (<div className="flex items-center justify-center gap-3 text-[var(--gold)]"><span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--gold)]/60" /><span className="text-sm tracking-widest">{symbol}</span><span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--gold)]/60" /></div>);
  
  const Heart = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-[var(--gold)]/70"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>);
  
  const Section = ({ children, className = "" }) => { const ref = useRef(null); const [visible, setVisible] = useState(false); useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.12 }); io.observe(el); return () => io.disconnect(); }, []); return (<section ref={ref} className={`relative ${className}`}><div className={visible ? "fade-up" : "opacity-0"}>{children}</div></section>); };

  // --- ASOSIY QISMLAR ---
  if (loading) return <div className="text-center mt-50">Yuklanmoqda...</div>;
  if (errorMsg) return <div className="text-center mt-50 text-red-500 font-bold">{errorMsg}</div>;

  // TO'LOV SAHIFASI (Limit tugagan bo'lsa)
  if (isBlocked) {
    return (
      <div className="max-w-lg mx-auto mt-20 bg-card p-10 rounded-3xl border border-[var(--gold)]/40 text-center backdrop-blur">
        <h2 className="text-3xl font-display text-[var(--gold)]">3 ta bepul ko'rish tugadi!</h2>
        <p className="mt-4 text-muted-foreground">Taklifnomangizni ochiq qilish uchun aktivlashtiring.</p>
        <p className="mt-6 font-bold">To'lovni qiling va chekni botga yuboring:</p>
        <p className="text-2xl text-blue-400 mt-2">+998 XX XXX XX XX</p>
        <a href="https://t.me/your_bot" target="_blank" className="inline-block mt-6 px-8 py-3 bg-[#0088cc] text-white rounded-full font-bold">Telegram Bot</a>
      </div>
    );
  }

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
      
      {/* Til almashtirish tugmalari */}
      <div className="fixed left-4 top-4 z-50 flex gap-1.5">
        {["uz", "ru", "en"].map((l) => (<button key={l} onClick={() => setLang(l)} className={`h-9 w-11 rounded-full border text-xs tracking-wider backdrop-blur transition ${lang === l ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold)]" : "border-border bg-card/60 text-muted-foreground"}`}>{l.toUpperCase()}</button>))}
      </div>

      {/* Musiqa tugmasi */}
      <button onClick={togglePlay} className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-[var(--gold)]/40 bg-card/70 text-[var(--gold)] shadow-lg backdrop-blur">
        {playing ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
      </button>
      <Petals />

      {/* HERO / OCHISH EKRANI */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-24 text-center">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at top, oklch(0.25 0.04 70 / 0.6), transparent 60%), radial-gradient(ellipse at bottom, oklch(0.2 0.03 80 / 0.5), transparent 60%)" }} />
        <div className="relative z-20 mx-auto max-w-xl">
          <Ornament symbol="—" />
          <p className="mt-4 text-[11px] tracking-[0.4em] text-muted-foreground">{t.invitation}</p>
          <h1 className="mt-10 font-display text-5xl leading-tight text-foreground md:text-7xl">
            {groomName} <span className="gold-text italic">&</span> {brideName}
          </h1>
          <div className="mt-8 flex items-center justify-center gap-4 text-[var(--gold)]">
            <span className="h-px w-10 bg-[var(--gold)]/50" />
            <p className="text-sm tracking-[0.5em]">{dateStr}</p>
            <span className="h-px w-10 bg-[var(--gold)]/50" />
          </div>
          <p className="mt-10 font-arabic text-3xl text-[var(--gold)] md:text-4xl" style={{ fontFamily: 'Amiri, serif' }}>وَأَلَّفَ بَيْنَ قُلُوبِهِمْ</p>
          <p className="mt-4 italic text-foreground/80">"{t.quote}"</p>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground">{t.quoteRef}</p>
          <div className="mt-6"><Heart /></div>

          {!unlocked && (
            <button onClick={unlock} className="group relative mt-10 inline-flex items-center gap-3 rounded-full border border-[var(--gold)]/50 bg-card/40 py-3 pl-3 pr-6 backdrop-blur transition hover:border-[var(--gold)]">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)] text-[var(--primary-foreground)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0"/></svg>
              </span>
              <span className="text-sm tracking-[0.3em] text-foreground">{t.unlock}</span>
            </button>
          )}
        </div>
      </section>

      {/* OCHILGANDAN KEYINGI QISMLAR */}
      {unlocked && (
        <div id="content">
          <Section className="px-6 py-20">
            <div className="mx-auto max-w-xl text-center">
              <Ornament symbol="♡" />
              <p className="mt-6 font-display text-3xl italic text-[var(--gold)] md:text-4xl">{t.dear}</p>
              <p className="mt-4 text-base leading-relaxed text-foreground/80 md:text-lg">{t.invite}</p>
            </div>
          </Section>

          {/* RASM */}
          {imageUrl && (
            <Section className="px-6 pb-10">
              <div className="mx-auto max-w-md relative">
                <div className="absolute -inset-3 rounded-[2rem] border border-[var(--gold)]/30" />
                <div className="absolute -inset-1 rounded-[1.7rem] border border-[var(--gold)]/50" />
                <img src={imageUrl} alt="Couple" className="relative h-auto w-full rounded-[1.5rem] object-cover shadow-2xl" />
              </div>
            </Section>
          )}

          {/* SANA VA COUNTDOWN */}
          <Section className="px-6 py-20">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[11px] tracking-[0.5em] text-[var(--gold)]">{t.date}</p>
              <p className="mt-3 font-display text-5xl tracking-wider text-foreground md:text-6xl">{dateStr}</p>
              <div className="mt-8"><Heart /></div>
              
              {countdown && (
                <div className="mt-10">
                  <p className="text-[11px] tracking-[0.4em] text-[var(--gold)]">{t.countdown}</p>
                  <div className="mt-8 grid grid-cols-4 gap-2 md:gap-5">
                    {[{ v: countdown.days, l: t.days }, { v: countdown.hours, l: t.hours }, { v: countdown.minutes, l: t.minutes }, { v: countdown.seconds, l: t.seconds }].map((it, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--gold)]/25 bg-card/50 p-3 backdrop-blur md:p-5">
                        <div className="gold-text font-display text-3xl md:text-5xl" suppressHydrationWarning>{String(it.v).padStart(2, '0')}</div>
                        <div className="mt-1 text-[10px] tracking-widest text-muted-foreground md:text-xs">{it.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* MANZIL */}
          <Section className="px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] tracking-[0.5em] text-[var(--gold)]">✦ {t.venue} ✦</p>
              <h2 className="mt-4 text-4xl italic md:text-5xl">{locationStr}</h2>
              <div className="mt-8"><Heart /></div>
              <div className="mt-10 rounded-3xl border border-[var(--gold)]/25 bg-card/50 p-8 backdrop-blur">
                <p className="mt-4 text-foreground/80 italic">{t.welcome}</p>
              </div>
            </div>
          </Section>

          {/* YOPILISH */}
          <Section className="px-6 py-24">
            <div className="mx-auto max-w-xl text-center">
              <Ornament symbol="♡" />
              <p className="mt-6 text-[11px] tracking-[0.5em] text-[var(--gold)]">{t.closing}</p>
              <p className="mt-4 font-display text-3xl italic text-foreground md:text-4xl">{t.closingDesc}</p>
              <div className="mt-10"><Heart /></div>
              <p className="mt-8 gold-text font-display text-4xl italic md:text-5xl">{groomName} & {brideName}</p>
              <p className="mt-3 text-xs tracking-[0.4em] text-muted-foreground">{dateStr}</p>
            </div>
          </Section>
          
          {/* LIMIT HISOBLAGICHI */}
          <footer className="relative border-t border-border/60 py-10 text-center text-xs tracking-widest text-muted-foreground">
            {!data?.is_active && (
               <p className="mb-4">Qolgan bepul ko'rishlar: {Math.max(0, 3 - (data?.preview_count || 0))} / 3</p>
            )}
            <p>♡ {groomName} & {brideName} ♡</p>
          </footer>
        </div>
      )}
    </main>
  );
}

export default Preview;
