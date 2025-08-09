const { useState, useEffect } = React;

const Card = ({ icon, title }) => (
  <div className="card">
    <div className="card-icon">{icon}</div>
    <div className="card-title">{title}</div>
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
    const interval = setInterval(() => {
      setActive(a => (a + 1) % count);
    }, 1500);
    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="carousel-container">
      {cards.map((card, i) => {
        // wrap-around offset (-count/2 ... +count/2)
        let effectiveOffset = active - i;
        if (effectiveOffset >  count / 2) effectiveOffset -= count;
        if (effectiveOffset < -count / 2) effectiveOffset += count;

        const absEffOffset = Math.abs(effectiveOffset);
        const dir = Math.sign(effectiveOffset) || 0;

        // depth & motion
        const rotateY    = -12 * effectiveOffset;     // deg
        const scale      = 1 - 0.06 * absEffOffset;   // 1, 0.94, 0.88...
        const translateZ = -80 * absEffOffset;        // px (pairs well w/ perspective)
        const translateX = dir * -6 * absEffOffset;   // px

        const isVisible   = absEffOffset < MAX_VISIBILITY;
        const opacity     = isVisible ? 1 : 0;
        const pointerEvt  = isVisible ? 'auto' : 'none';

        return (
          <div
            key={i}
            className={`card-wrapper ${absEffOffset <= 1 ? 'active' : ''}`}
            style={{
              transform: `translateZ(${translateZ}px) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
              opacity,
              pointerEvents: pointerEvt,
            }}
            onClick={() => setActive(a => (a + 1) % count)}
          >
            <Card icon={card.icon} title={card.title} />
          </div>
        );
      })}
    </div>
  );
};

// Render the React component
ReactDOM.render(<Carousel />, document.getElementById('carousel-root'));
