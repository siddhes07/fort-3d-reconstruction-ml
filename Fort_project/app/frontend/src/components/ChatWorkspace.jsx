import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ImagePlus,
  Info,
  LoaderCircle,
  MapPin,
  MessageCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { analyzeImage } from "../services/api.js";

const forts = [
  { name: "Sinhagad Fort", location: "Pune" },
  { name: "Rajgad Fort", location: "Pune" },
  { name: "Shivneri Fort", location: "Pune" },
  { name: "Raigad Fort", location: "Raigad" },
  { name: "Pratapgad Fort", location: "Satara" },
  { name: "Torna Fort", location: "Pune" },
  { name: "Lohagad Fort", location: "Pune" },
  { name: "Other fort", location: "" },
];

const locations = ["Pune", "Raigad", "Satara", "Nashik", "Kolhapur", "Other location"];

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Namaskar! Choose your fort and location, then upload a clear gateway photo. I'll show you what the model detects and its confidence score first. If it finds a gateway, you can ask a follow-up about the detection.",
  },
];

export default function ChatWorkspace({ onClose, initialFort = "" }) {
  const fileInputRef = useRef(null);
  const questionInputRef = useRef(null);
  const conversationRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fortName, setFortName] = useState(initialFort);
  const [customFortName, setCustomFortName] = useState("");
  const [location, setLocation] = useState(
    forts.find((fort) => fort.name === initialFort)?.location || "",
  );
  const [customLocation, setCustomLocation] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectedFort = forts.find((fort) => fort.name === fortName);
  const resolvedFort = fortName === "Other fort" ? customFortName.trim() : fortName;
  const resolvedLocation = location === "Other location" ? customLocation.trim() : location;
  const hasGateway = Boolean(analysisResult?.detections.length);
  const maxConfidence = hasGateway
    ? Math.max(...analysisResult.detections.map((detection) => detection.confidence))
    : 0;
  const canAnalyze = Boolean(file && resolvedFort && resolvedLocation && !isLoading);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (hasGateway && !isLoading) questionInputRef.current?.focus();
  }, [hasGateway, isLoading]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, [onClose]);

  function chooseFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setError("That image is larger than 10 MB. Choose a smaller file.");
      return;
    }

    setError("");
    setFile(nextFile);
    setAnalysisResult(null);
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    previewUrlsRef.current.add(nextPreviewUrl);
    setPreviewUrl(nextPreviewUrl);
  }

  function handleFortChange(event) {
    const nextFort = event.target.value;
    setFortName(nextFort);
    setAnalysisResult(null);
    const knownFort = forts.find((fort) => fort.name === nextFort);
    if (knownFort?.location) {
      setLocation(knownFort.location);
      setCustomLocation("");
    } else {
      setLocation("");
    }
  }

  function handleLocationChange(event) {
    setLocation(event.target.value);
    setAnalysisResult(null);
  }

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setError("");

    const requestId = `${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: `${requestId}-user`,
        role: "user",
        text: "Please check this photo for gateway structures.",
        fortName: resolvedFort,
        location: resolvedLocation,
        previewUrl,
      },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await analyzeImage(file, {
        fortName: resolvedFort,
        location: resolvedLocation,
      });
      setAnalysisResult(result);
      const highestConfidence = result.detections.length
        ? Math.max(...result.detections.map((detection) => detection.confidence))
        : 0;
      setMessages((current) => [
        ...current,
        {
          id: `${requestId}-assistant`,
          role: "assistant",
          text: result.detections.length
            ? `Gateway detected at ${result.fort_name}, ${result.location}. The model found ${result.detections.length} gateway${result.detections.length === 1 ? "" : "s"} with a highest confidence score of ${Math.round(highestConfidence * 100)}%. This score describes the model's confidence in this prediction, not its overall accuracy. You can now ask a follow-up question below.`
            : `I couldn't detect a gateway in this photo at ${result.fort_name}, ${result.location}. Try a clearer, closer image with the entrance visible. The current model only detects gateways.`,
          result,
        },
      ]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        {
          id: `${requestId}-error`,
          role: "assistant",
          text: requestError.message || "I couldn't analyze that photo. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuestionSubmit(event) {
    event.preventDefault();
    const userQuestion = question.trim();
    if (!hasGateway || !userQuestion) return;

    const requestId = `${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: `${requestId}-user`,
        role: "user",
        text: userQuestion,
        fortName: resolvedFort,
        location: resolvedLocation,
      },
    ]);
    setQuestion("");

    const loweredQuestion = userQuestion.toLowerCase();
    let response;
    if (/\b(how many|number of|count)\b/.test(loweredQuestion)) {
      response = `The model detected ${analysisResult.detections.length} gateway${analysisResult.detections.length === 1 ? "" : "s"} in this image.`;
    } else if (/\b(confidence|confident|accuracy|accurate|sure)\b/.test(loweredQuestion)) {
      response = `The highest gateway detection confidence for this image is ${Math.round(maxConfidence * 100)}%. Confidence is the model's score for this prediction; it is not the model's overall accuracy.`;
    } else {
      response = "I can report the gateway detections and their confidence scores, but historical and open-ended question answering isn't connected yet. Your photo shows " +
        `${analysisResult.detections.length} detected gateway${analysisResult.detections.length === 1 ? "" : "s"}, with a highest confidence of ${Math.round(maxConfidence * 100)}%.`;
    }

    setMessages((current) => [
      ...current,
      { id: `${requestId}-assistant`, role: "assistant", text: response },
    ]);
  }

  function handleClose() {
    onClose();
  }

  return (
    <div className="dialog-backdrop chat-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) handleClose();
    }}>
      <section
        aria-labelledby="chat-title"
        aria-modal="true"
        className="chat-workspace"
        role="dialog"
      >
        <header className="chat-header">
          <a aria-label="Fort Guide home" className="chat-brand" href="#home" onClick={handleClose}>
            <span className="chat-brand-icon"><MessageCircle size={19} /></span>
            <span><strong id="chat-title">Fort Guide assistant</strong><small>PHOTO EXPLORER · GATEWAY DETECTION</small></span>
          </a>
          <span className="chat-status"><span /> Gateway detector ready</span>
          <button aria-label="Close assistant" className="dialog-close" onClick={handleClose}>
            <X size={19} />
          </button>
        </header>

        <div className="chat-layout">
          <section aria-label="Fort Guide conversation" className="chat-main">
            <div aria-live="polite" className="chat-messages" ref={conversationRef}>
              <div className="chat-date-label"><span /> YOUR FORT DISCOVERY <span /></div>
              {messages.map((message) => (
                <article className={`chat-message ${message.role}${message.isError ? " message-error" : ""}`} key={message.id}>
                  {message.role === "assistant" && (
                    <span className="message-avatar"><Sparkles size={15} /></span>
                  )}
                  <div className="message-content">
                    <span className="message-author">{message.role === "assistant" ? "FORT GUIDE" : "YOU"}</span>
                    <p>{message.text}</p>
                    {message.role === "user" && (
                      <>
                        <div className="message-context"><MapPin size={12} /> {message.fortName} · {message.location}</div>
                        {message.previewUrl && (
                          <img alt="Photo attached for analysis" className="message-photo" src={message.previewUrl} />
                        )}
                      </>
                    )}
                    {message.result && (
                      <div className="message-result">
                        <img alt="Gateway detection results" className="message-result-image" src={message.result.annotated_image} />
                        {message.result.detections.length > 0 && (
                          <>
                            <div className="confidence-summary">
                              <span className="confidence-gauge"><ScanSearch size={16} /></span>
                              <span><strong>Gateway detected</strong><small>Highest model confidence</small></span>
                              <b>{Math.round(Math.max(...message.result.detections.map((detection) => detection.confidence)) * 100)}%</b>
                            </div>
                            <div className="message-detections">
                              {message.result.detections.map((detection, index) => (
                                <span className="detection-chip" key={`${detection.class_name}-${index}`}>
                                  <Check size={12} /> Gateway {index + 1} · {Math.round(detection.confidence * 100)}%
                                </span>
                              ))}
                            </div>
                            <p className="confidence-note">Confidence is the model's score for this prediction, not its overall accuracy.</p>
                          </>
                        )}
                        {message.result.detections.length === 0 && (
                          <div className="no-detection-summary">
                            <Info size={15} /> No gateway detected. Try a closer photo with the entrance clearly visible.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {isLoading && (
                <div className="typing-indicator" role="status">
                  <span className="message-avatar"><Sparkles size={15} /></span>
                  <span><LoaderCircle className="spin" size={15} /> Checking your photo for gateways…</span>
                </div>
              )}
            </div>

            {hasGateway ? (
              <form className="chat-composer" onSubmit={handleQuestionSubmit}>
                {error && <p className="chat-error" role="alert">{error}</p>}
                <div className="follow-up-prompt">
                  <Sparkles size={14} />
                  <span><strong>Gateway found.</strong> What would you like to know about this photo?</span>
                </div>
                <div className="composer-row">
                  <label className="visually-hidden" htmlFor="chat-question">Ask a follow-up question</label>
                  <input
                    autoComplete="off"
                    id="chat-question"
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask about gateway confidence or detections…"
                    ref={questionInputRef}
                    value={question}
                  />
                  <button
                    aria-label="Send follow-up question"
                    className="send-message-button"
                    disabled={!question.trim()}
                    title="Send your question"
                    type="submit"
                  >
                    <ArrowUp size={19} />
                  </button>
                </div>
                <p className="composer-disclaimer"><Info size={12} /> I can answer questions about detection results. Historical answers aren't available yet.</p>
              </form>
            ) : (
              <div className="analysis-prompt">
                <span className="analysis-prompt-icon"><ScanSearch size={18} /></span>
                <p>
                  {analysisResult
                    ? "No gateway was detected. Try another photo to continue."
                    : "Choose a fort and upload its gateway photo. Your detection and confidence score will appear here."}
                </p>
              </div>
            )}
          </section>

          <aside aria-label="Photo and fort details" className="chat-sidebar">
            <div className="sidebar-title">
              <span className="eyebrow"><ScanSearch size={14} /> NEW ANALYSIS</span>
              <h2>Tell us what you're exploring</h2>
              <p>Choose the fort and location, upload a photo, then run the gateway check.</p>
            </div>

            <div className="chat-field">
              <label htmlFor="fort-select">Fort name <span>*</span></label>
              <select id="fort-select" onChange={handleFortChange} value={fortName}>
                <option disabled value="">Select a fort</option>
                {forts.map((fort) => <option key={fort.name} value={fort.name}>{fort.name}</option>)}
              </select>
              {fortName === "Other fort" && (
                <input
                  aria-label="Enter fort name"
                  onChange={(event) => setCustomFortName(event.target.value)}
                  placeholder="Enter the fort name"
                  value={customFortName}
                />
              )}
            </div>

            <div className="chat-field">
              <label htmlFor="location-select">District / location <span>*</span></label>
              <select id="location-select" onChange={handleLocationChange} value={location}>
                <option disabled value="">Select a location</option>
                {locations.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {location === "Other location" && (
                <input
                  aria-label="Enter location"
                  onChange={(event) => setCustomLocation(event.target.value)}
                  placeholder="Enter the district or location"
                  value={customLocation}
                />
              )}
              {selectedFort?.location && location === selectedFort.location && (
                <small className="field-hint">Suggested from the selected fort; you can change it.</small>
              )}
            </div>

            <div className="chat-field photo-field">
              <div className="photo-field-heading">
                <label>Fort photograph <span>*</span></label>
                <span>MAX 10 MB</span>
              </div>
              <input
                accept="image/*"
                className="visually-hidden"
                onChange={(event) => chooseFile(event.target.files?.[0])}
                ref={fileInputRef}
                type="file"
              />
              <button
                className={`chat-upload-zone${isDragging ? " is-dragging" : ""}${previewUrl ? " has-image" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  chooseFile(event.dataTransfer.files[0]);
                }}
                type="button"
              >
                {previewUrl ? (
                  <>
                    <img alt="Selected fort photo preview" className="chat-upload-preview" src={previewUrl} />
                    <span className="replace-photo"><Upload size={13} /> Replace photo</span>
                  </>
                ) : (
                  <span className="chat-upload-empty">
                    <span className="chat-upload-icon"><ImagePlus size={19} /></span>
                    <strong>Drop a photo here</strong>
                    <span>or <span className="text-link">browse files</span></span>
                    <small>JPG, PNG or WEBP</small>
                  </span>
                )}
              </button>
              {file && <span className="selected-file-name">{file.name}</span>}
            </div>

            <button
              className="button button-gold analyze-photo-button"
              disabled={!canAnalyze}
              onClick={handleAnalyze}
              type="button"
            >
              {isLoading ? <LoaderCircle className="spin" size={16} /> : <ScanSearch size={16} />}
              {isLoading ? "Checking gateway…" : "Analyze photo"}
            </button>
            {error && <p className="chat-error sidebar-error" role="alert">{error}</p>}

            <div className="chat-scope-note">
              <ShieldCheck size={16} />
              <p><strong>Confidence, not accuracy</strong><br />The score describes the model's confidence for this photo. Fort and location are context you provide, not image verification.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
