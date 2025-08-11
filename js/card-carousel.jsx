const { useState, useEffect } = React;

const Card = ({ icon, title, highlight }) => (
  <div
    className="card"
    style={{
      // shadow only when front-most; no scale here
      boxShadow: highlight
        ? '0 14px 38px rgba(0,0,0,0.25), 0 3px 6px rgba(0,0,0,0.15)'
        : 'none',
      transition: 'box-shadow 0.35s ease',
    }}
  >
    <div className="card-icon">{icon}</div>
    <div className="card-title-carousel">{title}</div>
  </div>
);

const Carousel = () => {
  const [active, setActive] = useState(1);

  const cards = [
    { icon: '🕯️', title: 'LIGHT\nBEARER' },
    { icon: '🛡️', title: 'FLAME\nKEEPER' },
    { icon: '🕊', title: 'PILLAR OF\nHARMONY' },
    { icon: '🛕', title: 'ARCHITECT\nOF UNITY' },
    { icon: '🌳', title: 'GUARDIAN\nOF ETERNITY' },
    { icon: '👑', title: 'ETERNAL\nFOUNDER' },
  ];

  const count = cards.length;
  const MAX_VISIBILITY = 3;

  useEffect(() => {
    const id = setInterval(() => {
      setActive(a => (a + 1) % count);
    }, 1500);
    return () => clearInterval(id);
  }, [count]);

  return (
    <div className="carousel-container">
      {cards.map((card, i) => {
        // wrap-around offset
        let effectiveOffset = active - i;
        if (effectiveOffset >  count / 2) effectiveOffset -= count;
        if (effectiveOffset < -count / 2) effectiveOffset += count;

        const absEffOffset = Math.abs(effectiveOffset);
        const dir = Math.sign(effectiveOffset) || 0;

        // transforms (kept subtle)
        const rotateY    = (effectiveOffset / 3) * 0;   // adjust if you want tilt
        const translateZ = (absEffOffset / 3) * -10;    // rem in your original
        const translateX = dir * -5;                    // rem in your original

        const isVisible  = absEffOffset < MAX_VISIBILITY;
        const opacity    = isVisible ? 1 : 0;

        // 110% when front, 100% otherwise
        const scale = absEffOffset === 0 ? 1.1 : 1;

        return (
          <div
            key={i}
            className={`card-wrapper ${absEffOffset <= 1 ? 'active' : ''}`}
            style={{
              transform: `
                translateZ(${translateZ}rem)
                translateX(${translateX}rem)
                rotateY(${rotateY}deg)
                scale(${scale})
              `,
              opacity,
              display: isVisible ? 'block' : 'none',
              transition: 'transform .45s ease, opacity .45s ease',
            }}
            onClick={() => setActive(a => (a + 1) % count)}
          >
            <Card icon={card.icon} title={card.title} highlight={absEffOffset === 0} />
          </div>
        );
      })}
    </div>
  );
};

ReactDOM.render(<Carousel />, document.getElementById('carousel-root'));