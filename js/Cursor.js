// Enhanced Custom Cursor Solution - Fixed for 3D Transform Elements
function setupCustomCursor() {
    // Skip initialization on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
        console.log('🚫 Touch device detected - Custom cursor disabled');
        return;
    }
    
    // Select all buttons that should have custom cursor
    const targetButtons = document.querySelectorAll('.donate-btn, .button-amen, .card-box');
    
    if (targetButtons.length === 0) {
        console.error('No target buttons found!');
        return;
    }
    
    // Create custom cursor element
    const customCursor = document.createElement('div');
    customCursor.className = 'custom-cursor';
    customCursor.id = 'customCursor';
    document.body.appendChild(customCursor);
    
    // Add CSS for custom cursor (injected via JavaScript)
    const style = document.createElement('style');
    style.textContent = `
        .custom-cursor {
            position: fixed;
            width: 48px;
            height: 48px;
            pointer-events: none;
            z-index: 999999;        /* Much higher z-index */
            transform: translate(-50%, -50%);
            display: none;
            transition: opacity 0.1s ease;
            /* Force cursor to stay on top of 3D elements */
            transform-style: flat !important;
            will-change: transform;
            /* Ensure it's always rendered on top */
            isolation: isolate;
        }
        
        /* Hide default cursor on target elements */
        .donate-btn:hover,
        .custom-cursor-btn:hover,
        .prayer-btn:hover,
        .support-btn:hover,
        .card-box:hover,
        .card-box:hover * {
            cursor: none !important;
        }
        
        /* Ensure cursor stays visible during 3D transforms */
        .custom-cursor-active {
            cursor: none !important;
        }
        
        .custom-cursor-active *,
        .custom-cursor-active *:hover {
            cursor: none !important;
        }
        
        /* Force cursor content to render properly */
        .custom-cursor img,
        .custom-cursor svg {
            width: 100%;
            height: 100%;
            display: block;
            transform-style: flat;
        }
        
        /* Prevent 3D elements from interfering with cursor */
        .card-box.custom-cursor-hover {
            position: relative;
            z-index: auto;
        }
        
        /* Ensure proper rendering during animations */
        .custom-cursor {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);
    
    // Load SVG function with fallback options
    async function loadCustomCursor() {
        const cursorPaths = [
            'images/prayinghands.svg',
            'svg/prayinghands.svg',
            'images/PrayingHands.png',
            'svg/prayinghands.cur'
        ];
        
        for (const path of cursorPaths) {
            try {
                if (path.endsWith('.svg')) {
                    const response = await fetch(path);
                    if (response.ok) {
                        const svgText = await response.text();
                        customCursor.innerHTML = svgText;
                        console.log(`✅ Loaded custom cursor: ${path}`);
                        return true;
                    }
                } else {
                    const img = new Image();
                    img.onload = function() {
                        customCursor.innerHTML = `<img src="${path}" alt="custom cursor">`;
                        console.log(`✅ Loaded custom cursor: ${path}`);
                    };
                    img.onerror = function() {
                        throw new Error(`Failed to load: ${path}`);
                    };
                    img.src = path;
                    return true;
                }
            } catch (error) {
                console.warn(`❌ Failed to load cursor: ${path}`);
                continue;
            }
        }
        
        // Fallback cursor with better 3D compatibility
        console.warn('⚠️ All cursor paths failed, using fallback');
        customCursor.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g style="transform-style: flat;">
                    <path d="M24 3L27 12L24 21L21 12L24 3Z" fill="#333" stroke="#fff" stroke-width="1"/>
                    <path d="M15 9L18 18L12 24L9 15L15 9Z" fill="#333" stroke="#fff" stroke-width="1"/>
                    <path d="M33 9L39 15L36 24L30 18L33 9Z" fill="#333" stroke="#fff" stroke-width="1"/>
                    <path d="M12 27L21 30L24 39L15 36L12 27Z" fill="#333" stroke="#fff" stroke-width="1"/>
                    <path d="M36 27L33 36L24 39L27 30L36 27Z" fill="#333" stroke="#fff" stroke-width="1"/>
                    <circle cx="24" cy="24" r="4" fill="#666" stroke="#fff" stroke-width="1"/>
                </g>
            </svg>
        `;
        return false;
    }
    
    // Enhanced cursor position update with 3D element handling
    let animationFrameId = null;
    let isVisible = false;
    
    function updateCursorPosition(e) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            if (!isVisible) return;
            
            // Force cursor to stay on top during positioning
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
            
            // Ensure cursor remains visible over 3D elements
            customCursor.style.zIndex = '999999';
            customCursor.style.position = 'fixed';
            customCursor.style.transformStyle = 'flat';
        });
    }
    
    // Enhanced show cursor function
    function showCustomCursor(e) {
        isVisible = true;
        customCursor.style.display = 'block';
        customCursor.style.opacity = '1';
        customCursor.style.zIndex = '999999';
        
        // Force immediate position update
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
        
        document.body.classList.add('custom-cursor-active');
        document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    }
    
    // Enhanced hide cursor function
    function hideCustomCursor() {
        isVisible = false;
        customCursor.style.opacity = '0';
        
        setTimeout(() => {
            if (!isVisible) {
                customCursor.style.display = 'none';
            }
        }, 100);
        
        document.body.classList.remove('custom-cursor-active');
        document.removeEventListener('mousemove', updateCursorPosition);
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    // Mouse enter/leave events for all target buttons
    targetButtons.forEach(button => {
        // Mouse enter event - show custom cursor
        button.addEventListener('mouseenter', function(e) {
            // Add special class for 3D elements
            if (button.classList.contains('card-box')) {
                button.classList.add('custom-cursor-hover');
            }
            showCustomCursor(e);
        });
        
        // Mouse leave event - hide custom cursor
        button.addEventListener('mouseleave', function() {
            // Remove special class
            if (button.classList.contains('card-box')) {
                button.classList.remove('custom-cursor-hover');
            }
            hideCustomCursor();
        });
        
        // Additional event for when mouse moves within the element
        button.addEventListener('mousemove', function(e) {
            if (isVisible) {
                updateCursorPosition(e);
            }
        });
    });
    
    // Handle visibility changes and window blur/focus
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && isVisible) {
            hideCustomCursor();
        }
    });
    
    window.addEventListener('blur', function() {
        if (isVisible) {
            hideCustomCursor();
        }
    });
    
    // Handle scroll events to maintain cursor position
    window.addEventListener('scroll', function() {
        if (isVisible) {
            // Force cursor to maintain proper z-index during scroll
            customCursor.style.zIndex = '999999';
        }
    }, { passive: true });
    
    // Load the custom cursor when function is called
    loadCustomCursor();
    
    // Debug function (remove in production)
    window.debugCursor = function() {
        console.log('Cursor element:', customCursor);
        console.log('Cursor visibility:', isVisible);
        console.log('Cursor styles:', {
            display: customCursor.style.display,
            opacity: customCursor.style.opacity,
            zIndex: customCursor.style.zIndex,
            position: customCursor.style.position
        });
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCustomCursor);
} else {
    setupCustomCursor();
}

// Expose function globally for manual initialization
window.setupCustomCursor = setupCustomCursor;