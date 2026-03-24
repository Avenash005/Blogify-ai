# Blogify ✦

A production-ready blogging web app with authentication, persistent storage, AI-powered writing, and a full editorial reading experience.

---

## Features

- **Authentication** — Register & login with email/password, persisted across sessions
- **Per-user posts** — Each account has its own post library, saved to localStorage
- **AI Writing** — One click generates a full blog post draft via the Claude API
- **Full editor** — Create and edit posts with Markdown support (headings, bold, italic, blockquotes)
- **Reader view** — Beautiful typographic reading experience
- **Profile page** — Update bio, name, website, and change password
- **Search & filter** — Filter by category, search by keyword across all posts
- **Toast notifications** — Instant feedback on all actions

---

## Tech Stack

| Layer      | Choice                          |
|------------|---------------------------------|
| Framework  | React 18 + Vite                 |
| State      | React Context API               |
| Storage    | localStorage (per-user)         |
| AI         | Anthropic Claude API            |
| Styling    | Plain CSS modules (no framework)|
| Fonts      | Playfair Display + Lora + DM Sans |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

No environment variables needed — the Claude API key is handled by the platform.

---

## Project Structure

```
blogify/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    # Entry point
    ├── App.jsx                     # Root component & view router
    ├── context/
    │   └── AppContext.jsx          # Global state (auth, posts, navigation)
    ├── utils/
    │   └── storage.js              # All localStorage read/write helpers
    ├── styles/
    │   ├── global.css              # Reset, variables, shared components
    │   ├── auth.css                # Login / Register page
    │   ├── navbar.css              # Navigation bar + dropdown
    │   ├── feed.css                # Post feed & cards
    │   ├── editor.css              # Post editor
    │   └── reader.css              # Article reader
    └── components/
        ├── Auth/
        │   └── Auth.jsx            # Login + Register forms
        ├── Navbar/
        │   └── Navbar.jsx          # Sticky nav with user dropdown
        ├── Feed/
        │   └── Feed.jsx            # Post listing with search & filter
        ├── Editor/
        │   └── Editor.jsx          # Create/edit post + AI generation
        ├── Reader/
        │   └── Reader.jsx          # Full article reading view
        └── Profile/
            └── Profile.jsx         # Account settings & password change
```

---

## How Data Is Stored

All data is stored in `localStorage` — no backend required.

| Key pattern                  | Contents                          |
|------------------------------|-----------------------------------|
| `blogify_users`              | All registered users (+ hashed pw)|
| `blogify_session`            | Currently logged-in user          |
| `blogify_posts_{uid}`        | Posts for a specific user         |
| `blogify_profile_{uid}`      | Extended profile (bio, website)   |

> **Note:** Passwords are base64-encoded for demo purposes. For production, use a proper backend with bcrypt hashing.

---

## Markdown Support

In the editor, you can use:

| Syntax          | Result      |
|-----------------|-------------|
| `## Heading`    | H2 heading  |
| `### Heading`   | H3 heading  |
| `**bold**`      | **Bold**    |
| `*italic*`      | *Italic*    |
| `> Quote`       | Blockquote  |

Separate paragraphs with a blank line.

---

## Build for Production

```bash
npm run build
# Output goes to /dist — deploy anywhere (Netlify, Vercel, GitHub Pages)
```
