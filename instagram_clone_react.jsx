/*
Instagram-Clone-React.jsx
Single-file React component (default export) for a lightweight Instagram-style frontend.
- Uses Tailwind CSS classes for styling.
- Features: feed, create post (image upload or URL), like, comment, simple profile header.
- Persists posts/likes/comments to localStorage.

How to run quickly:
1) Create a React app (Vite or Create React App). Example with Vite:
   npm create vite@latest my-instagram -- --template react
   cd my-instagram
2) Install and configure Tailwind CSS (follow Tailwind + Vite guide), or paste the component into CodeSandbox and enable Tailwind template.
3) Replace src/App.jsx with this file (or import it) and run `npm install` then `npm run dev`.

If you want I can instead provide a version without Tailwind or a mobile-responsive improvement.
*/

import React, { useState, useEffect, useRef } from "react";

const LOCAL_KEY = "ig_clone_posts_v1";

function useLocalPosts() {
  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : samplePosts();
    } catch (e) {
      return samplePosts();
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
  }, [posts]);

  return [posts, setPosts];
}

function samplePosts() {
  return [
    {
      id: Date.now() - 100000,
      user: "efnan",
      avatar: "https://i.pravatar.cc/100?img=12",
      image:
        "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=80",
      caption: "Güzel bir gün 🌤️",
      likes: 3,
      liked: false,
      comments: [
        { id: 1, user: "suleyman", text: "Harika çekim!" },
        { id: 2, user: "ali", text: "Neresi burası?" },
      ],
      createdAt: Date.now() - 100000,
    },
  ];
}

export default function InstagramClone() {
  const [posts, setPosts] = useLocalPosts();
  const [showModal, setShowModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImageURL, setNewImageURL] = useState("");
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileRef = useRef(null);

  function toggleLike(id) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  }

  function addComment(id, text) {
    if (!text.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [...p.comments, { id: Date.now(), user: "you", text }],
            }
          : p
      )
    );
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function createPost(e) {
    e.preventDefault();
    const image = uploadPreview || newImageURL || "https://picsum.photos/600/400";
    const post = {
      id: Date.now(),
      user: "you",
      avatar: "https://i.pravatar.cc/100?img=5",
      image,
      caption: newCaption,
      likes: 0,
      liked: false,
      comments: [],
      createdAt: Date.now(),
    };
    setPosts((p) => [post, ...p]);
    // reset
    setShowModal(false);
    setNewCaption("");
    setNewImageURL("");
    setUploadPreview(null);
    if (fileRef.current) fileRef.current.value = null;
  }

  function deletePost(id) {
    if (!confirm("Bu gönderiyi silmek istediğine emin misin?")) return;
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">InstaMini</div>
          <div className="hidden md:block text-sm text-gray-600">Basit Instagram klon - React + Tailwind</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 border rounded-md bg-white hover:shadow"
          >
            Yeni Gönderi
          </button>
          <div className="flex items-center gap-2">
            <img src="https://i.pravatar.cc/40?img=5" alt="avatar" className="rounded-full" />
            <div className="text-sm">you</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center p-8 bg-white rounded">Henüz gönderi yok — ilk sen paylaş!</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} onComment={addComment} onDelete={deletePost} />)
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50">
          <form onSubmit={createPost} className="bg-white rounded-md w-full max-w-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Yeni Gönderi</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-600">Kapat</button>
            </div>

            <div className="mb-3">
              <label className="block text-sm">Resim URL (opsiyonel)</label>
              <input value={newImageURL} onChange={(e) => setNewImageURL(e.target.value)} placeholder="https://..." className="w-full border rounded px-2 py-1" />
            </div>

            <div className="mb-3">
              <label className="block text-sm">Ya da yerel yükleme</label>
              <input ref={fileRef} onChange={handleFileChange} type="file" accept="image/*" className="w-full" />
              {uploadPreview && <img src={uploadPreview} alt="preview" className="mt-2 max-h-48 object-contain rounded" />}
            </div>

            <div className="mb-3">
              <label className="block text-sm">Açıklama</label>
              <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value)} rows={3} className="w-full border rounded px-2 py-1" />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">İptal</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">Paylaş</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLike, onComment, onDelete }) {
  const [commentText, setCommentText] = useState("");

  return (
    <article className="bg-white rounded mb-6 shadow-sm overflow-hidden">
      <header className="flex items-center gap-3 p-3">
        <img src={post.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-semibold">{post.user}</div>
          <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div className="ml-auto">
          {post.user === "you" && (
            <button onClick={() => onDelete(post.id)} className="text-xs text-red-500">Sil</button>
          )}
        </div>
      </header>
      <div className="w-full bg-gray-100">
        <img src={post.image} alt="post" className="w-full object-cover max-h-96" />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => onLike(post.id)} className="text-sm font-semibold">{post.liked ? '❤️' : '🤍'}</button>
          <div className="text-sm">{post.likes} beğeni</div>
        </div>
        <div className="mb-2"><span className="font-semibold mr-2">{post.user}</span>{post.caption}</div>

        <div className="mb-2">
          {post.comments.map((c) => (
            <div key={c.id} className="text-sm border-t pt-2 mt-2">
              <span className="font-semibold mr-2">{c.user}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onComment(post.id, commentText);
            setCommentText("");
          }}
          className="flex gap-2"
        >
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Yorum ekle..." className="flex-1 border rounded px-2 py-1 text-sm" />
          <button className="px-3 py-1 text-sm">Gönder</button>
        </form>
      </div>
    </article>
  );
}
