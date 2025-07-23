// Select the big logo container
const bigLogoContainer = document.querySelector('.big-logo-container');

// Function to handle scroll event
function handleScroll() {
    // Get the current scroll position
    const scrollTop = window.scrollY;

    // Calculate the maximum scroll height (height of the hero section)
    const heroSection = document.querySelector('.hero-section');
    const heroHeight = heroSection.offsetHeight;

    // Calculate the percentage of scroll (0 to 1)
    let scrollPercent = scrollTop / heroHeight;
    
    // Ensure scrollPercent stays between 0 and 1
    scrollPercent = Math.max(0, Math.min(1, scrollPercent));

    // Calculate the mask position (0% to 100% from top)
    const maskPosition = scrollPercent * 100;

    // Apply the mask effect using CSS clip-path or background gradient
    // Method 1: Using linear gradient background with hard stop
    bigLogoContainer.style.background = `linear-gradient(to bottom, 
        #000000 0%, 
        #000000 ${100 - maskPosition}%, 
        #E8E8E7 ${100 - maskPosition}%, 
        #E8E8E7 100%)`;
    
    // Make sure the text is transparent so the background shows through
    bigLogoContainer.style.webkitBackgroundClip = 'text';
    bigLogoContainer.style.backgroundClip = 'text';
    bigLogoContainer.style.webkitTextFillColor = 'transparent';
    bigLogoContainer.style.color = 'transparent';
}

// Alternative method using clip-path (uncomment if you prefer this approach)
function handleScrollClipPath() {
    const scrollTop = window.scrollY;
    const heroSection = document.querySelector('.hero-section');
    const heroHeight = heroSection.offsetHeight;
    
    let scrollPercent = scrollTop / heroHeight;
    scrollPercent = Math.max(0, Math.min(1, scrollPercent));
    
    const maskPosition = scrollPercent * 100;
    
    // Create two overlapping elements with different colors
    // This requires HTML structure changes (see comments below)
    const topPart = bigLogoContainer.querySelector('.logo-top');
    const bottomPart = bigLogoContainer.querySelector('.logo-bottom');
    
    if (topPart && bottomPart) {
        // Clip the top part (black) to show only the unscrolled portion
        topPart.style.clipPath = `inset(0 0 ${maskPosition}% 0)`;
        
        // Clip the bottom part (grey) to show only the scrolled portion
        bottomPart.style.clipPath = `inset(${100 - maskPosition}% 0 0 0)`;
    }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Initial call to set the initial state
handleScroll();