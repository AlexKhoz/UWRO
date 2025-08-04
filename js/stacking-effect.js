function initStackingEffect() {
    const sections = document.querySelectorAll('.divine-digital-section');
    const afterSection = document.querySelector('.after-stacking');
    if (sections.length === 0) return;

    // Set up sticky positioning
    sections.forEach((section, index) => {
        section.style.position = 'sticky';
        section.style.top = '0';
        // Remove or adjust initial z-index to avoid conflicts
        // We will manage z-index dynamically
        section.style.zIndex = ''; // Or set a base value like '10'
        section.style.willChange = 'transform';
    });

    // Style the after-stacking section
    if (afterSection) {
        Object.assign(afterSection.style, {
            position: 'relative',
            zIndex: '5', // Ensure it's below the stacked sections
            transform: 'translateY(0)', // Start in normal flow
            // Removed transition as it might interfere
            willChange: 'transform'
        });
    }

    function handleScroll() {
        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;

        sections.forEach((section, index) => {
            let translateY = 0;

            // --- Push Logic ---
            // Only push current section when the *very next* one reaches the top
            if (index < sections.length - 1) {
                // --- CRITICAL FIX: Ensure this line uses + 1 ---
                const nextSection = sections[index + 1]; // This MUST be + 1
                const nextRect = nextSection.getBoundingClientRect();
                const nextTop = nextRect.top + scrollTop; // Next section's top relative to document

                // Start pushing current section up when next section hits the top of the viewport
                const pushStart = nextTop;

                if (scrollTop >= pushStart) {
                    // Calculate how much to push the current section UP
                    translateY = -(scrollTop - pushStart);
                }
                // Apply the transformation
                section.style.transform = `translateY(${translateY}px)`;
            }

            // --- Z-Index Logic (Crucial for Visual Stacking) ---
            const rect = section.getBoundingClientRect();

            // Determine if this section is the "top" one in the stack
            // A section is "at the top" if:
            // 1. Its top is at or above the viewport top (<= 0)
            // AND
            // 2. Either it's the last section, OR the next section's top is below the viewport top (> 0)
            const isAtTop = rect.top <= 0 &&
                           (index === sections.length - 1 ||
                            sections[index + 1].getBoundingClientRect().top > 0);

            // --- Set Z-Index for Stacking Order ---
            // Assign z-index based on position and state to ensure visual overlap
            if (isAtTop) {
                // The section currently filling the viewport (the "active" one)
                section.style.zIndex = '20';
            } else if (rect.top > 0) {
                // Sections below the current viewport (haven't arrived yet)
                // Give them a lower z-index so they appear underneath the one pushing up
                section.style.zIndex = '10';
            } else {
                // Sections that have already been pushed up and are above the viewport
                // Give them the lowest z-index so they are underneath everything
                section.style.zIndex = '5';
            }
        });
    }

    // Throttle scroll for performance
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Initial call to set positions correctly on load
    handleScroll();

    // Attach listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Optional cleanup function
    return function destroy() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        sections.forEach((section) => {
            section.style.position = '';
            section.style.top = '';
            section.style.zIndex = '';
            section.style.transform = '';
            section.style.willChange = '';
        });
        if (afterSection) {
            afterSection.style.position = '';
            afterSection.style.zIndex = '';
            afterSection.style.transform = '';
        }
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStackingEffect);
} else {
    initStackingEffect();
}