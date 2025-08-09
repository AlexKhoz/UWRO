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
      setActive(prev => (prev + 1) % count);
    }, 1500);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="carousel-container">
      {cards.map((card, i) => {
        const offset = active - i;

        let effectiveOffset = offset;
        if (offset > count / 2) effectiveOffset = offset - count;
        if (offset < -count / 2) effectiveOffset = offset + count;

        const absEffOffset = Math.abs(effectiveOffset);
        const effDirection = Math.sign(effectiveOffset);

        const rotateY = (effectiveOffset / 3) * 0;
        const scaleY = 1 + (absEffOffset / 3) * 0;
        const translateZ = (absEffOffset / 3) * -10;
        const translateX = effDirection * -5;
        
        const isVisible = absEffOffset < MAX_VISIBILITY;
        const opacity = absEffOffset >= MAX_VISIBILITY ? 0 : 1;

        return (
          <div
            key={i}
            className={`card-wrapper ${absEffOffset <= 1 ? 'active' : ''}`}
            style={{
              transform: `rotateY(${rotateY}deg) scaleY(${scaleY}) translateZ(${translateZ}rem) translateX(${translateX}rem)`,
              opacity: opacity,
              display: isVisible ? 'block' : 'none',
            }}
            onClick={() => setActive((active + 1) % count)}
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