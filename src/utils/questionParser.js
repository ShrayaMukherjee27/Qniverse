export function cleanOCRText(text) {
  if (!text) {
    return "";
  }

  let cleaned = text;

  cleaned = cleaned.replace(
    /---\s*Page\s*\d+\s*---/gi,
    "\n"
  );

  cleaned = cleaned.replace(
    /\*+\s*Best\s*of\s*Luck\s*\*+/gi,
    "\n"
  );

  cleaned = cleaned.replace(
    /[«»‹›|¦¤©®™]/g,
    " "
  );

  cleaned = cleaned.replace(
    /\r\n/g,
    "\n"
  );

  cleaned = cleaned.replace(
    /[ \t]+/g,
    " "
  );

  cleaned = cleaned.replace(
    /\n{3,}/g,
    "\n\n"
  );

  return cleaned.trim();
}

export function extractQuestions(text) {
  const cleanedText =
    cleanOCRText(text);

  if (!cleanedText) {
    return [];
  }

  const lines =
    cleanedText
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

  const questions = [];

  let currentQuestion = null;

  for (const line of lines) {
    const match =
      line.match(
        /^(?:Q(?:uestion)?\s*\.?\s*)?(\d{1,2})\s*(?:[.)\-:]|\s)\s*(.*)$/i
      );

    if (match) {
      const number =
        Number(match[1]);

      const questionText =
        match[2]?.trim();

      if (
        number >= 1 &&
        number <= 99 &&
        questionText &&
        questionText.length > 3
      ) {
        if (currentQuestion) {
          finishQuestion(
            currentQuestion,
            questions
          );
        }

        currentQuestion = {
          number,
          text: questionText,
          marks: 0
        };

        continue;
      }
    }

    if (currentQuestion) {
      currentQuestion.text +=
        " " + line;
    }
  }

  if (currentQuestion) {
    finishQuestion(
      currentQuestion,
      questions
    );
  }

  if (questions.length > 0) {
    return questions;
  }

  return extractQuestionsInline(
    cleanedText
  );
}

function finishQuestion(
  question,
  questions
) {
  let text =
    cleanQuestion(
      question.text
    );

  if (
    text.length <= 10
  ) {
    return;
  }

  const marks =
    extractMarks(text);

  text =
    removeMarks(text);

  questions.push({
    number:
      question.number,
    text,
    marks
  });
}

function extractQuestionsInline(
  text
) {
  const pattern =
    /(?:^|\s)(?:Q(?:uestion)?\s*\.?\s*)?(\d{1,2})\s*(?:[.)\-:])\s*/gi;

  const matches = [
    ...text.matchAll(pattern)
  ];

  if (
    matches.length === 0
  ) {
    return [];
  }

  const questions = [];

  for (
    let i = 0;
    i < matches.length;
    i++
  ) {
    const match =
      matches[i];

    const number =
      Number(match[1]);

    const start =
      match.index +
      match[0].length;

    const end =
      i + 1 <
      matches.length
        ? matches[i + 1].index
        : text.length;

    let questionText =
      text
        .slice(start, end)
        .trim();

    questionText =
      cleanQuestion(
        questionText
      );

    if (
      questionText.length <= 10
    ) {
      continue;
    }

    const marks =
      extractMarks(
        questionText
      );

    questionText =
      removeMarks(
        questionText
      );

    questions.push({
      number,
      text: questionText,
      marks
    });
  }

  return questions;
}

function extractMarks(text) {
  const patterns = [
    /\[\s*(\d+)\s*marks?\s*\]/gi,
    /\(\s*(\d+)\s*marks?\s*\)/gi,
    /(\d+)\s*marks?\b/gi
  ];

  let totalMarks = 0;

  for (
    const pattern of patterns
  ) {
    const matches = [
      ...text.matchAll(
        pattern
      )
    ];

    for (
      const match of matches
    ) {
      totalMarks +=
        Number(match[1]);
    }

    if (
      matches.length > 0
    ) {
      break;
    }
  }

  return totalMarks;
}

function removeMarks(text) {
  return text
    .replace(
      /\[\s*\d+\s*marks?\s*\]/gi,
      " "
    )
    .replace(
      /\(\s*\d+\s*marks?\s*\)/gi,
      " "
    )
    .replace(
      /\b\d+\s*marks?\b/gi,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function cleanQuestion(text) {
  let cleaned = text;

  cleaned = cleaned.replace(
    /---\s*Page\s*\d+\s*---/gi,
    " "
  );

  cleaned = cleaned.replace(
    /\*+\s*Best\s*of\s*Luck\s*\*+/gi,
    " "
  );

  cleaned = cleaned.replace(
    /[«»‹›¦¤©®™]/g,
    " "
  );

  cleaned = cleaned.replace(
    /\s+/g,
    " "
  );

  return cleaned.trim();
}