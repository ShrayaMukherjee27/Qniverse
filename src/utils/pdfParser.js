import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

async function createOCRWorker(onProgress) {
  const worker = await createWorker("eng", 1, {
    logger: (message) => {
      if (
        message.status === "recognizing text" &&
        typeof message.progress === "number"
      ) {
        onProgress?.(
          Math.round(message.progress * 100)
        );
      }
    }
  });

  return worker;
}

async function extractTextFromImage(
  file,
  onProgress
) {
  const worker =
    await createOCRWorker(onProgress);

  try {
    onProgress?.(5);

    const result =
      await worker.recognize(file);

    onProgress?.(100);

    return {
      text:
        result.data.text?.trim() || "",
      pageCount: 1
    };
  } finally {
    await worker.terminate();
  }
}

async function renderPageToCanvas(
  page
) {
  const viewport =
    page.getViewport({
      scale: 2
    });

  const canvas =
    document.createElement(
      "canvas"
    );

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  canvas.width =
    Math.ceil(viewport.width);

  canvas.height =
    Math.ceil(viewport.height);

  await page.render({
    canvasContext: context,
    viewport
  }).promise;

  return canvas;
}

async function extractTextWithOCR(
  pdf,
  onProgress
) {
  const worker =
    await createOCRWorker(
      (pageProgress) => {
        onProgress?.({
          type: "ocr",
          progress:
            pageProgress
        });
      }
    );

  const pages = pdf.numPages;
  let fullText = "";

  try {
    for (
      let pageNumber = 1;
      pageNumber <= pages;
      pageNumber++
    ) {
      onProgress?.({
        type: "page",
        page: pageNumber,
        totalPages: pages
      });

      const page =
        await pdf.getPage(
          pageNumber
        );

      const canvas =
        await renderPageToCanvas(
          page
        );

      const result =
        await worker.recognize(
          canvas
        );

      const pageText =
        result.data.text || "";

      fullText +=
        `\n\n--- Page ${pageNumber} ---\n\n`;

      fullText += pageText;

      canvas.width = 1;
      canvas.height = 1;
      canvas.remove();

      onProgress?.({
        type: "pageComplete",
        page: pageNumber,
        totalPages: pages
      });
    }
  } finally {
    await worker.terminate();
  }

  return fullText.trim();
}

async function extractNormalText(
  pdf
) {
  let fullText = "";

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page =
      await pdf.getPage(
        pageNumber
      );

    const content =
      await page.getTextContent();

    const pageText =
      content.items
        .map(
          (item) =>
            item.str || ""
        )
        .join(" ")
        .trim();

    fullText +=
      `\n\n--- Page ${pageNumber} ---\n\n`;

    fullText += pageText;
  }

  return fullText.trim();
}

export async function extractTextFromPDF(
  file,
  onProgress
) {
  if (
    file.type ===
      "image/png" ||
    file.type ===
      "image/jpeg"
  ) {
    return await extractTextFromImage(
      file,
      onProgress
    );
  }

  if (
    file.type !==
      "application/pdf"
  ) {
    throw new Error(
      "Unsupported file type."
    );
  }

  onProgress?.({
    type: "loading"
  });

  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise;

  onProgress?.({
    type: "loaded",
    totalPages:
      pdf.numPages
  });

  const normalText =
    await extractNormalText(
      pdf
    );

  const normalCharacters =
    normalText
      .replace(
        /--- Page \d+ ---/gi,
        ""
      )
      .replace(/\s/g, "")
      .length;

  if (
    normalCharacters >= 100
  ) {
    onProgress?.({
      type: "normalText"
    });

    return {
      text: normalText,
      pageCount:
        pdf.numPages,
      usedOCR: false
    };
  }

  onProgress?.({
    type: "scanned"
  });

  const ocrText =
    await extractTextWithOCR(
      pdf,
      onProgress
    );

  if (
    !ocrText.trim()
  ) {
    throw new Error(
      "OCR could not read any text from this scanned PDF."
    );
  }

  return {
    text: ocrText,
    pageCount:
      pdf.numPages,
    usedOCR: true
  };
}