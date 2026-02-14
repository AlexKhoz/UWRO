function initStackingEffect() {
  const sections = document.querySelectorAll(".divine-digital-section");
  const afterSection = document.querySelector(".after-stacking");
  if (sections.length === 0) return;

  // Ensure CSS controls sticky; avoid JS transforms that cause scroll jank
  sections.forEach((section) => {
    section.style.position = "";
    section.style.top = "";
    section.style.zIndex = "";
    section.style.willChange = "";
    section.style.transform = "";
  });

  // Style the after-stacking section
  if (afterSection) {
    Object.assign(afterSection.style, {
      position: "relative",
      zIndex: "5", // Ensure it's below the stacked sections
      transform: "translateY(0)", // Start in normal flow
      // Removed transition as it might interfere
      willChange: "transform",
    });
  }

  // No scroll handler needed; CSS sticky will manage positioning

  // Optional cleanup function
  return function destroy() {
    // no-op: no listeners were attached
    sections.forEach((section) => {
      section.style.position = "";
      section.style.top = "";
      section.style.zIndex = "";
      section.style.transform = "";
      section.style.willChange = "";
    });
    if (afterSection) {
      afterSection.style.position = "";
      afterSection.style.zIndex = "";
      afterSection.style.transform = "";
    }
  };
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStackingEffect);
} else {
  initStackingEffect();
}
