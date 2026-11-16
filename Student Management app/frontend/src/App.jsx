import { useState, useEffect, useCallback } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, getStats, checkHealth } from './api/students';
import StudentForm from './components/StudentForm';
import ConfirmDialog from './components/ConfirmDialog';
import StatsCards from './components/StatsCards';
import Toast from './components/Toast';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'];

function cgpaClass(cgpa) {
  if (cgpa >= 7.5) return 'cgpa-high';
  if (cgpa >= 5.0) return 'cgpa-mid';
  return 'cgpa-low';
}

let toastId = 0;

export default function App() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getStats();
      setStats(res.data.data);
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (yearFilter) params.year = yearFilter;
      const res = await getStudents(params);
      setStudents(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, yearFilter]);

  // Health check
  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleAdd = async (data) => {
    setFormLoading(true);
    try {
      await createStudent(data);
      setShowForm(false);
      addToast('Student added successfully', 'success');
      fetchStudents();
      fetchStats();
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await updateStudent(editStudent._id, data);
      setEditStudent(null);
      addToast('Student updated successfully', 'success');
      fetchStudents();
      fetchStats();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteStudent(deleteTarget._id);
      setDeleteTarget(null);
      addToast('Student deleted', 'success');
      fetchStudents();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => { setSearch(''); setDeptFilter(''); setYearFilter(''); };

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <h1>🎓 EduRecord</h1>
          <span>B.Tech Student Records</span>
        </div>
        <div className="header-status">
          <div className={`status-dot ${apiStatus}`} />
          {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'error' ? 'API Offline' : 'Connecting...'}
        </div>
      </header>

      <main className="main">
        <StatsCards stats={stats} loading={statsLoading} />

        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          {(search || deptFilter || yearFilter) && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>✕ Clear</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Student
          </button>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Student Records</h2>
            <span className="table-count">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '20px' }}>
              <div className="error-state">
                <p>⚠️ {error}</p>
                <button className="btn btn-primary" onClick={fetchStudents}>Retry</button>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{search || deptFilter || yearFilter ? 'No students match your filters.' : 'No students yet. Add your first student!'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Dept</th>
                    <th>Year</th>
                    <th>Phone</th>
                    <th>CGPA</th>
                    <th>Backlogs</th>
                    <th>Specialization</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id}>
                      <td><code>{s.studentId}</code></td>
                      <td><strong>{s.fullName}</strong></td>
                      <td style={{ fontSize: '0.8rem' }}>{s.email}</td>
                      <td><span className="badge badge-dept">{s.department}</span></td>
                      <td><span className="badge badge-year">Y{s.yearOfStudy}</span></td>
                      <td>{s.phoneNumber}</td>
                      <td><span className={cgpaClass(s.cgpa)}>{s.cgpa}</span></td>
                      <td><span className={s.activeBacklogs > 0 ? 'backlogs' : 'no-backlogs'}>{s.activeBacklogs}</span></td>
                      <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.specialization || '—'}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditStudent(s)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <StudentForm onSubmit={handleAdd} onClose={() => setShowForm(false)} loading={formLoading} />
      )}
      {editStudent && (
        <StudentForm student={editStudent} onSubmit={handleEdit} onClose={() => setEditStudent(null)} loading={formLoading} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${deleteTarget.fullName}?`}
          subMessage={`Student ID: ${deleteTarget.studentId}. This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
