import { useState, useEffect } from 'react';
import { FiClock, FiVideo, FiImage, FiExternalLink } from 'react-icons/fi';
import { API_ENDPOINTS } from '../config/api';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blogs from our new Node.js backend
    const fetchBlogs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.BLOGS);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          console.error('Expected array of blogs, got:', data);
          setBlogs([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const YoutubeEmbed = ({ url }) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  const TiktokEmbed = ({ url }) => {
    return (
      <div className="bg-slate-100 dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 mb-4 border-2 border-dashed border-slate-300 dark:border-gray-700">
        <FiVideo className="w-12 h-12 text-pink-500 animate-pulse" />
        <p className="text-sm font-bold text-slate-700 dark:text-gray-300">Watch on TikTok</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2"
        >
          View Video <FiExternalLink />
        </a>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading motivation...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          Community & Motivation
        </h1>
        <p className="text-slate-500 dark:text-gray-400">
          Tips, tricks, and videos to help you stay ahead of your schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((blog) => (
          <article 
            key={blog.id} 
            className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col"
          >
            {/* Media Content */}
            <div className="relative">
              {blog.videoType === 'youtube' ? (
                <YoutubeEmbed url={blog.videoUrl} />
              ) : blog.videoType === 'tiktok' ? (
                <TiktokEmbed url={blog.videoUrl} />
              ) : blog.imageUrl ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-blue-600 flex items-center justify-center">
                  <FiImage className="w-12 h-12 text-blue-200 opacity-50" />
                </div>
              )}
            </div>

            {/* text Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-500 mb-3 font-medium">
                <FiClock /> {new Date(blog.createdAt).toLocaleDateString()}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {blog.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 mb-4">
                {blog.content}
              </p>
              <div className="mt-auto">
                <button className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Read Full Post <FiExternalLink />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
