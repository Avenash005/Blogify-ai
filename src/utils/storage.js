// ── Keys ────────────────────────────────────────────────
const KEYS = {
  USERS:    'blogify_users',
  SESSION:  'blogify_session',
  POSTS:    (uid) => `blogify_posts_${uid}`,
  PROFILE:  (uid) => `blogify_profile_${uid}`,
};

// ── Helpers ─────────────────────────────────────────────
const read  = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── Users ────────────────────────────────────────────────
export function getAllUsers() {
  return read(KEYS.USERS) || {};
}

export function getUserByEmail(email) {
  const users = getAllUsers();
  return Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function registerUser({ firstName, lastName, email, password }) {
  if (getUserByEmail(email)) throw new Error('An account with this email already exists.');

  const users = getAllUsers();
  const uid   = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const user  = { uid, firstName, lastName, email, createdAt: new Date().toISOString() };

  // Store credentials + hashed pw (simple base64 – not production-safe, demo only)
  users[uid] = { ...user, _pw: btoa(password) };
  write(KEYS.USERS, users);

  // Seed empty posts list
  write(KEYS.POSTS(uid), []);

  return user;
}

export function loginUser({ email, password }) {
  const user = getUserByEmail(email);
  if (!user)              throw new Error('No account found with that email address.');
  if (user._pw !== btoa(password)) throw new Error('Incorrect password. Please try again.');
  const { _pw, ...safe } = user; // eslint-disable-line no-unused-vars
  return safe;
}

// ── Session ──────────────────────────────────────────────
export function saveSession(user) {
  write(KEYS.SESSION, user);
}

export function loadSession() {
  return read(KEYS.SESSION);
}

export function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
}

// ── Profile ──────────────────────────────────────────────
export function loadProfile(uid) {
  return read(KEYS.PROFILE(uid)) || {};
}

export function saveProfile(uid, profile) {
  const existing = loadProfile(uid);
  write(KEYS.PROFILE(uid), { ...existing, ...profile });
}

export function updatePassword(uid, oldPassword, newPassword) {
  const users = getAllUsers();
  const user  = users[uid];
  if (!user)                  throw new Error('User not found.');
  if (user._pw !== btoa(oldPassword)) throw new Error('Current password is incorrect.');
  users[uid]._pw = btoa(newPassword);
  write(KEYS.USERS, users);
}

// ── Posts ────────────────────────────────────────────────
export function loadPosts(uid) {
  return read(KEYS.POSTS(uid)) || [];
}

export function savePosts(uid, posts) {
  write(KEYS.POSTS(uid), posts);
}

export function addPost(uid, post) {
  const posts = loadPosts(uid);
  const newPost = {
    id:        `p_${Date.now()}`,
    uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...post,
  };
  const updated = [newPost, ...posts];
  savePosts(uid, updated);
  return newPost;
}

export function updatePost(uid, postId, changes) {
  const posts   = loadPosts(uid);
  const updated = posts.map(p =>
    p.id === postId ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
  );
  savePosts(uid, updated);
  return updated.find(p => p.id === postId);
}

export function deletePost(uid, postId) {
  const posts   = loadPosts(uid);
  const updated = posts.filter(p => p.id !== postId);
  savePosts(uid, updated);
}

// ── Seed sample posts for new users ─────────────────────
const SAMPLE_POSTS = [
  {
    title:    'The Quiet Revolution Happening Inside Modern Compilers',
    category: 'Technology',
    excerpt:  'How incremental compilation and language servers are fundamentally reshaping the relationship between code and the machine that reads it.',
    content:  `Modern compilers have always been the unsung heroes of software development. Behind every click of "Run" lies a staggering amount of computation — parsing, analysis, optimization, code generation — most of which happens invisibly, in milliseconds.\n\nBut something is changing. The emergence of language servers and incremental compilation pipelines has begun to transform not just how fast code compiles, but *what it means* for code to compile at all.\n\n## The Old World\n\nIn the beginning, compilation was a batch process. You handed the compiler your code, walked away, and came back to either a binary or a list of errors.\n\nThis worked well enough when programs were small. But as codebases grew into millions of lines, the wait became untenable.\n\n## The Language Server Protocol\n\nThe real transformation began with the Language Server Protocol (LSP), introduced by Microsoft in 2016. The insight was elegant: separate the *intelligence* of a language tool from the editor that displays it.\n\nSuddenly, every editor could have world-class understanding of Rust, Python, or Go, without each language having to write its own IDE from scratch.\n\n## What Comes Next\n\nThe frontier now is *semantic incrementalism*. Rather than recompiling files, tomorrow's compilers will reason about changes to *meaning*.\n\nThis is, quietly, one of the most profound shifts in how we build software — and most developers haven't noticed yet.`,
    author:   'Alex Chen',
    readTime: '5 min read',
    date:     'March 14, 2026',
  },
  {
    title:    'Why the Golden Age of the Essay Is Happening Right Now',
    category: 'Culture',
    excerpt:  'Newsletters and independent publishing have created the conditions for the most vital essay writing in a generation.',
    content:  `There's a strange kind of golden age happening right now, and most literary critics have missed it entirely. The personal essay — long declared dead by every credible commentator at least twice per decade — is not just surviving. It is thriving.\n\n## The Newsletter Moment\n\nWhen writers discovered that email newsletters could be monetized directly, something shifted. For the first time in a century, essayists could be paid directly by readers who valued their voice, rather than by publications that valued their audience.\n\nThe result has been a flowering of idiosyncratic, personal, deeply considered writing that would never have survived a traditional editorial process.\n\n## The Reader's Role\n\nWhat's also changed is the reader. The subscription model creates a different kind of relationship — one closer to patronage than transaction.\n\nThe essay, it turns out, was never dying. It was just waiting for the right economics.`,
    author:   'Maya Okafor',
    readTime: '4 min read',
    date:     'March 10, 2026',
  },
];

export function seedSamplePosts(uid) {
  const existing = loadPosts(uid);
  if (existing.length > 0) return;
  SAMPLE_POSTS.forEach(p => addPost(uid, p));
}
