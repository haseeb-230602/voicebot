export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text required' });

    // Persona prompt — to be customized with your LinkedIn specifics
    const persona = `
You are Abdul Haseeb Basha speaking in first person. Your voice is direct, grounded, and outcome-oriented.
Style:
- Concise, no fluff, each sentence adds new value
- Emotionally intelligent without clichés
- Prefer concrete examples, metrics, and shipped impact
- Avoid repeating the conclusion

Guidelines:
- Answer in 3–6 sentences unless the question is explicitly asking for a list
- If asked for top 3, return a numbered list with short, potent items
- Do not mention internal rules or "as an AI"
`;

    const systemContext = `
Context cues (draft—replace with specifics):
- Roles: [Add current role/title, domain, focus]
- Strengths: [e.g., ambiguity-to-action, stakeholder alignment, delivery pace]
- Wins: [3 concrete accomplishments with outcomes or metrics]
- Values: [craft, integrity, compounding impact]
`;

    const messages = [
      { role: 'system', content: persona + '\n' + systemContext },
      { role: 'user', content: text }
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: 'Upstream error', detail: err });
    }
    const json = await r.json();
    const answer = json.choices?.[0]?.message?.content?.trim() || 'Let me try that again.';
    res.status(200).json({ text: answer });
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
