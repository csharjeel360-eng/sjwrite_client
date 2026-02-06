 
 // components/MarkdownRenderer.jsx
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const renderContent = () => {
    // Split content into paragraphs based on double newlines
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim() === '') return null;

      // Trim leading/trailing whitespace so headings are detected even with leading spaces or CRLF
      const trimmed = paragraph.trim();

      // Check for headings (use trimmed content)
      if (trimmed.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold">{trimmed.substring(4)}</h3>;
      }

      // Process inline formatting within the paragraph
      return <p key={index} className="leading-relaxed">{processInlineFormatting(paragraph)}</p>;
    });
  };

  const processInlineFormatting = (text) => {
    const elements = [];
    let remainingText = text;
    
    while (remainingText.length > 0) {
      // Look for the next formatting pattern
      const boldIndex = remainingText.indexOf('**');
      const italicIndex = remainingText.indexOf('_');
      const linkStartIndex = remainingText.indexOf('[');
      const linkEndIndex = remainingText.indexOf('](');
      
      // Find the earliest pattern
      const nextPatternIndex = Math.min(
        boldIndex >= 0 ? boldIndex : Infinity,
        italicIndex >= 0 ? italicIndex : Infinity,
        (linkStartIndex >= 0 && linkEndIndex > linkStartIndex) ? linkStartIndex : Infinity
      );
      
      if (nextPatternIndex === Infinity) {
        // No more patterns, add remaining text
        elements.push(remainingText);
        break;
      }
      
      // Add text before the pattern
      if (nextPatternIndex > 0) {
        elements.push(remainingText.substring(0, nextPatternIndex));
      }
      
      // Handle the pattern
      if (nextPatternIndex === boldIndex) {
        const endIndex = remainingText.indexOf('**', boldIndex + 2);
        if (endIndex !== -1) {
          const boldText = remainingText.substring(boldIndex + 2, endIndex);
          elements.push(<strong key={elements.length}>{boldText}</strong>);
          remainingText = remainingText.substring(endIndex + 2);
        } else {
          elements.push('**');
          remainingText = remainingText.substring(boldIndex + 2);
        }
      } 
      else if (nextPatternIndex === italicIndex) {
        const endIndex = remainingText.indexOf('_', italicIndex + 1);
        if (endIndex !== -1) {
          const italicText = remainingText.substring(italicIndex + 1, endIndex);
          elements.push(<em key={elements.length}>{italicText}</em>);
          remainingText = remainingText.substring(endIndex + 1);
        } else {
          elements.push('_');
          remainingText = remainingText.substring(italicIndex + 1);
        }
      }
      else if (nextPatternIndex === linkStartIndex && linkEndIndex > linkStartIndex) {
        const urlStartIndex = linkEndIndex + 2;
        const urlEndIndex = remainingText.indexOf(')', urlStartIndex);
        
        if (urlEndIndex !== -1) {
          const linkText = remainingText.substring(linkStartIndex + 1, linkEndIndex);
          const linkUrl = remainingText.substring(urlStartIndex, urlEndIndex);
          
          elements.push(
            <a 
              key={elements.length}
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {linkText}
            </a>
          );
          
          remainingText = remainingText.substring(urlEndIndex + 1);
        } else {
          elements.push('[');
          remainingText = remainingText.substring(linkStartIndex + 1);
        }
      }
    }
    
    return elements;
  };

  return <div className="markdown-content">{renderContent()}</div>;
}