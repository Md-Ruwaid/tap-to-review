import { useState, useEffect } from "react";
import { CATEGORIES, DEFAULT_BUSINESS, API_BASE_URL } from "./config";
import "./App.css";

function App() {
  // Step 9: Read business ID from URL search params (defaults to randomCafe)
  const params = new URLSearchParams(window.location.search);
  const businessId = params.get("business") || "randomCafe";

  const [business, setBusiness] = useState(null);

  // Track exactly one selected tag per category: { ambience: null, taste: null, service: null }
  const [selectedTags, setSelectedTags] = useState({
    ambience: null,
    taste: null,
    service: null,
  });

  // Step 8: Editable sentence and copy state
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch business config generic per cafe
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

  // Radio button behavior: select tag in specific category (or deselect if tapped again)
  const handleTagClick = (categoryKey, tag) => {
    setSelectedTags((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey] === tag ? null : tag,
    }));
  };

  // Count how many categories have a selection
  const selectedCount = Object.values(selectedTags).filter(Boolean).length;
  const isComplete = selectedCount === CATEGORIES.length;

  // Step 7: Call backend /generate-review
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
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.sentence) {
        setSentence(data.sentence);
      } else {
        throw new Error("No review sentence returned");
      }
    } catch (err) {
      console.warn("Backend call failed, using client fallback:", err.message);
      // Failsafe client fallback per PRD guarantees demo never breaks
      const fallback = `Honestly such a ${selectedTags.ambience} spot—service was super ${selectedTags.service} and the food was legit ${selectedTags.taste}, 10/10!`;
      setSentence(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Step 8: Copy to clipboard using built-in navigator API with "Copied!" feedback
  function copyToClipboard() {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Loading state while fetching cafe config
  if (!business) {
    return (
      <div className="app-wrapper loading-screen">
        <div className="spinner" />
        <p>Loading cafe experience...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* 1. Cafe Header */}
      <header className="cafe-header">
        <div className="brand-badge">📍 {business.city || "Hyderabad"}</div>
        <h1 className="cafe-title">{business.name}</h1>
        <p className="cafe-subtitle">Tap 1 tag per category to generate your review</p>
      </header>

      {/* 2. Progress Tracker */}
      <div className="progress-card">
        <div className="progress-info">
          <span className="progress-title">Review Highlights</span>
          <span className="progress-count">
            {selectedCount} of {CATEGORIES.length} selected
          </span>
        </div>
        <div className="progress-dots">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`dot ${selectedTags[cat.key] ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Three Fixed Category Blocks */}
      <section className="categories-container">
        {CATEGORIES.map((category) => {
          const currentSelection = selectedTags[category.key];
          const tagOptions = business.tags?.[category.key] || [];

          return (
            <div
              key={category.key}
              className={`category-block ${currentSelection ? "has-selection" : ""}`}
            >
              <div className="category-header">
                <div className="category-label-group">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.label}</span>
                </div>
                <span
                  className={`category-status ${currentSelection ? "chosen" : ""}`}
                >
                  {currentSelection ? `✓ ${currentSelection}` : "Choose 1"}
                </span>
              </div>

              {/* Radio Tag Options */}
              <div className="tags-grid">
                {tagOptions.map((tag) => {
                  const isSelected = currentSelection === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-button ${isSelected ? "selected" : ""}`}
                      onClick={() => handleTagClick(category.key, tag)}
                    >
                      <span className="tag-text">{tag}</span>
                      <span className="tag-indicator" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. Generate CTA */}
      <div className="action-card">
        <button
          type="button"
          className={`generate-button ${isComplete && !loading ? "active" : "disabled"}`}
          disabled={!isComplete || loading}
          onClick={handleGenerateClick}
        >
          {loading ? (
            <>
              <span className="spinner" />
              <span>Cooking your review...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>
                {isComplete ? "Generate Review" : `Select ${CATEGORIES.length - selectedCount} more to unlock`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Step 8: Editable textarea + copy button */}
      {sentence && (
        <div className="result output-card">
          <div className="output-header">
            <span className="output-title">Your Review Sentence</span>
            <div className="output-tag-chips">
              <span>{selectedTags.ambience}</span> •
              <span>{selectedTags.taste}</span> •
              <span>{selectedTags.service}</span>
            </div>
          </div>

          <textarea
            className="review-textarea"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            rows={3}
            placeholder="Your review sentence will appear here..."
          />

          <div className="output-actions">
            <button
              type="button"
              className={`copy-button ${copied ? "copied" : ""}`}
              onClick={copyToClipboard}
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              type="button"
              className="reroll-button"
              onClick={handleGenerateClick}
              disabled={loading}
              title="Generate another variation"
            >
              <span>🎲</span>
              <span>Re-roll</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
