import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { loginUser, registerUser, seedSamplePosts } from '../../utils/storage';
import '../../styles/auth.css';

// ── Login Form ──────────────────────────────────────────
function LoginForm({ switchToRegister }) {
  const { login, showToast } = useApp();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = loginUser(form);
      showToast(`Welcome back, ${user.firstName}!`);
      login(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-form-box">
        <h3>Welcome back</h3>
        <p className="auth-sub">Sign in to your Blogify account</p>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="auth-input-wrap">
            <input
              className="field-input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPw((s) => !s)}
              tabIndex={-1}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary auth-btn-full"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <><div className="dot-loader"><span /><span /><span /></div> Signing in…</>
          ) : 'Sign In'}
        </button>

        <div className="auth-toggle">
          Don't have an account?
          <button type="button" onClick={switchToRegister}>Create one</button>
        </div>
      </div>
    </form>
  );
}

// ── Register Form ───────────────────────────────────────
function RegisterForm({ switchToLogin }) {
  const { login, showToast } = useApp();
  const [form, setForm]   = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = registerUser(form);
      seedSamplePosts(user.uid);
      showToast(`Account created! Welcome, ${user.firstName}!`);
      login(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-form-box">
        <h3>Create account</h3>
        <p className="auth-sub">Start writing beautifully today</p>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Name</label>
          <div className="auth-field-row">
            <input
              className="field-input"
              type="text"
              placeholder="First"
              value={form.firstName}
              onChange={set('firstName')}
              required
              autoComplete="given-name"
            />
            <input
              className="field-input"
              type="text"
              placeholder="Last"
              value={form.lastName}
              onChange={set('lastName')}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="auth-input-wrap">
            <input
              className="field-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPw((s) => !s)}
              tabIndex={-1}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Confirm Password</label>
          <input
            className="field-input"
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat password"
            value={form.confirm}
            onChange={set('confirm')}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          className="btn btn-primary auth-btn-full"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <><div className="dot-loader"><span /><span /><span /></div> Creating…</>
          ) : 'Create Account'}
        </button>

        <div className="auth-toggle">
          Already have an account?
          <button type="button" onClick={switchToLogin}>Sign in</button>
        </div>
      </div>
    </form>
  );
}

// ── Main Auth Page ──────────────────────────────────────
const QUOTES = [
  { text: 'A writer only begins a book. A reader finishes it.', by: '— Samuel Johnson' },
  { text: 'Fill your paper with the breathings of your heart.', by: '— William Wordsworth' },
  { text: 'The purpose of a writer is to keep civilization from destroying itself.', by: '— Albert Camus' },
];

export default function Auth() {
  const [mode, setMode] = useState('login');
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-logo">Blogify<span>.</span></div>

        <div className="auth-tagline">
          <h2>
            Your <em>ideas</em>,<br />
            beautifully<br />
            written.
          </h2>
          <p>
            Blogify gives you an intelligent writing space — distraction-free editing,
            AI-assisted drafting, and a feed for your best thinking.
          </p>
        </div>

        <blockquote className="auth-quote">
          {quote.text}
          <cite>{quote.by}</cite>
        </blockquote>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        {mode === 'login' ? (
          <LoginForm key="login" switchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm key="register" switchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}
