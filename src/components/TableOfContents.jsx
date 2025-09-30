export default function TableOfContents({ headings }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Table of Contents</h4>
      <nav>
        {headings.map((heading, index) => (
          <a
            key={index}
            href={`#${heading.id}`}
            className={`block py-1 text-gray-600 hover:text-blue-600 transition-colors ${
              heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : ''
            }`}
          >
            {heading.title}
          </a>
        ))}
      </nav>
    </div>
  );
}