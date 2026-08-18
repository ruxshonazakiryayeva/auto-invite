import { useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    date: "",
    location: "",
    imageUrl: "",
    musicUrl: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const sessionId = "browser-session-123"; // Keyinroq real IP yoki cookies qo'yamiz

    const { data, error } = await supabase
      .from("v2_invitations")
      .insert([
        {
          template_id: null, // Hozircha shablon tanlanmagan
          user_data: formData,
          session_identifier: sessionId,
          preview_count: 0,
          is_active: false,
        },
      ])
      .select("id")
      .single();

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      setSuccessId(data.id);
    }
    setLoading(false);
  };

  if (successId) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1 style={{ color: "green", fontSize: "24px" }}>Bravo! Saqlandi!</h1>
        <p>Taklifnoma tayyor. Preview (ko'rish) sahifasini keyingi qadamda yasaymiz.</p>
        <p style={{ color: "gray" }}>ID: {successId}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Taklifnomangizni Tahrirlang</h2>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input 
          name="groomName"
          placeholder="Yigit ismi"
          value={formData.groomName}
          onChange={handleChange}
          style={{ padding: "10px", width: "100%", border: "1px solid #ccc", borderRadius: "6px" }}
        />
        <input 
          name="brideName"
          placeholder="Qiz ismi"
          value={formData.brideName}
          onChange={handleChange}
          style={{ padding: "10px", width: "100%", border: "1px solid #ccc", borderRadius: "6px" }}
        />
      </div>

      <input 
        name="date"
        placeholder="Sana va vaqt (Masalan: 15 Oktyabr, soat 18:00)"
        value={formData.date}
        onChange={handleChange}
        style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
      />

      <input 
        name="location"
        placeholder="Manzil (Masalan: Toshkent, Zarafshon)"
        value={formData.location}
        onChange={handleChange}
        style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
      />

      <input 
        name="imageUrl"
        placeholder="Juftlik rasmi havolasi (URL)"
        value={formData.imageUrl}
        onChange={handleChange}
        style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
      />

      <input 
        name="musicUrl"
        placeholder="Fon musiqasi havolasi (URL)"
        value={formData.musicUrl}
        onChange={handleChange}
        style={{ padding: "10px", width: "100%", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
      />

      <button 
        onClick={handleSave}
        disabled={loading}
        style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}
      >
        {loading ? "Saqlanmoqda..." : "Saqlash va Davom Etish"}
      </button>
    </div>
  );
}

export default App;
