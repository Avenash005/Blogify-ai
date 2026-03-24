import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { saveProfile, loadProfile, updatePassword, saveSession } from '../../utils/storage';

const S = {
  page:     { maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 5rem', animation: 'fadeUp 0.3s ease both' },
  heading:  { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--text)', marginBottom: 6 },
  sub:      { fontSize: 14, color: 'var(--text-3)', marginBottom: '2.5rem' },
  card:     { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem' },
  cardTitle:{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' },
  row:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  footer:   { display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' },
  success:  { background: 'rgba(76,175,125,0.08)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
  error:    { background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
  avatar:   { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #C4973A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: '#0D0F14' },
};

export default function Profile() {
  const { user, setView, showToast, logout } = useApp();
  const profile = loadProfile(user.uid);

  // Profile form
  const [pForm,   setPForm]   = useState({ firstName: user.firstName, lastName: user.lastName, bio: profile.bio || '', website: profile.website || '' });
  const [pStatus, setPStatus] = useState(null);

  // Password form
  const [pwForm,   setPwForm]  = useState({ current: '', newPw: '', confirm: '' });
  const [pwStatus, setPwStatus]= useState(null);
  const [showPw,   setShowPw]  = useState(false);

  const setP  = (k) => (e) => setPForm(f  => ({ ...f,  [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm(f => ({ ...f,  [k]: e.target.value }));

  const saveProfileData = (e) => {
    e.preventDefault();
    setPStatus(null);
    try {
      saveProfile(user.uid, { bio: pForm.bio, website: pForm.website });
      // Also update the session name
      const updatedUser = { ...user, firstName: pForm.firstName, lastName: pForm.lastName };
      saveSession(updatedUser);
      setPStatus({ type: 'success', msg: 'Profile saved!' });
      showToast('Profile updated!');
    } catch (err) {
      setPStatus({ type: 'error', msg: err.message });
    }
  };

  const changePassword = (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPw !== pwForm.confirm) { setPwStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    if (pwForm.newPw.length < 6)         { setPwStatus({ type: 'error', msg: 'New password must be at least 6 characters.' }); return; }
    try {
      updatePassword(user.uid, pwForm.current, pwForm.newPw);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwStatus({ type: 'success', msg: 'Password changed successfully.' });
      showToast('Password updated!');
    } catch (err) {
      setPwStatus({ type: 'error', msg: err.message });
    }
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={S.page}>
      <button className="btn btn-ghost" style={{ marginBottom: '2rem', fontSize: 13 }} onClick={() => setView('feed')}>
        ← Back to feed
      </button>

      <h2 style={S.heading}>My Profile</h2>
      <p style={S.sub}>Manage your account details and preferences.</p>

      {/* Avatar row */}
      <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={S.avatar}>{initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 3 }}>{user.email}</div>
          {profile.bio && <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>{profile.bio}</div>}
        </div>
      </div>

      {/* Edit profile */}
      <form onSubmit={saveProfileData}>
        <div style={S.card}>
          <div style={S.cardTitle}>Account Details</div>

          {pStatus && (
            <div style={pStatus.type === 'success' ? S.success : S.error}>
              {pStatus.type === 'success' ? '✓' : '⚠'} {pStatus.msg}
            </div>
          )}

          <div className="field-group">
            <label className="field-label">Name</label>
            <div style={S.row}>
              <input className="field-input" type="text" placeholder="First" value={pForm.firstName} onChange={setP('firstName')} required />
              <input className="field-input" type="text" placeholder="Last"  value={pForm.lastName}  onChange={setP('lastName')}  required />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>

          <div className="field-group">
            <label className="field-label">Bio <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              className="field-input"
              placeholder="A short bio about yourself…"
              value={pForm.bio}
              onChange={setP('bio')}
              style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="field-label">Website <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input className="field-input" type="url" placeholder="https://yoursite.com" value={pForm.website} onChange={setP('website')} />
          </div>

          <div style={S.footer}>
            <button className="btn btn-primary" type="submit">Save Profile</button>
          </div>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword}>
        <div style={S.card}>
          <div style={S.cardTitle}>Change Password</div>

          {pwStatus && (
            <div style={pwStatus.type === 'success' ? S.success : S.error}>
              {pwStatus.type === 'success' ? '✓' : '⚠'} {pwStatus.msg}
            </div>
          )}

          <div className="field-group">
            <label className="field-label">Current Password</label>
            <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={pwForm.current} onChange={setPw('current')} required autoComplete="current-password" />
          </div>

          <div className="field-group">
            <label className="field-label">New Password</label>
            <div style={S.row}>
              <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={pwForm.newPw}  onChange={setPw('newPw')}  required autoComplete="new-password" />
              <input className="field-input" type={showPw ? 'text' : 'password'} placeholder="Confirm"           value={pwForm.confirm} onChange={setPw('confirm')} required autoComplete="new-password" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
            <input type="checkbox" id="show-pw" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} style={{ accentColor: 'var(--gold)', cursor: 'pointer' }} />
            <label htmlFor="show-pw" style={{ fontSize: 13, color: 'var(--text-3)', cursor: 'pointer' }}>Show passwords</label>
          </div>

          <div style={S.footer}>
            <button className="btn btn-primary" type="submit">Update Password</button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div style={{ ...S.card, borderColor: 'var(--danger-border)' }}>
        <div style={{ ...S.cardTitle, color: 'var(--danger)' }}>Sign Out</div>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: '1.25rem' }}>
          You'll be returned to the sign-in screen. Your posts and data are saved locally.
        </p>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
