import { useApp } from '../../context/AppContext';
import '../../styles/reader.css';

function parseContent(text) {
  if (!text) return '';
  return text
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## '))  return `<h2>${esc(block.slice(3))}</h2>`;
      if (block.startsWith('### ')) return `<h3>${esc(block.slice(4))}</h3>`;
      if (block.startsWith('> '))   return `<blockquote>${esc(block.slice(2))}</blockquote>`;
      const inline = esc(block)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g,     '<em>$1</em>')
        .replace(/_(.*?)_/g,       '<em>$1</em>');
      return `<p>${inline}</p>`;
    })
    .join('');
}

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function initials(name = '') {
  return name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return iso || ''; }
}

export default function Reader() {
  const { current, user, goHome, openEditor, removePost, showToast } = useApp();

  if (!current) { goHome(); return null; }

  const isOwn = user && current.uid === user.uid;
  const author = current.author || 'Anonymous';
  const date   = formatDate(current.createdAt) || current.date || '';

  const handleDelete = () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    removePost(current.id);
    showToast('Post deleted.');
  };

  return (
    <div className="reader-page">
      {/* Back link */}
      <div className="reader-back">
        <button className="btn btn-ghost" onClick={goHome} style={{ fontSize: 13 }}>
          ← Back to feed
        </button>
      </div>

      {/* Category */}
      <span className="reader-cat">{current.category}</span>

      {/* Title */}
      <h1 className="reader-title">{current.title}</h1>

      {/* Meta bar */}
      <div className="reader-meta-bar">
        <div className="reader-avatar">{initials(author)}</div>
        <div className="reader-meta-text">
          <div className="r-author">{author}</div>
          <div className="r-date">{date}</div>
        </div>
        <div className="reader-meta-right">
          <span className="read-time-badge">{current.readTime}</span>
          {isOwn && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => openEditor(current)}
            >
              ✏ Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: parseContent(current.content) }}
      />

      {/* Ornament */}
      <div className="reader-ornament">· · ·</div>

      {/* Footer */}
      <div className="reader-footer">
        <div className="reader-footer-left">
          <button className="btn btn-ghost" onClick={goHome} style={{ fontSize: 13 }}>
            ← All posts
          </button>
        </div>
        {isOwn && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete post
          </button>
        )}
      </div>
    </div>
  );
}
