const CATEGORY_KEYWORDS = {
  Academic: ["class", "teacher", "course", "lecture", "marks", "attendance", "exam", "assignment", "result"],
  Administrative: ["fee", "admission", "office", "registration", "document", "card", "challan", "admin"],
  Facilities: ["wifi", "internet", "water", "electric", "fan", "bench", "room", "hostel", "transport", "bus", "library"],
  "Behavior-related": ["harassment", "misbehave", "abuse", "fight", "threat", "discipline", "ragging"],
  Other: []
};

const URGENT_WORDS = {
  urgent: 2,
  immediately: 3,
  danger: 4,
  harassment: 4,
  safety: 4,
  exam: 3,
  deadline: 3,
  "not working": 2,
  broken: 2,
  failure: 2,
  critical: 3,
  problem: 1,
  issue: 1,
  angry: 1,
  disappointed: 1,
  frustrated: 1
};

function clean(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function predictCategory(text = "") {
  const input = clean(text);
  const scored = Object.entries(CATEGORY_KEYWORDS).map(([category, words]) => ({
    category,
    score: words.reduce((sum, word) => sum + (input.includes(word) ? 1 : 0), 0)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].category : "Other";
}

export function severity(text = "") {
  const input = clean(text);
  const score = Object.entries(URGENT_WORDS).reduce(
    (sum, [word, weight]) => sum + (input.includes(word) ? weight : 0),
    0
  );
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function tokens(text = "") {
  return new Set(clean(text).split(/\s+/).filter((word) => word.length > 2));
}

export function similarityScore(text = "", existingTexts = []) {
  const source = tokens(text);
  if (!source.size) return 0;
  return existingTexts.reduce((best, candidate) => {
    const target = tokens(candidate);
    const intersection = [...source].filter((word) => target.has(word)).length;
    const union = new Set([...source, ...target]).size || 1;
    return Math.max(best, intersection / union);
  }, 0);
}
