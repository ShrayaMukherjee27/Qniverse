import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ScanText,
  Tags,
  Brain
} from "lucide-react";

import { extractTextFromPDF } from "../utils/pdfParser";
import { extractQuestions } from "../utils/questionParser";
import { detectTopic } from "../utils/topicDetector";
import { saveQuestions } from "../services/questionService";

function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setResult(null);

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        "File size must be less than 10 MB."
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg"
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Please upload a PDF, PNG or JPG file."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (processing) {
      return;
    }

    setError("");
    setResult(null);

    if (!file) {
      setError(
        "Please select a file."
      );
      return;
    }

    if (!subject.trim()) {
      setError(
        "Please enter a subject."
      );
      return;
    }

    if (!year.trim()) {
      setError(
        "Please enter the paper year."
      );
      return;
    }

    setProcessing(true);
    setStage(
      "Preparing question paper..."
    );

    try {
      const extracted =
        await extractTextFromPDF(
          file,
          (progress) => {
            if (!progress) {
              return;
            }

            if (
              progress.type ===
              "loading"
            ) {
              setStage(
                "Loading PDF..."
              );
            }

            if (
              progress.type ===
              "loaded"
            ) {
              setStage(
                `PDF loaded · ${progress.totalPages} pages detected`
              );
            }

            if (
              progress.type ===
              "scanned"
            ) {
              setStage(
                "Scanned PDF detected · starting OCR..."
              );
            }

            if (
              progress.type ===
              "page"
            ) {
              setStage(
                `OCR scanning page ${progress.page}/${progress.totalPages}...`
              );
            }

            if (
              progress.type ===
              "ocr"
            ) {
              setStage(
                `Reading page text... ${progress.progress}%`
              );
            }

            if (
              progress.type ===
              "pageComplete"
            ) {
              setStage(
                `Page ${progress.page}/${progress.totalPages} processed`
              );
            }

            if (
              progress.type ===
              "normalText"
            ) {
              setStage(
                "Digital text detected..."
              );
            }
          }
        );

      if (
        !extracted.text?.trim()
      ) {
        throw new Error(
          "No readable text was found in the file."
        );
      }

      setStage(
        "Extracting individual questions..."
      );

      const extractedQuestions =
        extractQuestions(
          extracted.text
        );

      if (
        extractedQuestions.length ===
        0
      ) {
        console.log(
          "OCR OUTPUT:",
          extracted.text
        );

        throw new Error(
          "Text was detected, but no numbered questions could be identified. Check the browser console for the OCR output."
        );
      }

      setStage(
        `Found ${extractedQuestions.length} questions · analyzing topics...`
      );

      const analyzedQuestions =
        extractedQuestions.map(
          (question) => {
            const analysis =
              detectTopic(
                question.text,
                subject.trim()
              );

            return {
              ...question,
              ...analysis
            };
          }
        );

      setStage(
        "Saving questions to Qniverse..."
      );

      await saveQuestions(
        analyzedQuestions,
        subject.trim(),
        year.trim()
      );

      setResult({
        questions:
          analyzedQuestions.length,
        pages:
          extracted.pageCount
      });

      setStage("");
    } catch (uploadError) {
      console.error(
        "Upload error:",
        uploadError
      );

      setError(
        uploadError.message ||
          "Something went wrong while processing the file."
      );

      setStage("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            UPLOAD PYQ
          </span>

          <h1>
            Add a Question Paper
          </h1>

          <p>
            Upload a previous-year paper and
            Qniverse will extract, classify and
            analyze its questions.
          </p>
        </div>
      </div>

      <section className="panel upload-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              PAPER DETAILS
            </span>

            <h2>
              Tell us about the paper
            </h2>

            <p>
              Add the subject and year before
              processing the question paper.
            </p>
          </div>

          <FileText size={20} />
        </div>

        <div className="upload-form-grid">
          <div className="upload-field">
            <label>
              Subject
            </label>

            <input
              type="text"
              placeholder="e.g. Computer Networks"
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              disabled={processing}
            />
          </div>

          <div className="upload-field">
            <label>
              Year
            </label>

            <input
              type="number"
              placeholder="e.g. 2025"
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value
                )
              }
              disabled={processing}
            />
          </div>
        </div>

        <div className="upload-dropzone">
          <input
            id="pyq-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={processing}
          />

          <label
            htmlFor="pyq-file"
            className={
              processing
                ? "upload-dropzone-content disabled"
                : "upload-dropzone-content"
            }
          >
            <div className="upload-grid" />

            <div className="scan-line" />

            <div className="upload-corners corner-tl" />
            <div className="upload-corners corner-tr" />
            <div className="upload-corners corner-bl" />
            <div className="upload-corners corner-br" />

            <div className="upload-icon">
              <UploadIcon size={26} />
            </div>

            <div className="upload-main">
              <span className="upload-status">
                {file ? "FILE READY FOR ANALYSIS" : "INPUT CHANNEL READY"}
              </span>

              <strong>
                {file
                  ? file.name
                  : "Drop your question paper here"}
              </strong>

              <span className="upload-subtext">
                {file
                  ? `${(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB · Ready to process`
                  : "PDF · PNG · JPG · Maximum 10 MB"}
              </span>
            </div>

            <div className="upload-browse">
              {file ? "Change File" : "Browse Files"}
              <ArrowRight size={15} />
            </div>

            <div className="upload-tech">
              <span>OCR</span>
              <span>TOPIC AI</span>
              <span>PYQ INDEX</span>
            </div>
          </label>
        </div>

        {error && (
          <div className="upload-message error">
            <AlertCircle size={19} />

            <div>
              <strong>
                Upload failed
              </strong>

              <span>
                {error}
              </span>
            </div>
          </div>
        )}

        {processing && (
          <div className="upload-message processing">
            <Loader2
              size={19}
              className="spin"
            />

            <div>
              <strong>
                Processing paper
              </strong>

              <span>
                {stage}
              </span>
            </div>
          </div>
        )}

        {result && (
          <div className="upload-message success">
            <CheckCircle2 size={19} />

            <div>
              <strong>
                Paper added successfully
              </strong>

              <span>
                {result.questions} questions
                extracted from {result.pages} pages.
              </span>
            </div>
          </div>
        )}

        <div className="upload-actions">
          <button
            className="primary-button"
            onClick={handleUpload}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2
                  size={17}
                  className="spin"
                />
                Processing...
              </>
            ) : (
              <>
                <Brain size={17} />
                Analyze & Save Paper
              </>
            )}
          </button>

          {result && (
            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/questions?subject=${encodeURIComponent(
                    subject.trim()
                  )}`
                )
              }
            >
              View Questions
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>

      <section className="panel upload-process-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              HOW IT WORKS
            </span>

            <h2>
              From paper to exam intelligence
            </h2>

            <p>
              Qniverse processes your paper through
              four steps.
            </p>
          </div>

          <ScanText size={20} />
        </div>

        <div className="upload-process-grid">
          <div className="upload-process-card">
            <div className="process-number">
              01
            </div>

            <div className="process-icon">
              <ScanText size={19} />
            </div>

            <h3>
              Extract
            </h3>

            <p>
              Reads text from digital and scanned
              question papers.
            </p>
          </div>

          <div className="upload-process-card">
            <div className="process-number">
              02
            </div>

            <div className="process-icon">
              <FileText size={19} />
            </div>

            <h3>
              Detect
            </h3>

            <p>
              Separates the individual questions
              from the paper.
            </p>
          </div>

          <div className="upload-process-card">
            <div className="process-number">
              03
            </div>

            <div className="process-icon">
              <Tags size={19} />
            </div>

            <h3>
              Analyze
            </h3>

            <p>
              Identifies topics and relevant
              keywords for each question.
            </p>
          </div>

          <div className="upload-process-card">
            <div className="process-number">
              04
            </div>

            <div className="process-icon">
              <Brain size={19} />
            </div>

            <h3>
              Learn
            </h3>

            <p>
              Uses the extracted data to build
              analysis and study insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Upload;