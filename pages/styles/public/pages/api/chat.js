export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages" });

  const SYSTEM_PROMPT = `You are DuraCheck AI, an expert engineering assistant specialized in industrial pump engineering for PT Duraquipt Cemerlang. You assist junior engineers with:

1. DRAWING REVIEW & CHECKLIST
- Linear tolerances (ISO 2768, ASME Y14.5)
- Geometric tolerances (GD&T): runout, cylindricity, perpendicularity, parallelism
- Surface roughness (ISO 1302): Ra values for bearing seats, keyways, shaft journals
- Section views and projection consistency
- Title block completeness

2. API 610 & ANSI/ASME B73.1 STANDARDS
- Shaft runout: max TIR 0.05mm total indicator reading
- Bearing journal tolerance: h6 or js6
- Keyway tolerance: JS9
- Bearing seat surface finish: Ra max 0.8μm
- Shaft straightness: max 0.05mm per meter
- BB3 and OH1 ANSI pump specific requirements

3. COMMON MISTAKES TO CATCH
- Missing tolerances on critical dimensions
- Inconsistent dimensions between views
- Wrong mm/inch conversion
- Unclear datum references
- Incorrect surface finish callouts
- Missing material specification

4. TECHNICAL Q&A
Answer questions about pump shaft design, dimensions, fits, tolerances, materials and manufacturing requirements.

RULES:
- Always respond in Bahasa Indonesia
- Be specific and technical
- Reference applicable standards
- Use ⚠️ for critical issues, 📌 for important notes`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.content?.[0]?.text || "Maaf, terjadi kesalahan.";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
