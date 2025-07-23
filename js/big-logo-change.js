// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Select the logo container element
    const logoContainer = document.querySelector('.big-logo-container-top');

    // Check if the element exists to prevent errors
    if (!logoContainer) {
        console.warn("Element with class '.big-logo-container-top' not found.");
        return;
    }

    // Store the original height of the container for calculations
    // offsetHeight might be 0 if the image hasn't loaded, so we use getBoundingClientRect
    let originalHeight = logoContainer.getBoundingClientRect().height;

    // Debounce function to limit how often the scroll handler runs
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to handle the scroll event
    function handleScroll() {
        // Get the current vertical scroll position
        const scrollY = window.scrollY;

        // If we haven't determined the original height yet, or if it might have changed, check it
        if (originalHeight <= 0) {
            originalHeight = logoContainer.getBoundingClientRect().height;
        }

        let clipHeight = originalHeight - scrollY;

        // Ensure the clipHeight doesn't go below 0 (fully hidden) or above originalHeight (fully visible)
        clipHeight = Math.max(0, Math.min(originalHeight, clipHeight));

        // Apply the clipping using CSS clip-path
        // polygon(x1 y1, x2 y2, x3 y3, x4 y4) defines a shape.
        // We define a rectangle that shrinks in height from the top.
        logoContainer.style.clipPath = `polygon(0 0, 100% 0, 100% ${clipHeight}px, 0 ${clipHeight}px)`;
        // Alternative using clip (deprecated but might have wider support for simple rects):
        // logoContainer.style.clip = `rect(0px, auto, ${clipHeight}px, 0px)`;
        // Note: clip requires the element to be absolutely positioned or fixed, and the container might need specific dimensions.
        // clip-path is generally preferred for modern browsers.
    }

    // Add the scroll event listener with debouncing for performance
    // Adjust the debounce wait time (e.g., 10) as needed. Lower is more responsive, higher is less taxing on performance.
    window.addEventListener('scroll', debounce(handleScroll, 2));

});