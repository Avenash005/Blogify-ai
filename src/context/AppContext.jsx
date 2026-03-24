import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  loadSession, saveSession, clearSession,
  loadPosts, addPost, updatePost, deletePost as storageDeletePost,
  seedSamplePosts,
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(() => loadSession());
  const [posts,   setPosts]   = useState([]);
  const [view,    setView]    = useState('feed');      // feed | editor | reader | profile
  const [current, setCurrent] = useState(null);        // currently-open post
  const [toast,   setToast]   = useState(null);        // { msg, type }

  // Load posts whenever user changes
  useEffect(() => {
    if (user) {
      seedSamplePosts(user.uid);
      setPosts(loadPosts(user.uid));
    } else {
      setPosts([]);
    }
  }, [user]);

  // ── Auth ──────────────────────────────────────────────
  const login = useCallback((userData) => {
    saveSession(userData);
    setUser(userData);
    setView('feed');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setView('feed');
    setCurrent(null);
  }, []);

  // ── Posts ─────────────────────────────────────────────
  const refreshPosts = useCallback(() => {
    if (user) setPosts(loadPosts(user.uid));
  }, [user]);

  const createPost = useCallback((data) => {
    if (!user) return;
    const post = addPost(user.uid, data);
    setPosts(prev => [post, ...prev]);
    return post;
  }, [user]);

  const editPost = useCallback((postId, changes) => {
    if (!user) return;
    const updated = updatePost(user.uid, postId, changes);
    setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    if (current?.id === postId) setCurrent(updated);
    return updated;
  }, [user, current]);

  const removePost = useCallback((postId) => {
    if (!user) return;
    storageDeletePost(user.uid, postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (current?.id === postId) { setCurrent(null); setView('feed'); }
  }, [user, current]);

  // ── Navigation ────────────────────────────────────────
  const openPost = useCallback((post) => {
    setCurrent(post);
    setView('reader');
  }, []);

  const openEditor = useCallback((post = null) => {
    setCurrent(post);   // null = new, post = edit
    setView('editor');
  }, []);

  const goHome = useCallback(() => {
    setCurrent(null);
    setView('feed');
  }, []);

  // ── Toast ─────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      posts, createPost, editPost, removePost, refreshPosts,
      view, setView, current, setCurrent,
      openPost, openEditor, goHome,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
