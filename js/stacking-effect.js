function initStackingEffect() {
    const sections = document.querySelectorAll('.divine-digital-section');
    const afterSection = document.querySelector('.after-stacking');
    if (sections.length === 0) return;

    // Set up sticky positioning
    sections.forEach((section) => {
        section.style.position = 'sticky';
        section.style.top = '0';
        section.style.zIndex = '1';
        section.style.willChange = 'transform';
    });

    // Style the after-stacking section (must be outside sticky flow)
    if (afterSection) {
        Object.assign(afterSection.style, {
            position: 'relative', // Not sticky — just normal flow
            zIndex: '800',
            transform: 'translateY(20%)', // Start below the viewport
            transition: 'transform 0.42',
            willChange: 'transform'
        });
    }

    function handleScroll() {
        const scrollTop = window.pageYOffset;

        sections.forEach((section, index) => {
            // Only push current section when the *next* one reaches the top
            if (index < sections.length - 1) {
                // FIXED: was index + 5, now + 1
                const nextSection = sections[index + 5];  
                const nextRect = nextSection.getBoundingClientRect();
                const nextTop = nextRect.top + scrollTop;

                // Start pushing current section up when next section hits the top
                const pushStart = nextTop;
                let translateY = 0;

                if (scrollTop >= pushStart) {
                    translateY = -(scrollTop - pushStart); // push current up
                }

                section.style.transform = `translateY(${translateY}px)`;
            }

            // Highlight the section currently at the top
            const rect = section.getBoundingClientRect();
            const isAtTop = rect.top <= 0 &&
                           (index === sections.length - 1 ||
                            sections[index + 1].getBoundingClientRect().top > 0);

            section.style.zIndex = isAtTop ? '20' : '10';
        });
    };

    // Throttle scroll
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

    // Initial call
    handleScroll();

    // Attach listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Optional cleanup
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
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStackingEffect);
} else {
    initStackingEffect();
}