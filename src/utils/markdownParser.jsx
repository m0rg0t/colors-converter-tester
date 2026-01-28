/**
 * Parse simple markdown content with bold (**text**) support
 * @param {string} content - Text content with **bold** markers
 * @returns {JSX.Element[]} Array of React elements
 */
export function parseMarkdownContent(content) {
  return content.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line.split('**').map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}
