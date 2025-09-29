 import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Markdown renderer helper function
const renderMarkdownPreview = (text) => {
  if (!text) return '';
  
  return text
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-bold my-4 md:my-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl md:text-2xl font-bold my-3 md:my-5">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg md:text-xl font-bold my-2 md:my-4">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed">$1</p>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
};

// Helper function to convert markdown to plain text for preview
const markdownToPlainText = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/_(.*?)_/g, '$1') // Remove italic
    .replace(/_(.*?)_/g, '$1') // Remove italic (underscore version)
    .replace(/#{1,6}\s?(.*?)(\n|$)/g, '$1') // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markup, keep text
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '$2') // Remove code blocks
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

export default function FeaturedPost({ post, index }) {
  const [plainTextPreview, setPlainTextPreview] = useState('');

  useEffect(() => {
    // Create a plain text preview for the excerpt
    const plainText = markdownToPlainText(post.content);
    setPlainTextPreview(plainText.substring(0, 150) + (plainText.length > 150 ? '...' : ''));
  }, [post.content]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
    >
      {post.blogImage && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.blogImage} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link to={`/blog/${post._id}`}>
            {post.title}
          </Link>
        </h3>
        
        <div 
          className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdownPreview(post.content.substring(0, 200)) + (post.content.length > 200 ? '...' : '')
          }}
        />
        
        <Link 
          to={`/blog/${post._id}`}
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group/readmore"
        >
          Read more
          <svg className="w-4 h-4 ml-1 transition-transform group-hover/readmore:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </motion.article>
  );
}