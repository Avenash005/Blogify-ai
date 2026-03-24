import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import '../../styles/feed.css';

const CATS = ['All', 'Technology', 'Culture', 'Science', 'Business', 'Travel', 'Health', 'Design'];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return iso || ''; }
}

export default function Feed() {
  const { posts, user, openPost, openEditor } = useApp();
  const [cat,    setCat]    = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = cat === 'All' ? posts : posts.filter(p => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, cat, search]);

  return (
    <div className="feed-page">
      {/* Hero */}
      <div className="feed-hero">
        <h1 className="feed-hero-title">
          {user
            ? <>Good reading, <em>{user.firstName}</em>.</>
            : <>Your <em>ideas</em>, beautifully written.</>
          }
        </h1>
        <p className="feed-hero-sub">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          <span />
          AI-powered writing
          <span />
          Save everything
        </p>

        {/* Search */}
        <div className="feed-search-wrap">
          <span className="feed-search-icon">🔍</span>
          <input
            className="field-input feed-search"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="categories-bar">
        {CATS.map(c => (
          <button
            key={c}
            className={`cat-pill ${cat === c ? 'active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="posts-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✦</span>
            <h3>
              {search ? 'No results found' : cat !== 'All' ? `No posts in "${cat}"` : 'No posts yet'}
            </h3>
            <p>
              {search
                ? `Try a different search term.`
                : user
                ? 'Be the first — write something today.'
                : 'Sign in to start writing.'}
            </p>
            {!search && user && (
              <button className="btn btn-primary" onClick={() => openEditor()}>
                + Write a post
              </button>
            )}
          </div>
        ) : (
          filtered.map((post, i) => (
            <div key={post.id}>
              {i > 0 && <div className="posts-divider" />}
              <PostCard post={post} index={i} onOpen={() => openPost(post)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, index, onOpen }) {
  const { user } = useApp();
  const isOwn = user && post.uid === user.uid;

  return (
    <div className="post-card" onClick={onOpen}>
      <div className="post-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="post-body">
        <div className="post-cat">{post.category}</div>
        <div className="post-title">{post.title}</div>
        <div className="post-excerpt">{post.excerpt}</div>
        <div className="post-meta">
          <span>{post.author || `${post.firstName || 'You'}`}</span>
          <span className="post-meta-dot">·</span>
          <span>{formatDate(post.createdAt) || post.date}</span>
          <span className="post-meta-dot">·</span>
          <span>{post.readTime}</span>
          {isOwn && <span className="post-mine-badge">Yours</span>}
        </div>
      </div>
    </div>
  );
}
