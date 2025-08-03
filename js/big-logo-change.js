// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Select the logo container element
    const logoContainer = document.querySelector('.big-logo-container-top');

    // Check if the element exists to prevent errors
    if (!logoContainer) {
        console.warn("Element with class '.big-logo-container-top' not found.");
        return;
    }

    let originalHeight = 0;
    let currentClipHeight = 0;
    let targetClipHeight = 0;
    let ticking = false;

    // Function to get the current height of the container
    function getCurrentHeight() {
        const rect = logoContainer.getBoundingClientRect();
        return rect.height;
    }

    // Function to update the original height (called on resize and init)
    function updateOriginalHeight() {
        const newHeight = getCurrentHeight();
        if (newHeight > 0) {
            // If height changed significantly, update everything
            if (Math.abs(newHeight - originalHeight) > 1) {
                originalHeight = newHeight;
                // Reset current values to prevent jumps
                currentClipHeight = newHeight;
                targetClipHeight = newHeight;
                console.log("Logo height updated:", originalHeight);
            }
            return true;
        }
        return false;
    }

    // Debounce function to limit how often handlers run
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

    // Smooth interpolation function
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Function to handle the scroll event
    function handleScroll() {
        // Make sure we have a valid height
        if (originalHeight <= 0) {
            if (!updateOriginalHeight()) {
                return;
            }
        }

        // Get the current vertical scroll position
        const scrollY = window.scrollY;

        // Calculate target clip height
        let newTargetHeight = originalHeight - scrollY;

        // Ensure the clipHeight doesn't go below 0 or above originalHeight
        targetClipHeight = Math.max(0, Math.min(originalHeight, newTargetHeight));

        // Use requestAnimationFrame for smooth animation
        if (!ticking) {
            requestAnimationFrame(updateClipping);
            ticking = true;
        }
    }

    // Function to smoothly update the clipping
    function updateClipping() {
        // Smooth interpolation towards target (adjust 0.15 for more/less smoothness)
        currentClipHeight = lerp(currentClipHeight, targetClipHeight, 1.1);

        // Apply the clipping using CSS clip-path with the same polygon approach
        logoContainer.style.clipPath = `polygon(0 0, 100% 0, 100% ${currentClipHeight}px, 0 ${currentClipHeight}px)`;

        // Continue animation if we haven't reached the target
        const difference = Math.abs(currentClipHeight - targetClipHeight);
        if (difference > 0.1) {
            requestAnimationFrame(updateClipping);
        } else {
            ticking = false;
        }
    }

    // Handle window resize - this is the key fix for different screens
    function handleResize() {
        // Force height recalculation
        updateOriginalHeight();
        // Immediately recalculate scroll effect with new dimensions
        handleScroll();
    }

    // Function to initialize the script
    function initialize() {
        if (updateOriginalHeight()) {
            // Initialize current values
            currentClipHeight = originalHeight;
            targetClipHeight = originalHeight;
            // Set initial state
            handleScroll();
        } else {
            // Retry if height not available yet
            setTimeout(initialize, 100);
        }
    }

    // Wait for images and all content to load
    if (document.readyState === 'complete') {
        initialize();
    } else {
        window.addEventListener('load', initialize);
    }

    // Add scroll event listener with improved debouncing
    window.addEventListener('scroll', debounce(handleScroll, 8), { passive: true });

    // Add resize event listener - this is crucial for responsive behavior
    window.addEventListener('resize', debounce(handleResize, 50));

    // Also listen for orientation changes on mobile devices
    window.addEventListener('orientationchange', () => {
        // Wait a bit for orientation change to complete
        setTimeout(handleResize, 100);
    });

    // Fallback initialization
    setTimeout(() => {
        if (originalHeight <= 0) {
            console.log("Fallback initialization attempt");
            initialize();
        }
    }, 500);
});