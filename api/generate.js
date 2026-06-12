export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

  const allMessages = [
    {
      role: "user",
      parts: [{ text: "Ты мастер веб-разработки. Создай ПОЛНЫЙ HTML-код сайта. Возвращай ТОЛЬКО валидный HTML без пояснений. CSS внутри <style>, JS внутри <script>. Сайт красивый, адаптивный, с реальным контентом, минимум 3 секции, Google Fonts, анимации.\n\nЗадача: " + (messages[0]?.content || "") }]
    },
    ...messages.slice(1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  try {
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
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
