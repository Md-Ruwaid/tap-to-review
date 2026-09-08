import { useState, useEffect } from "react";
import { CATEGORIES, DEFAULT_BUSINESS, API_BASE_URL } from "./config";
import "./App.css";

function App() {
  const params = new URLSearchParams(window.location.search);
  const businessId = params.get("business") || "randomCafe";

  const [business, setBusiness] = useState(null);
  const [selectedTags, setSelectedTags] = useState({
    ambience: null,
    taste: null,
    service: null,
  });

  const [sentence, setSentence] = useState("");
  const [source, setSource] = useState(null);
  const [sourceReason, setSourceReason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/business/${businessId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Business not found");
        return res.json();
      })
      .then((data) => {
        setBusiness(data);
      })
      .catch((err) => {
        console.warn("Could not fetch remote config, using fallback:", err.message);
        setBusiness({
          ...DEFAULT_BUSINESS,
          name: "randomCafe",
        });
      });
  }, [businessId]);

  const handleTagClick = (categoryKey, tag) => {
    setSelectedTags((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey] === tag ? null : tag,
    }));
  };

  const selectedCount = Object.values(selectedTags).filter(Boolean).length;
  const isComplete = selectedCount === CATEGORIES.length;

  const handleGenerateClick = async () => {
    if (!isComplete || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/generate-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business?.id || businessId,
          tags: {
            ambience: selectedTags.ambience,
            taste: selectedTags.taste,
            service: selectedTags.service,
          },
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("401: Vercel Deployment Protection enabled");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.sentence) {
        setSentence(data.sentence);
        setSource(data.source || "gemini");
        setSourceReason(data.reason || null);
      } else {
        throw new Error("No review sentence returned");
      }
    } catch (err) {
      console.warn("Backend call failed, using client fallback:", err.message);
      const fallback = `ngl the ${selectedTags.ambience} vibe caught me off guard, food was ${selectedTags.taste} and staff were ${selectedTags.service}`;
      setSentence(fallback);
      setSource("fallback");
      setSourceReason(err.message.includes("401") ? "401_protected" : "offline");
    } finally {
      setLoading(false);
    }
  };

  function copyToClipboard() {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (!business) {
    return (
      <div className="app-wrapper loading-state">
        <div className="minimal-spinner" />
        <p className="loading-label">Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* 1. Minimal Header */}
      <header className="cafe-header">
        <div className="header-meta">
          <span className="location-tag">{business.city || "Hyderabad"}</span>
          <span className="counter-pill">
            {selectedCount} / {CATEGORIES.length}
          </span>
        </div>
        <h1 className="cafe-title">{business.name}</h1>
        <p className="cafe-subtitle">Select 3 words that match your visit</p>

        {/* Hairline Segmented Progress Bar */}
        <div className="segment-bar">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`segment ${selectedTags[cat.key] ? "filled" : ""}`}
            />
          ))}
        </div>
      </header>

      {/* 2. Minimal Category Sections */}
      <section className="categories-list">
        {CATEGORIES.map((category) => {
          const currentSelection = selectedTags[category.key];
          const tagOptions = business.tags?.[category.key] || [];

          return (
            <div
              key={category.key}
              className={`category-item ${currentSelection ? "has-selection" : ""}`}
            >
              <div className="category-meta">
                <div className="category-label-wrap">
                  <span className="category-index">{category.index}</span>
                  <span className="category-title">{category.label}</span>
                </div>
                <span className={`selection-status ${currentSelection ? "active" : ""}`}>
                  {currentSelection || "Select 1"}
                </span>
              </div>

              {/* Clean Tactile Pill Buttons */}
              <div className="tags-row">
                {tagOptions.map((tag) => {
                  const isSelected = currentSelection === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => handleTagClick(category.key, tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Action / Draft CTA */}
      <div className="action-area">
        <button
          type="button"
          className={`draft-button ${isComplete && !loading ? "active" : "disabled"}`}
          disabled={!isComplete || loading}
          onClick={handleGenerateClick}
        >
          {loading ? (
            <>
              <span className="minimal-spinner button-spinner" />
              <span>Drafting...</span>
            </>
          ) : isComplete ? (
            <span>Draft review</span>
          ) : (
            <span>Select {CATEGORIES.length - selectedCount} more to draft</span>
          )}
        </button>
      </div>

      {/* 4. Minimalist Review Draft Note */}
      {sentence && (
        <div className="draft-card">
          <div className="draft-card-header">
            <span className="draft-card-title">Your draft</span>
            <div className="draft-tags">
              <span>{selectedTags.ambience}</span>
              <span className="divider">•</span>
              <span>{selectedTags.taste}</span>
              <span className="divider">•</span>
              <span>{selectedTags.service}</span>
            </div>
          </div>

          <textarea
            className="draft-textarea"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            rows={3}
            placeholder="Review draft..."
          />

          {/* Discreet diagnostic status note */}
          {source && (
            <div className="draft-meta-footer">
              <span className={`status-indicator ${source === "gemini" ? "live" : "fallback"}`}>
                <span className="status-dot" />
                {source === "gemini"
                  ? "Live draft"
                  : sourceReason === "missing_api_key"
                  ? "Offline (API key required)"
                  : sourceReason === "401_protected"
                  ? "Offline (Vercel protection active)"
                  : "Offline draft"}
              </span>
            </div>
          )}

          <div className="draft-actions">
            <button
              type="button"
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={copyToClipboard}
            >
              {copied ? "Copied to clipboard ✓" : "Copy note"}
            </button>

            <button
              type="button"
              className="refresh-btn"
              onClick={handleGenerateClick}
              disabled={loading}
              title="Generate a different draft variation"
            >
              Try another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
