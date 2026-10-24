
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { detectSilhouette } from "./services/poseDetection";

function getShoppingLinks(query) {
  const search = encodeURIComponent(query);

  return [
    {
      label: "Amazon India",
      url: `https://www.amazon.in/s?k=${search}`,
    },
    {
      label: "Google Shopping",
      url: `https://www.google.com/search?tbm=shop&q=${search}`,
    },
  ];
}

function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoImageRef = useRef(null);
  const objectUrlRef = useRef("");

  const [cameraOn, setCameraOn] = useState(false);
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }

  function clearPhoto() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    setPhoto("");
    setAnalysis(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) stopCamera();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  async function startCamera() {
    setError("");
    clearPhoto();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires HTTPS or localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setError(
        "Camera access was denied or unavailable. Allow camera permission or upload a photo."
      );
    }
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setError("The camera is still starting. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture the photo. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    clearPhoto();
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
    setError("");
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please select an image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    stopCamera();
    clearPhoto();

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setPhoto(objectUrl);
    setError("");
    event.target.value = "";
  }

  function reset() {
    stopCamera();
    clearPhoto();
    setError("");
    setIsAnalyzing(false);
  }

  async function getSuggestions() {
    const image = photoImageRef.current;

    if (!image || !photo) {
      setError("Please capture or upload a photo first.");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setShowSuggestions(false);
    setAnalysis(null);
    setSuggestions([]);

    try {
      await image.decode();

      const result = await detectSilhouette(image);

      setAnalysis(result);
      setSuggestions(result.recommendations);
      setShowSuggestions(true);
    } catch (err) {
      setError(
        err.message ||
          "Analysis failed. Please try another full-body photo."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#" aria-label="Silhoué home">
          Silhoué<span>.</span>
        </a>

        <nav className="nav-links">
          <a href="#scanner">Discover</a>
          <a href="#scanner">Your silhouette</a>
        </nav>
      </header>

      <main className="workspace" id="scanner">
        <section className="camera-panel">
          <div className="panel-topline">
            <span className="panel-number">01</span>

            <span className="panel-title">
              {showSuggestions
                ? "YOUR STYLE PHOTO"
                : "SILHOUETTE SCANNER"}
            </span>

            <span className={`status ${cameraOn ? "status-live" : ""}`}>
              <span />
              {cameraOn
                ? "CAMERA LIVE"
                : photo
                  ? "PHOTO READY"
                  : "CAMERA OFF"}
            </span>
          </div>

          <div className="camera-stage">
            {cameraOn && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="camera-media"
              />
            )}

            {photo && (
              <img
                ref={photoImageRef}
                src={photo}
                alt="Selected style photo"
                className="camera-media uploaded-photo"
              />
            )}

            {!cameraOn && !photo && (
              <div className="camera-empty">
                <div className="camera-icon">◉</div>

                <h2>Let's find your fit.</h2>

                <p>
                  Capture a full-body photo to explore clothing styles
                  that work for your preferences and proportions.
                </p>

                <div className="camera-frame-guide">
                  <span>FULL BODY</span>
                  <span className="guide-person">♙</span>
                </div>
              </div>
            )}

            {(cameraOn || photo) && (
              <div className="scan-overlay">
                <span className="scan-corner top-left" />
                <span className="scan-corner top-right" />
                <span className="scan-corner bottom-left" />
                <span className="scan-corner bottom-right" />
              </div>
            )}
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <div className="camera-actions">
            {!cameraOn && !photo && (
              <button className="primary-button" onClick={startCamera}>
                ◉ Enable Camera
              </button>
            )}

            {cameraOn && (
              <button className="primary-button" onClick={capturePhoto}>
                Capture Photo <span>◉</span>
              </button>
            )}

            {photo && !showSuggestions && (
              <button
                className="primary-button"
                onClick={getSuggestions}
                disabled={isAnalyzing}
              >
                {isAnalyzing
                  ? "Analysing your photo..."
                  : "Analyse My Silhouette"}

                {!isAnalyzing && <span> ↗</span>}
              </button>
            )}

            {!cameraOn && (
              <label className="upload-button">
                ↑ Upload Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                />
              </label>
            )}

            {(cameraOn || photo) && (
              <button className="reset-button" onClick={reset}>
                Retake / Reset
              </button>
            )}
          </div>

          <p className="privacy-note">
            ♡ Camera activates only when you choose. Photo analysis runs
            in this browser demo.
          </p>
        </section>

        <aside className="style-panel">
          <div className="panel-topline">
            <span className="panel-number">02</span>
            <span className="panel-title">STYLE RECOMMENDATIONS</span>
          </div>

          {!showSuggestions ? (
            <div className="profile-intro">
              <span className="profile-sparkle">✳</span>

              <p className="profile-kicker">
                YOUR PERSONAL STYLE GUIDE
              </p>

              <h2>
                Your style,
                <br />
                your <em>story.</em>
              </h2>

              <p>
                Take a photo to start exploring clothing combinations,
                fits, and style ideas.
              </p>

              <div className="style-divider" />

              <div className="waiting-state">
                <span>01</span>
                <p>Capture or upload a full-body photo</p>
              </div>

              <div className="waiting-state">
                <span>02</span>
                <p>Explore outfit ideas and styling tips</p>
              </div>

              <div className="waiting-state">
                <span>03</span>
                <p>Choose what feels right for you</p>
              </div>
            </div>
          ) : (
            <div className="suggestion-results">
              <p className="profile-kicker">
                YOUR STYLE STARTING POINT
              </p>

              <h2>
                Explore your
                <br />
                <em>possibilities.</em>
              </h2>

              {analysis && (
                <>
                  <p className="results-note">
                    {analysis.observation}
                  </p>

                  <p className="results-note analysis-disclaimer">
                    {analysis.note}
                  </p>
                </>
              )}

              <div className="suggestion-carousel">
                {suggestions.map((item) => (
                  <article
                    className="suggestion-card"
                    key={item.title}
                  >
                    <span>{item.tag}</span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div className="shop-links">
                      {getShoppingLinks(
                        item.shopQuery || item.title
                      ).map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-link"
                        >
                          {link.label}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <button className="text-button" onClick={reset}>
                ↶ Start again
              </button>
            </div>
          )}
        </aside>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          Silhoué<span>.</span>
        </a>

        <p>Dress like yourself.</p>

        <span>YOUR STYLE. YOUR CHOICE. © 2026</span>
      </footer>
    </div>
  );
}

export default App;
