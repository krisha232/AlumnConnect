import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, PROFILE_COLS } from '../lib/supabase';
import { errorText, roleLine } from '../lib/format';
import Avatar from '../components/Avatar';

export default function Members() {
  const [people, setPeople] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [year, setYear] = useState('');

  useEffect(() => {
    supabase
      .from('profiles')
      .select(PROFILE_COLS)
      .eq('status', 'active')
      .order('full_name')
      .then(({ data, error }) => {
        if (error) setError(errorText(error));
        setPeople(data || []);
      });
  }, []);

  const years = useMemo(
    () => [...new Set((people || []).map((p) => p.batch_year).filter(Boolean))].sort((a, b) => b - a),
    [people]
  );

  const shown = (people || []).filter((p) => {
    if (role !== 'all' && p.role !== role) return false;
    if (year && String(p.batch_year) !== year) return false;
    if (q) {
      const hay = `${p.full_name} ${p.headline || ''} ${p.location || ''} ${p.university || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="page">
      <h1 className="page-title">Members</h1>
      <div className="filters">
        <input type="search" placeholder="Search by name, work, university or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search members" />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="all">Everyone</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
          <option value="staff">Staff</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Class year">
          <option value="">Any year</option>
          {years.map((y) => <option key={y} value={y}>Class of {y}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {people === null && <p className="muted">Loading members…</p>}
      {people && <p className="muted small">{shown.length} of {people.length} members</p>}
      <ul className="member-list">
        {shown.map((p) => (
          <li key={p.id}>
            <Link to={`/profile/${p.id}`} className="member">
              <Avatar person={p} size={44} />
              <span className="member-text">
                <strong>{p.full_name}</strong>
                <span className="muted small">{roleLine(p)}</span>
                {p.headline && <span className="small">{p.headline}</span>}
                {p.role === 'alumni' && p.university && <span className="small muted">{p.university}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
