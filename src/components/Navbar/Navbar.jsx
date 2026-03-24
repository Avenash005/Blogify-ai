import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import '../styles/navbar.css';

function initials(user) {
  if (!user) return '?';
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
}

export default function Navbar() {
  const { user, logout, view, goHome, openEditor, setView } = useApp();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={goHome}>
        Blogify<span>.</span>
      </div>

      {user && (
        <div className="navbar-center">
          <button
            className={`nav-link ${view === 'feed' ? 'active' : ''}`}
            onClick={goHome}
          >
            Feed
          </button>
          <button
            className={`nav-link ${view === 'editor' ? 'active' : ''}`}
            onClick={() => openEditor()}
          >
            Write
          </button>
        </div>
      )}

      <div className="navbar-right">
        {user ? (
          <>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13, padding: '7px 16px' }}
              onClick={() => openEditor()}
            >
              + New Post
            </button>

            <div className="user-dropdown-wrap" ref={dropRef}>
              <div
                className="user-chip"
                onClick={() => setDropOpen((o) => !o)}
                title="Account"
              >
                <div className="user-avatar">{initials(user)}</div>
                <span className="user-name">{user.firstName}</span>
              </div>

              {dropOpen && (
                <div className="user-dropdown" onClick={() => setDropOpen(false)}>
                  <div className="dropdown-header">
                    <div className="d-name">{user.firstName} {user.lastName}</div>
                    <div className="d-email">{user.email}</div>
                  </div>

                  <button className="dropdown-item" onClick={() => setView('profile')}>
                    <span>👤</span> My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => openEditor()}>
                    <span>✏️</span> New Post
                  </button>
                  <div className="dropdown-sep" />
                  <button className="dropdown-item danger" onClick={logout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            className="btn btn-primary"
            style={{ fontSize: 13 }}
            onClick={() => setView('auth')}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
