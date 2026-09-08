import { useState, useRef, useEffect } from "react";
import { triggerHaptic } from "./haptics";
import { getTagEmoji } from "./config";

function getAnchorForTag(tag, tags) {
  const idx = tags.indexOf(tag);
  if (idx === 0) return 0;
  if (idx === 1) return 50;
  if (idx === 2) return 100;
  return 50;
}

function getClosestTagIndex(val) {
  if (val < 25) return 0;
  if (val <= 75) return 1;
  return 2;
}

/**
 * Interactive Slider component with ultra-smooth 60/120fps continuous dragging,
 * zero-lag emoji badge tracking, and snap-to-tag physics.
 */
export default function CentaurSlider({
  categoryKey,
  tags = [],
  selectedTag,
  onSelectTag,
}) {
  const isDraggingRef = useRef(false);
  const lastClosestIdxRef = useRef(tags.indexOf(selectedTag));
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(() => getAnchorForTag(selectedTag, tags));

  // Sync external changes (e.g. from buttons/reset) only when user is not actively dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setSliderValue(selectedTag ? getAnchorForTag(selectedTag, tags) : 50);
      lastClosestIdxRef.current = tags.indexOf(selectedTag);
    }
  }, [selectedTag, tags]);

  const closestIndex = getClosestTagIndex(sliderValue);
  const closestTag = tags[closestIndex];
  const activeEmoji = getTagEmoji(closestTag, categoryKey, closestIndex);

  // Drag start
  const handlePointerDown = () => {
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  // Continuous high-precision input (0..100)
  const handleSliderInput = (e) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);

    const newClosest = getClosestTagIndex(val);
    if (newClosest !== lastClosestIdxRef.current) {
      lastClosestIdxRef.current = newClosest;
      triggerHaptic("tick");
      onSelectTag(tags[newClosest]);
    }
  };

  // Drag release with smooth snap to exact tag anchor
  const handleRelease = () => {
    isDraggingRef.current = false;
    setIsDragging(false);

    const snapIdx = getClosestTagIndex(sliderValue);
    const snapValue = snapIdx === 0 ? 0 : snapIdx === 1 ? 50 : 100;

    setSliderValue(snapValue);
    lastClosestIdxRef.current = snapIdx;
    triggerHaptic("snap");
    onSelectTag(tags[snapIdx]);
  };

  // Direct click on a tag pill button
  const handleTagClick = (index) => {
    const targetTag = tags[index];
    if (selectedTag === targetTag) {
      onSelectTag(null);
      lastClosestIdxRef.current = -1;
      triggerHaptic("select");
    } else {
      const snapValue = index === 0 ? 0 : index === 1 ? 50 : 100;
      setSliderValue(snapValue);
      lastClosestIdxRef.current = index;
      triggerHaptic("select");
      onSelectTag(targetTag);
    }
  };

  // Precise thumb-center calculation: accounts for thumb width across track
  // At 0% -> +8px offset; at 50% -> 0px offset; at 100% -> -8px offset
  const thumbLeftCalc = `calc(${sliderValue}% + ${(50 - sliderValue) * 0.16}px)`;

  return (
    <div
      className={`centaur-slider-wrapper ${selectedTag ? "is-selected" : "is-untouched"} ${
        isDragging ? "is-sliding" : ""
      }`}
    >
      <div className="slider-track-container">
        {/* Dynamic Emoji Badge riding directly above the slider thumb with zero drag-lag */}
        <div
          className={`slider-emoji-badge ${selectedTag ? "active" : "idle"} ${
            isDragging ? "dragging" : ""
          }`}
          style={{ left: thumbLeftCalc }}
        >
          <span className="slider-emoji-symbol" role="img" aria-label={closestTag || "tag emoji"}>
            {activeEmoji}
          </span>
          <span className="slider-emoji-beak" />
        </div>

        <label className="centaur-slider" htmlFor={`slider-range-${categoryKey}`}>
          <input
            id={`slider-range-${categoryKey}`}
            type="range"
            className="centaur"
            min="0"
            max="100"
            step="0.5"
            value={sliderValue}
            onPointerDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onInput={handleSliderInput}
            onPointerUp={handleRelease}
            onTouchEnd={handleRelease}
            onKeyUp={handleRelease}
            aria-label={`${categoryKey} slider`}
          />
        </label>
      </div>

      {/* Attached Tags with their respective emojis */}
      <div className="attached-tags-row">
        {tags.map((tag, idx) => {
          const isClosest = closestIndex === idx;
          const isSelected = selectedTag === tag;
          const tagEmoji = getTagEmoji(tag, categoryKey, idx);

          return (
            <button
              key={tag}
              type="button"
              className={`attached-tag-btn tag-pos-${idx} ${
                isSelected ? "selected" : ""
              } ${isClosest && selectedTag ? "closest" : ""}`}
              onClick={() => handleTagClick(idx)}
              title={`Tap to select "${tag}"`}
            >
              <span className="tag-emoji-icon">{tagEmoji}</span>
              <span className="tag-label-text">{tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
