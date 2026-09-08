// Mobile vibration feedback utility with safe fallback for unsupported browsers
export function triggerHaptic(type = "tick") {
  if (typeof window === "undefined" || !window.navigator || !window.navigator.vibrate) {
    return;
  }
  try {
    if (type === "tick") {
      // Crisp subtle tick during slider movement across tag thresholds
      window.navigator.vibrate(12);
    } else if (type === "snap") {
      // Confirmatory dual-pulse snap when releasing onto an anchor
      window.navigator.vibrate([16, 24, 18]);
    } else if (type === "select") {
      // Tactile button tap
      window.navigator.vibrate(18);
    } else if (type === "success") {
      // Copy to clipboard or generate success
      window.navigator.vibrate([25, 40, 25]);
    }
  } catch {
    // Graceful fallback on restricted environments
  }
}
