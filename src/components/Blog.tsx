import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { ContentPost } from '../contexts/CmsContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Blog() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        throw error;
      }

      if (data) {
        setPosts(data as ContentPost[]);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </a>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              {settings.site_name} Updates
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Latest news, announcements, and articles from our community.
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        {posts.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-400">
            No published posts yet. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#131B2F] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all hover:-translate-y-1 group cursor-pointer flex flex-col h-full"
              >
                {post.cover_image && (
                  <div className="w-full aspect-video overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-4">
                    <Calendar size={14} />
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown date'}
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-400 line-clamp-3 mb-6 flex-1">
                    {post.content.replace(/<[^>]*>?/gm, '')}
                  </p>

                  <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm mt-auto group-hover:gap-3 transition-all">
                    Read More <ArrowRight size={16} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
