// Final Custom Cursor Solution with SVG Loading - Multiple Buttons Support
function setupCustomCursor() {
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
            width: 48px;          /* Adjust size here */
            height: 48px;         /* Adjust size here */
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            display: none;
            transition: opacity 0.1s ease;
        }
        
        .donate-btn:hover,
        .custom-cursor-btn:hover,
        .prayer-btn:hover,
        .support-btn:hover {
            cursor: none !important;
        }
        
        .custom-cursor-active {
            cursor: none !important;
        }
        
        .custom-cursor-active * {
            cursor: none !important;
        }
        
        .custom-cursor img,
        .custom-cursor svg {
            width: 100%;
            height: 100%;
            display: block;
        }
    `;
    document.head.appendChild(style);
    
    // Load SVG function with fallback options
    async function loadCustomCursor() {
        const cursorPaths = [
            'images/prayinghands.svg',      // Primary SVG path
            'svg/prayinghands.svg',         // Alternative SVG path
            'images/PrayingHands.png',      // PNG fallback
            'svg/prayinghands.cur'          // CUR fallback
        ];
        
        for (const path of cursorPaths) {
            try {
                if (path.endsWith('.svg')) {
                    // Try to load SVG content directly
                    const response = await fetch(path);
                    if (response.ok) {
                        const svgText = await response.text();
                        customCursor.innerHTML = svgText;
                        console.log(`✅ Loaded custom cursor: ${path}`);
                        return true;
                    }
                } else {
                    // For PNG/CUR files, use img tag
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
        
        // If all paths fail, create a simple fallback cursor
        console.warn('⚠️ All cursor paths failed, using fallback');
        customCursor.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L18 8L16 14L14 8L16 2Z" fill="#333"/>
                <path d="M10 6L12 12L8 16L6 10L10 6Z" fill="#333"/>
                <path d="M22 6L26 10L24 16L20 12L22 6Z" fill="#333"/>
                <path d="M8 18L14 20L16 26L10 24L8 18Z" fill="#333"/>
                <path d="M24 18L22 24L16 26L18 20L24 18Z" fill="#333"/>
                <circle cx="16" cy="16" r="3" fill="#666"/>
            </svg>
        `;
        return false;
    }
    
    // Update cursor position smoothly
    function updateCursorPosition(e) {
        requestAnimationFrame(() => {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        });
    }
    
    // Mouse enter/leave events for all target buttons
    targetButtons.forEach(button => {
        // Mouse enter event - show custom cursor
        button.addEventListener('mouseenter', function() {
            customCursor.style.display = 'block';
            customCursor.style.opacity = '1';
            document.body.classList.add('custom-cursor-active');
            document.addEventListener('mousemove', updateCursorPosition);
        });
        
        // Mouse leave event - hide custom cursor
        button.addEventListener('mouseleave', function() {
            customCursor.style.opacity = '0';
            setTimeout(() => {
                customCursor.style.display = 'none';
            }, 100);
            document.body.classList.remove('custom-cursor-active');
            document.removeEventListener('mousemove', updateCursorPosition);
        });
    });
    
    // Load the custom cursor when function is called
    loadCustomCursor();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCustomCursor);
} else {
    setupCustomCursor();
}

// Optional: Expose function globally for manual initialization
window.setupCustomCursor = setupCustomCursor;