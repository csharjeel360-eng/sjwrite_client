 export default function TagChips({ 
  tags = [], 
  onClick, 
  onRemove, 
  editable = false, 
  maxTags = null,
  className = "" 
}) {
  if (!tags.length) return null;
  
  const displayedTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenTagsCount = maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayedTags.map((tag, index) => (
        <div
          key={index}
          className={`
            inline-flex items-center px-3 py-1.5 rounded-md border
            ${editable 
              ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-move' 
              : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 cursor-pointer'
            }
            transition-colors duration-200
          `}
          onClick={() => onClick?.(tag)}
        >
          <span className="font-medium">{tag}</span>
          {editable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(index);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none text-lg"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {hiddenTagsCount > 0 && (
        <div className="inline-flex items-center px-2 py-1.5 rounded-md bg-gray-50 text-gray-500 border border-gray-200">
          +{hiddenTagsCount} more
        </div>
      )}
    </div>
  );
}