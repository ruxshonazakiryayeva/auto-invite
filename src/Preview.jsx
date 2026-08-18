import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function Preview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); // To'lov sahifasi ko'rsatish uchun

  useEffect(() => {
    // URL dan ID ni olish (masalan: ?id=147ec1db-...)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) fetchInvitation(id);
  }, []);

  const fetchInvitation = async (id) => {
    const { data, error } = await supabase
      .from("v2_invitations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Taklifnoma topilmadi!");
    } else {
      setData(data);
      handlePreviewLogic(data);
    }
    setLoading(false);
  };

  const handlePreviewLogic = async (invData) => {
    // Agar admin allaqachon tasdiqlagan bo'lsa, cheksiz ko'rsatish
    if (invData.is_active) return;

    // Agar 3 marta ko'rilgan bo'lsa, bloklash (To'lov so'rash)
    if (invData.preview_count >= 3) {
      setIsBlocked(true);
      return;
    }

    // Aks holda, ko'rish sonini 1 ga oshirish
    await supabase
      .from("v2_invitations")
      .update({ preview_count: invData.preview_count + 1 })
      .eq("id", invData.id);
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Yuklanmoqda...</div>;

  // Agar limit tugagan bo'lsa, To'lov sahifasi
  if (isBlocked) {
    return (
      <div style={{ maxWidth: "500px", margin: "50px auto", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Sizning 3 ta bepul ko'rish limitingiz tugadi!</h2>
        <p style={{ margin: "20px 0", color: "#555" }}>Taklifnomangizni doimiy ochiq qilish va ulashish uchun aktivlashtirishingiz kerak.</p>
        <p style={{ fontWeight: "bold" }}>To'lovni quyidagi raqamga qiling va chekni botga yuboring:</p>
        <p style={{ fontSize: "24px", color: "blue", margin: "20px 0" }}>+998 XX XXX XX XX</p> {/* Bu yerga raqamingizni yozasiz */}
        <a 
          href="https://t.me/your_bot_username" // Bu yerga bot linkini keyin yozasiz
          target="_blank"
          style={{ display: "inline-block", marginTop: "20px", padding: "12px 24px", background: "#0088cc", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}
        >
          Telegram Botga O'tish
        </a>
      </div>
    );
  }

  // Asosiy Taklifnoma Ko'rinishi
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", background: "white", minHeight: "100vh", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        
        {data.user_data.imageUrl && (
          <img 
            src={data.user_data.imageUrl} 
            alt="Juftlik" 
            style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%", margin: "0 auto 20px", border: "4px solid #f3f4f6" }}
          />
        )}

        <h1 style={{ color: "#333", fontSize: "28px", margin: "0 0 10px" }}>
          {data.user_data.groomName} & {data.user_data.brideName}
        </h1>

        <div style={{ width: "50px", height: "2px", background: "#e5e7eb", margin: "20px auto" }}></div>

        <p style={{ color: "#666", fontSize: "18px", margin: "10px 0" }}>
          📅 {data.user_data.date}
        </p>

        <p style={{ color: "#666", fontSize: "18px", margin: "10px 0" }}>
          📍 {data.user_data.location}
        </p>

        <div style={{ marginTop: "40px", padding: "20px", background: "#f9fafb", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#4b5563" }}>Sizni taklif qilamiz!</p>
        </div>

        {/* Musiqa pleyer */}
        {data.user_data.musicUrl && (
          <div style={{ marginTop: "30px" }}>
            <audio controls style={{ width: "100%", outline: "none" }}>
              <source src={data.user_data.musicUrl} type="audio/mpeg" />
              Sizning brauzeringiz audio tegini qo'llab-quvvatlamaydi.
            </audio>
          </div>
        )}

        <p style={{ marginTop: "40
