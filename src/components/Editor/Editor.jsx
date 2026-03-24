import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import '../../styles/editor.css';

const CATS = ['Technology', 'Culture', 'Science', 'Business', 'Travel', 'Health', 'Design'];

function wordCount(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
function readTime(text)  { return `${Math.max(1, Math.round(wordCount(text) / 200))} min read`; }
function getExcerpt(text) {
  const plain = text.replace(/^#+\s*/gm, '').replace(/\*+/g, '').replace(/>/g, '');
  const first = plain.split('\n\n').find(p => p.trim().length > 30) || plain;
  return first.trim().slice(0, 180) + (first.length > 180 ? '…' : '');
}

export default function Editor() {
  const { user, current, createPost, editPost, goHome, showToast, openPost } = useApp();
  const isEdit = Boolean(current && current.id);

  const [title,    setTitle]    = useState(isEdit ? current.title    : '');
  const [content,  setContent]  = useState(isEdit ? current.content  : '');
  const [category, setCategory] = useState(isEdit ? current.category : 'Technology');
  const [generating, setGenerating] = useState(false);
  const [genStatus,  setGenStatus]  = useState('');
  const taRef = useRef(null);

  // Keep state in sync when switching to edit a different post
  useEffect(() => {
    setTitle(isEdit ? current.title : '');
    setContent(isEdit ? current.content : '');
    setCategory(isEdit ? current.category : 'Technology');
  }, [current?.id]); // eslint-disable-line

  const canPublish = title.trim() && content.trim() && !generating;

  // ── AI generation ──────────────────────────────────────
  const generate = async () => {
    if (!title.trim() || generating) return;
    setGenerating(true);
    setGenStatus('Writing your post…');
    setContent('');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Write a high-quality blog post titled "${title}" in the category "${category}".

Requirements:
- 500–700 words
- Compelling hook that grabs the reader immediately
- Use ## for H2 section headings
- Intelligent, literary magazine tone — concrete, specific, insightful
- End with a thought-provoking conclusion

Format: plain text only. Use ## for headings, **text** for bold, *text* for italic. Separate paragraphs with blank lines. Begin the post directly — no preamble, no "Here is your post".`
          }],
        }),
      });

      const data = await res.json();
      const text = (data.content || []).map(b => b.text || '').join('').trim();
      setContent(text);
      if (taRef.current) { taRef.current.value = text; taRef.current.focus(); }
      setGenStatus('Done!');
      setTimeout(() => setGenStatus(''), 2000);
    } catch {
      showToast('Generation failed — please write manually.', 'error');
      setGenStatus('');
    } finally {
      setGenerating(false);
    }
  };

  // ── Publish / Save ─────────────────────────────────────
  const publish = () => {
    if (!canPublish) return;
    const data = {
      title:    title.trim(),
      category,
      content:  content.trim(),
      excerpt:  getExcerpt(content),
      readTime: readTime(content),
      author:   `${user.firstName} ${user.lastName}`,
    };

    if (isEdit) {
      const updated = editPost(current.id, data);
      showToast('Post updated!');
      openPost(updated);
    } else {
      const post = createPost(data);
      showToast('Post published!');
      openPost(post);
    }
  };

  return (
    <div className="editor-page">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-header-text">
          <h2>{isEdit ? 'Edit Post' : 'New Post'}</h2>
          <p>
            {isEdit
              ? 'Update your post and save changes.'
              : 'Write manually or let AI draft it from your title.'}
          </p>
        </div>
        <div className="editor-header-actions">
          <button className="btn btn-ghost" onClick={goHome}>Cancel</button>
          <button className="btn btn-primary" onClick={publish} disabled={!canPublish}>
            {isEdit ? 'Save Changes' : 'Publish →'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="field-group">
        <label className="field-label">Title</label>
        <input
          className="field-input title-input"
          placeholder="What's your post about?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
      </div>

      {/* Category */}
      <div className="field-group">
        <label className="field-label">Category</label>
        <select
          className="field-input cat-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* AI Banner */}
      {title.trim() && !isEdit && (
        <div className="ai-banner">
          <span className="ai-banner-icon">✦</span>
          <div className="ai-banner-body">
            <strong>AI Writing Assistant</strong>
            <span>Click generate to have Claude write a full draft from your title.</span>
          </div>
          <button
            className="btn btn-primary ai-gen-btn"
            onClick={generate}
            disabled={generating}
          >
            {generating ? (
              <><div className="dot-loader"><span /><span /><span /></div>{genStatus || 'Writing…'}</>
            ) : '✦ Generate'}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="field-group">
        <label className="field-label">Content</label>
        <div className="generating-wrap">
          <textarea
            ref={taRef}
            className="field-input content-textarea"
            placeholder={`Start writing here…\n\n## Use ## for headings\n**bold** and *italic* are supported\n> Blockquotes too`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={generating}
          />
          {generating && (
            <div className="generating-overlay">
              <div className="dot-loader"><span /><span /><span /></div>
              {genStatus}
            </div>
          )}
        </div>
        <div className="md-tips">
          {['## Heading', '**bold**', '*italic*', '> Quote'].map(tip => (
            <span key={tip} className="md-tip">{tip}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="editor-footer">
        <div className="editor-footer-left">
          {content && (
            <>
              <span className="word-badge">{wordCount(content)} words</span>
              <span className="word-badge">{readTime(content)}</span>
            </>
          )}
        </div>
        <button className="btn btn-primary" onClick={publish} disabled={!canPublish}>
          {isEdit ? 'Save Changes' : 'Publish Post →'}
        </button>
      </div>
    </div>
  );
}
