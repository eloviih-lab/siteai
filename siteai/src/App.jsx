import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "Лендинг для фитнес-клуба с ценами и записью",
  "Портфолио фотографа с галереей работ",
  "Сайт для кофейни с меню и адресом",
  "Одностраничный сайт для мобильного приложения",
  "Визитка для веб-дизайнера",
];

const CODE_SNIPPETS = [
  "<div class=\"hero\">",
  "  background: linear-gradient(",
  "  display: flex; align-items:",
  "  <section class=\"features\">",
  "  font-family: 'Inter', sans;",
  "  border-radius: 12px;",
  "  animation: fadeIn 0.6s ease;",
  "  const [state, setState] =",
  "  <button onClick={handle}>",
  "  grid-template-columns: 1fr",
  "  @media (max-width: 768px)",
  "  transform: translateY(-2px)",
];

const SYSTEM_PROMPT = `Ты — мастер веб-разработки. Пользователь описывает сайт, и ты создаёшь его ПОЛНЫЙ HTML-код.

ПРАВИЛА:
1. Возвращай ТОЛЬКО валидный HTML — ничего больше. Никакого текста до или после кода.
2. Весь CSS — внутри тега <style> в <head>. Весь JS — внутри <script> в конце <body>.
3. Сайт должен быть красивым, современным, с продуманным дизайном.
4. Используй Google Fonts (подключай через @import в CSS).
5. Делай адаптивный дизайн (mobile-first).
6. Используй реальный контент — не "Lorem ipsum". Придумай подходящий текст, цены, имена.
7. Минимум 3 секции на странице. Сделай сайт полноценным и детальным.
8. Добавь плавные CSS-анимации и hover-эффекты для живости.
9. Не используй внешние JS-библиотеки — только чистый HTML/CSS/JS.`;

function FloatingCode() {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prev => {
        const newLine = {
          id: Date.now(),
          text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
          x: Math.random() * 90,
          opacity: 0.07 + Math.random() * 0.08,
          speed: 18 + Math.random() * 20,
        };
        return [...prev.slice(-14), newLine];
      });
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {lines.map(line => (
        <div key={line.id} style={{
          position: "absolute", left: `${line.x}%`, top: "-2em",
          color: "#7C3AED", opacity: line.opacity, fontFamily: "monospace",
          fontSize: "13px", whiteSpace: "nowrap",
          animation: `fall ${line.speed}s linear forwards`,
        }}>{line.text}</div>
      ))}
      <style>{`@keyframes fall { from { transform: translateY(0); } to { transform: translateY(105vh); } }`}</style>
    </div>
  );
}

function Preview({ html }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open(); doc.write(html); doc.close();
    }
  }, [html]);
  return <iframe ref={iframeRef} style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }} title="preview" sandbox="allow-scripts" />;
}

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed(""); idx.current = 0;
    const t = setInterval(() => {
      if (idx.current < text.length) { setDisplayed(text.slice(0, idx.current + 1)); idx.current++; }
      else clearInterval(t);
    }, 12);
    return () => clearInterval(t);
  }, [text]);
  return <span>{displayed}</span>;
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("idle");
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [editPrompt, setEditPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

  async function generate(messages) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const allMessages = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nТеперь выполни задачу: " + messages[0].content }] },
      ...messages.slice(1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: allMessages,
          generationConfig: { maxOutputTokens: 8192 },
        }),
      }
    );
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setPhase("generating"); setStatusMsg("Придумываю структуру..."); setGeneratedHTML("");
    const msgs = [{ role: "user", content: `Создай сайт: ${prompt}` }];
    try {
      setTimeout(() => setStatusMsg("Пишу HTML и CSS..."), 1200);
      setTimeout(() => setStatusMsg("Добавляю анимации..."), 3000);
      setTimeout(() => setStatusMsg("Финальные штрихи..."), 5000);
      const html = await generate(msgs);
      const cleaned = html.replace(/^```html?\n?/, "").replace(/\n?```$/, "").trim();
      setChatHistory([{ role: "user", content: `Создай сайт: ${prompt}` }, { role: "assistant", content: cleaned }]);
      setGeneratedHTML(cleaned); setPhase("done"); setActiveTab("preview");
    } catch (e) {
      setPhase("error"); setStatusMsg("Ошибка при генерации. Проверь API ключ.");
    }
  }

  async function handleEdit() {
    if (!editPrompt.trim()) return;
    setPhase("generating"); setStatusMsg("Вношу правки...");
    const msgs = [...chatHistory, { role: "user", content: `Измени сайт: ${editPrompt}. Верни полный обновлённый HTML.` }];
    try {
      const html = await generate(msgs);
      const cleaned = html.replace(/^```html?\n?/, "").replace(/\n?```$/, "").trim();
      setChatHistory([...msgs, { role: "assistant", content: cleaned }]);
      setGeneratedHTML(cleaned); setEditPrompt(""); setPhase("done");
    } catch (e) {
      setPhase("error"); setStatusMsg("Ошибка при редактировании.");
    }
  }

  function handleDownload() {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "my-site.html"; a.click();
  }

  function handleReset() {
    setPhase("idle"); setPrompt(""); setGeneratedHTML(""); setChatHistory([]); setEditPrompt("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", color: "#F8F7FF", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1E2440; } ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 3px; }
        .prompt-textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(124,58,237,0.35); border-radius: 12px; padding: 16px; color: #F8F7FF; font-size: 15px; font-family: 'Inter', sans-serif; resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5; }
        .prompt-textarea:focus { border-color: #7C3AED; } .prompt-textarea::placeholder { color: rgba(248,247,255,0.35); }
        .btn-primary { background: linear-gradient(135deg, #7C3AED, #5B21B6); border: none; border-radius: 10px; color: white; padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.4); } .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: rgba(248,247,255,0.8); padding: 10px 18px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); color: #F8F7FF; }
        .chip { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 20px; padding: 7px 14px; font-size: 13px; color: rgba(248,247,255,0.75); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .chip:hover { background: rgba(124,58,237,0.3); color: #F8F7FF; }
        .tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'Inter', sans-serif; }
        .tab-active { background: rgba(124,58,237,0.25); color: #A78BFA; } .tab-inactive { background: transparent; color: rgba(248,247,255,0.4); }
        .glass-card { background: rgba(30,36,64,0.7); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; backdrop-filter: blur(10px); }
        .edit-input { flex: 1; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(124,58,237,0.3); border-radius: 10px; padding: 11px 16px; color: #F8F7FF; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
        .edit-input:focus { border-color: #7C3AED; } .edit-input::placeholder { color: rgba(248,247,255,0.3); }
        .code-block { background: #0D1117; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; color: #79C0FF; overflow: auto; height: 100%; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <FloatingCode />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <header style={{ padding: "24px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7C3AED, #5B21B6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20 }}>SiteAI</span>
            <span style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase" }}>Beta</span>
          </div>
          {phase === "done" && <button className="btn-secondary" onClick={handleReset}>+ Новый сайт</button>}
        </header>

        {phase === "idle" && (
          <div style={{ paddingTop: 60, paddingBottom: 80 }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 20 }}>
                Опиши идею —<br />
                <span style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>получи сайт</span>
              </h1>
              <p style={{ fontSize: 17, color: "rgba(248,247,255,0.55)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>Искусственный интеллект создаст полноценный сайт по твоему описанию. Без кода, за секунды.</p>
            </div>
            <div className="glass-card" style={{ padding: 28, maxWidth: 700, margin: "0 auto 32px" }}>
              <textarea className="prompt-textarea" rows={4} placeholder="Например: лендинг для барбершопа в стиле минимализм с прайсом, фото мастеров и формой записи..." value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }} />
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(248,247,255,0.25)" }}>⌘ Enter для генерации</span>
                <button className="btn-primary" onClick={handleGenerate} disabled={!prompt.trim()}>✦ Создать сайт</button>
              </div>
            </div>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <p style={{ fontSize: 12, color: "rgba(248,247,255,0.3)", marginBottom: 12, textAlign: "center", textTransform: "uppercase" }}>Попробуй пример</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {EXAMPLES.map(ex => <button key={ex} className="chip" onClick={() => setPrompt(ex)}>{ex}</button>)}
              </div>
            </div>
          </div>
        )}

        {phase === "generating" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 28 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, animation: "spin 3s linear infinite" }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Создаю твой сайт...</h2>
              <p style={{ color: "#A78BFA", fontSize: 16 }}><TypingText text={statusMsg} key={statusMsg} /></p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7C3AED", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {phase === "error" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, marginBottom: 8 }}>Что-то пошло не так</h2>
            <p style={{ color: "rgba(248,247,255,0.5)", marginBottom: 24 }}>{statusMsg}</p>
            <button className="btn-primary" onClick={() => setPhase("idle")}>Попробовать снова</button>
          </div>
        )}

        {phase === "done" && (
          <div style={{ paddingBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["preview", "code"].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? "tab-active" : "tab-inactive"}`} onClick={() => setActiveTab(t)}>
                    {t === "preview" ? "👁 Превью" : "{ } Код"}
                  </button>
                ))}
              </div>
              <button className="btn-secondary" onClick={handleDownload}>↓ Скачать HTML</button>
            </div>
            <div className="glass-card" style={{ height: "60vh", overflow: "hidden", marginBottom: 16 }}>
              {activeTab === "preview" ? <Preview html={generatedHTML} /> : <div className="code-block">{generatedHTML}</div>}
            </div>
            <div className="glass-card" style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 12, color: "rgba(248,247,255,0.4)", marginBottom: 10 }}>Хочешь что-то изменить?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input className="edit-input" placeholder='Например: "Сделай фон тёмным и добавь кнопку WhatsApp"' value={editPrompt} onChange={e => setEditPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleEdit(); }} />
                <button className="btn-primary" onClick={handleEdit} disabled={!editPrompt.trim()} style={{ padding: "11px 20px", whiteSpace: "nowrap" }}>Изменить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
