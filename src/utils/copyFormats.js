export function toPlainText(concept) {
  const lines = [
    `${concept.name} — ${concept.thinker}`,
    `Category: ${concept.category} | Era: ${concept.era} | Difficulty: ${'●'.repeat(concept.difficulty)}${'○'.repeat(3 - concept.difficulty)}`,
    '',
    concept.description,
    '',
    `"${concept.quote}"`,
  ]

  if (concept.related?.length) {
    lines.push('', 'Related:', ...concept.related.map(r => `  • ${r.name} (${r.type})`))
  }

  if (concept.books?.length) {
    lines.push('', 'Further reading:', ...concept.books.map(b => `  • ${b.title} by ${b.author}`))
  }

  return lines.join('\n')
}

export function toMarkdown(concept) {
  const diff = '●'.repeat(concept.difficulty) + '○'.repeat(3 - concept.difficulty)
  const lines = [
    `# ${concept.name}`,
    '',
    `**Thinker:** ${concept.thinker}  `,
    `**Category:** ${concept.category}  `,
    `**Era:** ${concept.era}  `,
    `**Difficulty:** ${diff}`,
    '',
    concept.description,
    '',
    `> "${concept.quote}"`,
  ]

  if (concept.related?.length) {
    lines.push('', '## Related Concepts', '')
    concept.related.forEach(r => {
      lines.push(`- **${r.name}** *(${r.type})*`)
    })
  }

  if (concept.books?.length) {
    lines.push('', '## Further Reading', '')
    concept.books.forEach(b => {
      lines.push(`- [${b.title}](${b.url}) by ${b.author}`)
    })
  }

  if (concept.tags?.length) {
    lines.push('', concept.tags.map(t => `#${t}`).join(' '))
  }

  return lines.join('\n')
}

export function toObsidian(concept) {
  const diff = '●'.repeat(concept.difficulty) + '○'.repeat(3 - concept.difficulty)
  const frontmatter = [
    '---',
    `name: "${concept.name}"`,
    `thinker: "${concept.thinker}"`,
    `category: "${concept.category}"`,
    `era: "${concept.era}"`,
    `difficulty: ${concept.difficulty}`,
    `tags: [${concept.tags?.map(t => `"${t}"`).join(', ') || ''}]`,
    '---',
    '',
  ].join('\n')

  const body = [
    `# ${concept.name}`,
    '',
    `**Thinker:** [[${concept.thinker}]]  `,
    `**Category:** [[${concept.category}]]  `,
    `**Era:** ${concept.era}  `,
    `**Difficulty:** ${diff}`,
    '',
    concept.description,
    '',
    `> "${concept.quote}"`,
  ]

  if (concept.thinkerBio) {
    body.push('', '## About the Thinker', '', concept.thinkerBio)
  }

  if (concept.related?.length) {
    body.push('', '## Related Concepts', '')
    concept.related.forEach(r => {
      body.push(`- [[${r.name}]] *(${r.type})*`)
    })
  }

  if (concept.books?.length) {
    body.push('', '## Further Reading', '')
    concept.books.forEach(b => {
      body.push(`- [${b.title}](${b.url}) by ${b.author}`)
    })
  }

  if (concept.tags?.length) {
    body.push('', concept.tags.map(t => `#${t}`).join(' '))
  }

  return frontmatter + body.join('\n')
}
