import { topicMap } from "../data/topicMap";

function matchesKeyword(text, keyword) {
  const normalizedKeyword = keyword
    .toLowerCase()
    .trim();

  if (!normalizedKeyword) {
    return false;
  }

  const escapedKeyword = normalizedKeyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|\\s|[^a-z0-9])${escapedKeyword}(?=$|\\s|[^a-z0-9])`,
    "i"
  );

  return pattern.test(text);
}

export function detectTopic(question, subject) {
  const text = question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const subjects = topicMap[subject];

  if (!subjects) {
    return {
      topic: "Unknown",
      confidence: 0,
      matchedKeywords: []
    };
  }

  const topicScores = [];

  for (const [topic, keywords] of Object.entries(subjects)) {
    const matchedKeywords = keywords.filter((keyword) =>
      matchesKeyword(text, keyword)
    );

    if (matchedKeywords.length === 0) {
      continue;
    }

    const score = matchedKeywords.reduce(
      (total, keyword) => {
        const words = keyword.trim().split(/\s+/).length;
        const lengthBonus = Math.min(keyword.length / 10, 3);

        return total + words + lengthBonus;
      },
      0
    );

    topicScores.push({
      topic,
      score,
      matchedKeywords
    });
  }

  if (topicScores.length === 0) {
    return {
      topic: "Unknown",
      confidence: 0,
      matchedKeywords: []
    };
  }

  topicScores.sort((a, b) => b.score - a.score);

  const best = topicScores[0];

  const secondBest = topicScores[1];

  let confidence = Math.min(best.score / 8, 1);

  if (secondBest) {
    const difference =
      best.score - secondBest.score;

    if (difference < 1) {
      confidence *= 0.7;
    } else if (difference < 2) {
      confidence *= 0.85;
    }
  }

  confidence = Number(
    confidence.toFixed(2)
  );

  if (confidence < 0.25) {
    return {
      topic: "Unknown",
      confidence,
      matchedKeywords: best.matchedKeywords
    };
  }

  return {
    topic: best.topic,
    confidence,
    matchedKeywords: best.matchedKeywords
  };
}