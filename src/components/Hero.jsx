const ORBIT_IDEAS = [
  { name: 'Being', className: 'idea-being' },
  { name: 'Freedom', className: 'idea-freedom' },
  { name: 'Justice', className: 'idea-justice' },
  { name: 'Knowledge', className: 'idea-knowledge' },
  { name: 'Meaning', className: 'idea-meaning' },
]

export function Hero({ onExplore, onTraverse, onRandom }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <span className="hero-eyebrow-mark" aria-hidden="true" />
          A living atlas of human thought
        </p>
        <h1 id="hero-title">
          Every great idea is<br />
          <em>connected.</em>
        </h1>
        <p className="hero-lede">
          Wander through 400 philosophical concepts—from ancient wisdom to modern
          questions—and discover the invisible threads between them.
        </p>
        <div className="hero-actions">
          <button className="hero-primary" onClick={onTraverse}>Enter the constellation</button>
          <button className="hero-secondary" onClick={onExplore}>Search the atlas</button>
          <button className="hero-random" onClick={onRandom}>Surprise me</button>
        </div>
        <dl className="hero-stats" aria-label="Philosophia collection statistics">
          <div><dt>400</dt><dd>ideas</dd></div>
          <div><dt>15</dt><dd>traditions</dd></div>
          <div><dt>1,506</dt><dd>connections</dd></div>
        </dl>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-aura" />
        <svg className="hero-lines" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="192" />
          <circle cx="300" cy="300" r="112" />
          <path d="M300 300L300 72M300 300L516 222M300 300L454 470M300 300L142 464M300 300L82 218" />
        </svg>
        <div className="hero-core">
          <span className="hero-core-symbol">φ</span>
          <span>Philosophia</span>
        </div>
        {ORBIT_IDEAS.map(idea => (
          <div key={idea.name} className={`hero-idea ${idea.className}`}>
            <span />{idea.name}
          </div>
        ))}
        <div className="hero-whisper whisper-one">What can I know?</div>
        <div className="hero-whisper whisper-two">How should I live?</div>
      </div>
    </section>
  )
}
