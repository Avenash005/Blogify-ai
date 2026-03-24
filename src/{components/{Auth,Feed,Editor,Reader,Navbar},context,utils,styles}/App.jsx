import { useApp } from './context/AppContext';
import Navbar  from './components/Navbar/Navbar';
import Auth    from './components/Auth/Auth';
import Feed    from './components/Feed/Feed';
import Editor  from './components/Editor/Editor';
import Reader  from './components/Reader/Reader';
import Profile from './components/Profile/Profile';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type || 'success'}`}>
      {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
    </div>
  );
}

export default function App() {
  const { user, view, toast } = useApp();

  // Not logged in → force auth screen
  if (!user) {
    return (
      <>
        <Auth />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {view === 'feed'    && <Feed />}
        {view === 'editor'  && <Editor />}
        {view === 'reader'  && <Reader />}
        {view === 'profile' && <Profile />}
      </main>
      <Toast toast={toast} />
    </>
  );
}
