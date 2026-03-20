import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageUtils';
import { Save, Upload, Loader2, AlertCircle, CheckCircle, Plus, Edit2, Share2, Eye } from 'lucide-react';
import { ContentPost } from '../contexts/CmsContext';

export default function AdminPosts() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Partial<ContentPost>>({});

  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      if (data) setPosts(data as ContentPost[]);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: '',
      slug: '',
      content: '',
      cover_image: '',
      status: 'draft',
      publish_to_social: false
    });
    setCoverPreview('');
    setCoverFile(null);
    setMessage(null);
    setView('edit');
  };

  const handleEdit = (post: ContentPost) => {
    setEditingPost({ ...post });
    setCoverPreview(post.cover_image || '');
    setCoverFile(null);
    setMessage(null);
    setView('edit');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImage(file, 1200);
      setCoverFile(optimized);
      setCoverPreview(URL.createObjectURL(optimized));
    } catch (err) {
      console.error('Error optimizing image:', err);
      setMessage({ type: 'error', text: 'Failed to process image.' });
    }
  };

  const uploadCover = async (file: File): Promise<string | null> => {
    const filename = `post-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(`posts/${filename}`, file, { upsert: true });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('assets')
      .getPublicUrl(`posts/${filename}`);

    return publicData.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      let finalCoverUrl = coverPreview;

      if (coverFile) {
        finalCoverUrl = (await uploadCover(coverFile)) || '';
      }

      const payload = {
        title: editingPost.title,
        slug: editingPost.slug || generateSlug(editingPost.title || 'untitled'),
        content: editingPost.content,
        cover_image: finalCoverUrl,
        status: editingPost.status,
        publish_to_social: editingPost.publish_to_social,
        updated_at: new Date().toISOString()
      };

      if (!editingPost.id) {
        // Insert
        const { error } = await supabase.from('content_posts').insert([
          { ...payload, created_at: new Date().toISOString() }
        ]);
        if (error) throw error;
      } else {
        // Update
        const { error } = await supabase.from('content_posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Post saved successfully!' });
      await fetchPosts();
      setTimeout(() => setView('list'), 1500);

    } catch (err: any) {
      console.error('Error saving post:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save post.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin text-cyan-400 mx-auto" /></div>;

  if (view === 'list') {
    return (
      <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
            <p className="text-gray-400 mt-2">Create and manage content for the platform.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Post
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No posts found. Create your first one!</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F19]/50">
                  <th className="p-4 font-medium text-gray-400">Title</th>
                  <th className="p-4 font-medium text-gray-400">Status</th>
                  <th className="p-4 font-medium text-gray-400">Date</th>
                  <th className="p-4 font-medium text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{post.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(post.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(post)} className="text-gray-400 hover:text-cyan-400 transition-colors p-2">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{editingPost.id ? 'Edit Post' : 'Create Post'}</h1>
        <button onClick={() => setView('list')} className="text-gray-400 hover:text-white px-4 py-2 transition-colors">
          Cancel
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <input
                type="text"
                value={editingPost.title || ''}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditingPost({...editingPost, title, slug: generateSlug(title)});
                }}
                className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 text-lg font-bold"
                placeholder="Post Title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Slug</label>
              <div className="flex items-center gap-2 text-gray-500 bg-[#0B0F19]/30 rounded-xl px-4 py-3 border border-white/5">
                /blog/ <input type="text" value={editingPost.slug || ''} onChange={(e) => setEditingPost({...editingPost, slug: e.target.value})} className="bg-transparent border-none outline-none text-white w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Content (Markdown / HTML)</label>
              <textarea
                value={editingPost.content || ''}
                onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                rows={15}
                className="w-full bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-y"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status & Publishing */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-medium border-b border-white/10 pb-4">Publishing</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">Status</span>
                <select
                  value={editingPost.status || 'draft'}
                  onChange={(e) => setEditingPost({...editingPost, status: e.target.value as 'draft'|'published'})}
                  className="bg-[#0B0F19]/80 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-cyan-400" />
                  <span className="text-sm text-gray-300 font-medium">Social Sharing</span>
                </div>
                <button
                  onClick={() => setEditingPost(prev => ({ ...prev, publish_to_social: !prev.publish_to_social }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingPost.publish_to_social ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingPost.publish_to_social ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {editingPost.publish_to_social && editingPost.title && (
                <div className="bg-[#0B0F19]/50 border border-cyan-500/30 p-4 rounded-xl text-sm text-gray-300 mt-4 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Suggested Caption</div>
                  <p className="italic">
                    "🚀 We just published a new update: {editingPost.title}! Check out the latest on our blog. #Tech #Africa"
                  </p>
                  <p className="text-xs text-gray-500 pt-2 border-t border-white/5">(Manually copy this for Twitter/LinkedIn)</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium w-full text-left border-b border-white/10 pb-4">Cover Image</h3>

            <div className="w-full aspect-video bg-black/30 rounded-xl border border-dashed border-gray-600 flex items-center justify-center overflow-hidden relative group">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-sm">No Cover Image</span>
              )}

              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                <Upload className="text-white mb-2" size={24} />
                <span className="text-sm font-medium text-white">Upload New</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 w-full bg-[#131B2F]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-end shadow-2xl z-50">
        <button
          onClick={handleSave}
          disabled={saving || !editingPost.title}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(34,211,255,0.2)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </div>
  );
}
