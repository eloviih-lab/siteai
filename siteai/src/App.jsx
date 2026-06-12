import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "Лендинг для фитнес-клуба с ценами и записью",
  "Портфолио фотографа с галереей работ",
  "Сайт для кофейни с меню и адресом",
  "Визитка для веб-дизайнера",
];

function Preview({ html }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);
  return (
    <iframe
      ref={iframeRef}
      style={{ width: "100%", height: "100%", border: "none" }}
      title="preview"
      sandbox="allow-scripts"
    />
  );
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("idle");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [editPrompt, setEditPrompt] = useState("");
  const [history, setHistory] = useState([]);

  async function callApi(messages) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("Ошибка API: " + res.status);
    const data = await res.json();
    return data.result || "";
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setPhase("loading");
    setError("");
    try {
      const messages = [{ role: "user", content: prompt }];
      const result = await callApi(messages);
      const cleaned = result.replace(/^```html?\n?/, "").replace(/\n?```$/, "").trim();
      setHtml(cleaned);
      setHistory([{ role: "user", content: prompt }, { role: "assistant", content: cleaned }]);
      setPhase("done");
      setActiveTab("preview");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }

  async function handleEdit() {
    if (!editPrompt.trim()) return;
    setPhase("loading");
    setError("");
    try {
      const messages = [...history, { role: "user", content: "Измени сайт: " + editPrompt + ". Верни полный HTML." }];
      const result = await callApi(messages);
      const cleaned = result.replace(/^```html?\n?/, "").replace(/\n?```$/, "").trim();
      setHtml(cleaned);
      setHistory([...messages, { role: "assistant", content: cleaned }]);
      setEditPrompt("");
      setPhase("done");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }

  function handleDownload() {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site.html";
    a.click();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", color: "#F8F7FF", fontFamily: "Inter, sans-serif", padding: "0 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea, input { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(124,58,237,0.4); border-radius: 10px; color: #F8F7FF; font-family: Inter, sans-serif; font-size: 15px; outline: none; padding: 12px 16px; width: 100%; }
        textarea:focus, input:focus { border-color: #7C3AED; }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.3); }
        .btn { border: none; border-radius: 10px; cursor: pointer; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; padding: 12px 24px; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #7C3AED, #5B21B6); color: white; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(124,58,237,0.4); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
        .btn-secondary:hover { background: rgba(255,255,255,0.14); }
        .chip { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 20px; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 13px; padding: 6px 14px; transition: all 0.15s; white-space: nowrap; }
        .chip:hover { background: rgba(124,58,237,0.3); color: white; }
        .card { background: rgba(30,36,64,0.7); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; }
        .tab { background: none; border: none; border-radius: 8px; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 13px; font-weight: 500; padding: 7px 14px; }
        .tab.active { background: rgba(124,58,237,0.25); color: #A78BFA; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ alignItems: "center", display: "flex", gap: 10, padding: "24px 0" }}>
          <div style={{ alignItems: "center", background: "linear-gradient(135deg,#7C3AED,#5B21B6)", borderRadius: 10, display: "flex", fontSize: 18, height: 36, justifyContent: "center", width: 36 }}>⚡</div>
          <span style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 700 }}>SiteAI</span>
          <span style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 6, color: "#A78BFA", fontSize: 11, fontWeight: 700, padding: "2px 8px", textTransform: "uppercase" }}>Beta</span>
          {phase === "done" && (
            <button className="btn btn-secondary" onClick={() => { setPhase("idle"); setPrompt(""); setHtml(""); setHistory([]); }} style={{ marginLeft: "auto" }}>
              + Новый сайт
            </button>
          )}
        </header>

        {phase === "idle" && (
          <div style={{ paddingBottom: 80, paddingTop: 60, textAlign: "center" }}>
            <h1 style={{ fontFamily: "Space Grotesk", fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 20 }}>
              Опиши идею —{" "}
              <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}>
                получи сайт
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.6, margin: "0 auto 48px", maxWidth: 480 }}>
              ИИ создаст полноценный сайт по твоему описанию. Без кода, за секунды.
            </p>
            <div className="card" style={{ margin: "0 auto 32px", maxWidth: 680, padding: 24 }}>
              <textarea rows={4} placeholder="Например: лендинг для барбершопа с прайсом, фото мастеров и формой записи..." value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }} />
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>⌘ Enter для генерации</span>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={!prompt.trim()}>✦ Создать сайт</button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 680, margin: "0 auto" }}>
              {EXAMPLES.map(ex => <button key={ex} className="chip" onClick={() => setPrompt(ex)}>{ex}</button>)}
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center", minHeight: "70vh" }}>
            <div style={{ animation: "spin 1s linear infinite", border: "3px solid rgba(124,58,237,0.3)", borderRadius: "50%", borderTopColor: "#7C3AED", height: 60, width: 60 }} />
            <p style={{ color: "#A78BFA", fontSize: 18 }}>Создаю твой сайт...</p>
          </div>
        )}

        {phase === "error" && (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>{error}</p>
            <button className="btn btn-primary" onClick={() => setPhase("idle")}>Попробовать снова</button>
          </div>
        )}

        {phase === "done" && (
          <div style={{ paddingBottom: 40 }}>
            <div style={{ alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4 }}>
                <button className={`tab ${activeTab === "preview" ? "active" : ""}`} onClick={() => setActiveTab("preview")}>👁 Превью</button>
                <button className={`tab ${activeTab === "code" ? "active" : ""}`} onClick={() => setActiveTab("code")}>{"{ } Код"}</button>
              </div>
              <button className="btn btn-secondary" onClick={handleDownload}>↓ Скачать HTML</button>
            </div>
            <div className="card" style={{ height: "60vh", marginBottom: 16, overflow: "hidden" }}>
              {activeTab === "preview" ? <Preview html={html} /> : (
                <div style={{ background: "#0D1117", borderRadius: 8, color: "#79C0FF", fontFamily: "monospace", fontSize: 12, height: "100%", lineHeight: 1.6, overflow: "auto", padding: 16, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {html}
                </div>
              )}
            </div>
            <div className="card" style={{ padding: "14px 16px" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10 }}>Хочешь что-то изменить?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder='Например: "Сделай фон тёмным и добавь кнопку WhatsApp"' value={editPrompt} onChange={e => setEditPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleEdit(); }} />
                <button className="btn btn-primary" onClick={handleEdit} disabled={!editPrompt.trim()} style={{ whiteSpace: "nowrap" }}>Изменить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
