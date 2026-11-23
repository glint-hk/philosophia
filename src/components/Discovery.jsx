const QUESTIONS = [
  { title: 'How should I live?', note: 'Character, choices, and the good life', name: 'Virtue Ethics', symbol: '✧' },
  { title: 'Am I really free?', note: 'Choice at the edge of causality', name: 'Free Will vs Determinism', symbol: '◎' },
  { title: 'What gives life meaning?', note: 'Finding a way through uncertainty', name: 'Existentialism', symbol: '∴' },
]

export function Discovery({ concepts, onSelect, onTraverse }) {
  const date = new Date()
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  const daily = concepts.length ? concepts[day % concepts.length] : null
  return (
    <section className="discovery" aria-labelledby="discovery-title">
      <div className="discovery-heading">
        <p className="section-kicker">Follow your curiosity</p>
        <h2 id="discovery-title">Begin with a question.</h2>
        <p>You don’t need the right vocabulary. Just a little wonder.</p>
      </div>
      <div className="question-grid">
        {QUESTIONS.map(question => {
          const concept = concepts.find(c => c.name === question.name)
          return concept && (
            <button key={question.name} className="question-card" onClick={() => onTraverse(concept)}>
              <span className="question-symbol" aria-hidden="true">{question.symbol}</span>
              <span className="question-title">{question.title}</span>
              <span className="question-note">{question.note}</span>
              <span className="question-start">Start with {concept.name}</span>
            </button>
          )
        })}
      </div>
      {daily && (
        <div className="daily-idea">
          <div className="daily-label"><span className="section-kicker">A thought for today</span><span>One idea. A different perspective.</span></div>
          <div className="daily-copy"><h3>{daily.name}</h3><p>{daily.description.split(/(?<=[.!?])\s/)[0]}</p><span>{daily.thinker} · {daily.category}</span></div>
          <button className="hero-secondary" onClick={() => onSelect(daily)}>Take a closer look</button>
        </div>
      )}
    </section>
  )
}
