// Mobile vibration feedback utility with punchy, high-impact tactile feedback
export function triggerHaptic(type = "tick") {
  if (typeof window === "undefined" || !window.navigator || !window.navigator.vibrate) {
    return;
  }
  try {
    if (type === "tick") {
      // Solid, hard tactile thud as slider crosses a tag boundary
      window.navigator.vibrate(45);
    } else if (type === "snap") {
      // Heavy, punchy dual-pulse snap when releasing onto an anchor
      window.navigator.vibrate([70, 45, 95]);
    } else if (type === "select") {
      // Hard tactile pulse on tap
      window.navigator.vibrate(60);
    } else if (type === "success") {
      // Powerful confirmatory celebration buzz on copy / generate
      window.navigator.vibrate([80, 50, 130]);
    }
  } catch {
    // Graceful fallback on restricted environments
  }
}
