export default function ShareModal({ url, title, onClose }) {
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Share this post</h3>
        <div className="flex gap-4 justify-center mb-6">
          {/* Add social share buttons */}
        </div>
        <button onClick={onClose} className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          Close
        </button>
      </div>
    </div>
  );
}