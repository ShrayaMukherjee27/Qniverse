const stopWords = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "of",
  "to",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "from",
  "by",
  "as",
  "at",
  "be",
  "what",
  "how",
  "why",
  "explain",
  "describe",
  "discuss",
  "define",
  "write",
  "give",
  "state",
  "using",
  "used",
  "use",
  "following",
  "following"
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(text) {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word)
      )
  );
}

function calculateSimilarity(text1, text2) {
  const words1 = getWords(text1);
  const words2 = getWords(text2);

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  let intersection = 0;

  words1.forEach((word) => {
    if (words2.has(word)) {
      intersection++;
    }
  });

  const union = new Set([
    ...words1,
    ...words2
  ]).size;

  return intersection / union;
}

export function findSimilarQuestions(
  questions,
  threshold = 0.45
) {
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const first = questions[i];
      const second = questions[j];

      if (
        !first.text ||
        !second.text
      ) {
        continue;
      }

      if (
        first.subject &&
        second.subject &&
        first.subject !== second.subject
      ) {
        continue;
      }

      if (
        first.id &&
        second.id &&
        first.id === second.id
      ) {
        continue;
      }

      if (
        first.year &&
        second.year &&
        String(first.year) === String(second.year)
      ) {
        continue;
      }

      const similarity = calculateSimilarity(
        first.text,
        second.text
      );

      if (similarity >= threshold) {
        results.push({
          first,
          second,
          similarity: Math.round(similarity * 100)
        });
      }
    }
  }

  return results.sort(
    (a, b) =>
      b.similarity - a.similarity
  );
}