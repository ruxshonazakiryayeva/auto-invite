import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Preview from "./Preview";

function App() {
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // URL da ?id= borligini tekshiramiz
    const params = new URLSearchParams(window.location.search);
    if (params.get("id")) {
      setShowPreview(true);
    }
  }, []);

  // AGAR URL DA ID BO'LSA, PREVIEW SAHIFASINI KO'RSATAMIZ
  if (showPreview) {
    return <Preview />;
  }

  // AGAR ID YO'Q BO'LSA, FORMANI (EDITORNI) KO'RSATAMIZ
  // (Bu sizning avvalgi formangiz kodining o'zi, ozgina o'zgartirilgan)
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [formData, setFormData] = useState({
    groomName: "", brideName: "", date: "", location: "", imageUrl: "", musicUrl: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("v2_invitations").insert([{
      template_id: null,
      user_data: formData,
      session_identifier: "browser-session-123",
      preview_count: 0,
      is_active: false,
    }]).select("id").single();

    if (error) { alert("Xatolik: " + error.message); } 
    else {
      // SAQLANGAN ZAHOTI, PREVIEW SAHIFASIGA OTAMIZ
      window.location.href = `/?id=${data.id}`;
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Taklifnomangizni Tahrirlang</h2>
      {/* Inputlar (joy yetishmasligi uchun qisqartirib yozdim, lekin bir xil ishlaydi) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input name="groomName" placeholder="Yigit ismi" value={formData.groomName} onChange={handleChange} style={{ padding: "10px", width: "100%", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input name="brideName" placeholder="Qiz ismi" value={formData.brideName} onChange={handleChange} style={{ padding: "10px", width: "100%", border: "1px solid #ccc", borderRadius: "6px" }} />
      </div>
      <input name="date" placeholder="Sana va vaqt" value={formData.date} onChange={handleChange} style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }} />
      <input name="location" placeholder="Manzil" value={formData.location} onChange={handleChange} style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }} />
      <input name="imageUrl" placeholder="Rasm URL" value={formData.imageUrl} onChange={handleChange} style={{ padding: "10px", width: "100%", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }} />
      <input name="musicUrl" placeholder="Musiqa URL" value={formData.musicUrl} onChange={handleChange} style={{ padding: "10px", width: "100%", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }} />
      
      <button onClick={handleSave} disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
        {loading ? "Saqlanmoqda..." : "Saqlash va Ko'rish"}
      </button>
    </div>
  );
}

export default App;
