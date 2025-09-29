 import { useState } from 'react';

export default function SortBar({ onSort, defaultSort = "date", className = "" }) {
  const [sortBy, setSortBy] = useState(defaultSort);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSort(value);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span className="mr-2 text-gray-600 font-medium">Sort by:</span>
      <select 
        value={sortBy} 
        onChange={handleSortChange} 
        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
      >
        <option value="date">Newest First</option>
        <option value="date_oldest">Oldest First</option>
        <option value="likes">Most Liked</option>
        <option value="comments">Most Comments</option>
        <option value="title_asc">Title (A-Z)</option>
        <option value="title_desc">Title (Z-A)</option>
      </select>
    </div>
  );
}