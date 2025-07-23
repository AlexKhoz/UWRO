// Select the elements
const bigLogoContainer = document.querySelector('.big-logo-container');
const bigLogo = document.querySelector('.big-logo');
const partnersSection = document.querySelector('.partners-logos');

// Create a unique ID for the gradient definition
const gradientId = 'logoOverlapGradient';

// Function to create the gradient definition in the SVG
function createSVGGradient() {
    // Check if the logo is an SVG file (we'll handle it differently for img tags)
    if (bigLogo && bigLogo.src && bigLogo.src.includes('.svg')) {
        // For SVG files loaded as img tags, we'll use CSS filters instead
        return;
    }

    // If it's an inline SVG, use the previous method
    const svgLogo = bigLogoContainer.querySelector('svg');
    if (!svgLogo) return;

    // Create gradient definition (same as before)
    let existingDefs = svgLogo.querySelector('defs');
    if (!existingDefs) {
        existingDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgLogo.insertBefore(existingDefs, svgLogo.firstChild);
    }

    const existingGradient = existingDefs.querySelector(`#${gradientId}`);
    if (existingGradient) {
        existingGradient.remove();
    }

    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '50%');
    stop1.setAttribute('stop-color', '#000000');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#E8E8E7');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    existingDefs.appendChild(gradient);

    const svgElements = svgLogo.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, line, text');
    svgElements.forEach(element => {
        element.setAttribute('fill', `url(#${gradientId})`);
    });
}

// Function to check if two elements overlap
function getOverlapPercentage(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    // Calculate overlap
    const overlapTop = Math.max(rect1.top, rect2.top);
    const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
    const overlapLeft = Math.max(rect1.left, rect2.left);
    const overlapRight = Math.min(rect1.right, rect2.right);

    // Check if there's any overlap
    if (overlapTop >= overlapBottom || overlapLeft >= overlapRight) {
        return 0; // No overlap
    }

    // Calculate overlap area
    const overlapHeight = overlapBottom - overlapTop;
    const element1Height = rect1.bottom - rect1.top;

    // Return the percentage of element1 that is overlapped
    return Math.min(1, overlapHeight / element1Height);
}

// Function to handle scroll event based on section overlap
function handleScroll() {
    if (!bigLogoContainer || !partnersSection) return;

    // Get overlap percentage between logo and partners section
    const overlapPercentage = getOverlapPercentage(bigLogoContainer, partnersSection);

    // Check if logo is an SVG img tag or inline SVG
    const svgLogo = bigLogoContainer.querySelector('svg');
    const imgLogo = bigLogoContainer.querySelector('img');

    if (imgLogo && imgLogo.src && imgLogo.src.includes('.svg')) {
        // Handle SVG loaded as img tag using CSS mask/filter
        handleSVGImageWithCSS(overlapPercentage);
    } else if (svgLogo) {
        // Handle inline SVG using gradient
        handleInlineSVG(overlapPercentage, svgLogo);
    }
}

// Function to handle SVG loaded as img tag
function handleSVGImageWithCSS(overlapPercentage) {
    const maskPosition = (1 - overlapPercentage) * 100;

    // Create a wrapper div for the mask effect if it doesn't exist
    let maskWrapper = bigLogoContainer.querySelector('.svg-mask-wrapper');
    if (!maskWrapper) {
        maskWrapper = document.createElement('div');
        maskWrapper.className = 'svg-mask-wrapper';
        maskWrapper.style.position = 'relative';
        maskWrapper.style.display = 'inline-block';
        
        // Wrap the img in the mask wrapper
        const img = bigLogoContainer.querySelector('.big-logo');
        img.parentNode.insertBefore(maskWrapper, img);
        maskWrapper.appendChild(img);
        
        // Create the overlay for color change
        const overlay = document.createElement('div');
        overlay.className = 'color-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#E8E8E7';
        overlay.style.mixBlendMode = 'multiply';
        overlay.style.pointerEvents = 'none';
        maskWrapper.appendChild(overlay);
    }

    // Update the mask position
    const overlay = maskWrapper.querySelector('.color-overlay');
    if (overlay) {
        overlay.style.clipPath = `inset(${100 - maskPosition}% 0 0 0)`;
    }
}

// Function to handle inline SVG
function handleInlineSVG(overlapPercentage, svgLogo) {
    const maskPosition = (1 - overlapPercentage) * 100;

    const gradient = svgLogo.querySelector(`#${gradientId}`);
    if (gradient) {
        const stops = gradient.querySelectorAll('stop');
        if (stops.length >= 2) {
            stops[0].setAttribute('offset', `${maskPosition}%`);
            stops[1].setAttribute('offset', `${maskPosition}%`);
        }
    }
}

// Alternative simpler approach: Change color based on intersection
function handleScrollSimple() {
    if (!bigLogoContainer || !partnersSection) return;

    const logoRect = bigLogoContainer.getBoundingClientRect();
    const partnersRect = partnersSection.getBoundingClientRect();

    // Check if logo overlaps with partners section
    const isOverlapping = logoRect.bottom > partnersRect.top && logoRect.top < partnersRect.bottom;

    if (isOverlapping) {
        // Calculate how much of the logo has entered the partners section
        const overlapHeight = Math.min(logoRect.bottom, partnersRect.bottom) - Math.max(logoRect.top, partnersRect.top);
        const logoHeight = logoRect.height;
        const overlapPercentage = Math.min(1, overlapHeight / logoHeight);

        // Apply the mask effect based on overlap
        const maskPosition = (1 - overlapPercentage) * 100;

        // Apply CSS-based solution for img SVG files
        bigLogoContainer.style.background = `linear-gradient(to bottom, 
            #000000 0%, 
            #000000 ${maskPosition}%, 
            #E8E8E7 ${maskPosition}%, 
            #E8E8E7 100%)`;
        
        bigLogoContainer.style.webkitBackgroundClip = 'text';
        bigLogoContainer.style.backgroundClip = 'text';
        bigLogoContainer.style.webkitTextFillColor = 'transparent';
        
        const img = bigLogoContainer.querySelector('.big-logo');
        if (img) {
            img.style.filter = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='colorMask'%3E%3CfeFlood flood-color='%23000000' result='black'/%3E%3CfeFlood flood-color='%23E8E8E7' result='grey'/%3E%3CfeOffset in='SourceGraphic' dx='0' dy='${maskPosition * -0.01}' result='offset'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E#colorMask")`;
        }
    } else {
        // Reset to default black when not overlapping
        bigLogoContainer.style.background = '#000000';
        const img = bigLogoContainer.querySelector('.big-logo');
        if (img) {
            img.style.filter = 'none';
        }
    }
}

// Initialize
function init() {
    createSVGGradient();
    handleScroll();
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Also listen for resize events in case the layout changes
window.addEventListener('resize', handleScroll);