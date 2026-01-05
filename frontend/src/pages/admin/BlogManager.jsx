import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiVideo, FiImage, FiSend, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

const BlogManager = () => {
    const { authFetch } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        videoType: 'none'
    });

    const fetchBlogs = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.BLOGS); 
            const data = await response.json();
            if (Array.isArray(data)) {
                setBlogs(data);
            } else {
                console.error('Expected array, got:', data);
                setBlogs([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authFetch) {
            fetchBlogs();
        }
    }, [authFetch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authFetch(API_ENDPOINTS.BLOGS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                fetchBlogs();
                setIsCreating(false);
                setFormData({ title: '', content: '', imageUrl: '', videoUrl: '', videoType: 'none' });
                alert("Blog Post Published!");
            }
        } catch (err) {
            alert('Error publishing blog');
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this post?")) {
            try {
                const response = await authFetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchBlogs();
                }
            } catch (err) {
                alert('Error deleting post');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Blog & Motivation Manager</h1>
                    <p className="text-slate-500 text-sm">Create and manage content that inspires your users.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                    <FiPlus /> Create New Post
                </button>
            </div>

            {/* List View */}
            <div className="grid gap-4">
                {blogs.map(blog => (
                    <div key={blog.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-slate-100 dark:border-gray-800 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl">
                                {blog.videoType !== 'none' ? <FiVideo className="text-pink-500" /> : <FiImage className="text-blue-500" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{blog.title}</h3>
                                <p className="text-xs text-slate-400 capitalize">{blog.videoType !== 'none' ? `${blog.videoType} Video` : 'Photo Post'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleDelete(blog.id)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCreating(false)} />
                    <div className="relative bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Blog Post</h2>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition">
                                    <FiX className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Post Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 5 Tips for Better Sleep"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Content (Description)</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.content}
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Write something engaging..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Media Type</label>
                                        <select 
                                            value={formData.videoType}
                                            onChange={e => setFormData({...formData, videoType: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        >
                                            <option value="none">Photo Only</option>
                                            <option value="youtube">YouTube Video</option>
                                            <option value="tiktok">TikTok Video</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Media URL</label>
                                        <input 
                                            type="url" 
                                            value={formData.videoType === 'none' ? formData.imageUrl : formData.videoUrl}
                                            onChange={e => {
                                                if(formData.videoType === 'none') setFormData({...formData, imageUrl: e.target.value})
                                                else setFormData({...formData, videoUrl: e.target.value})
                                            }}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Paste URL here..."
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Publish Motivation <FiSend />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManager;
