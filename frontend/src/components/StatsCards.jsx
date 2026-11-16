export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-card">
            <div className="stat-card-label">Loading...</div>
            <div className="stat-card-value" style={{ color: '#e5e7eb' }}>—</div>
          </div>
        ))}
      </div>
    );
  }
  if (!stats) return null;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, sub: 'registered' },
    { label: 'Average CGPA', value: stats.averageCgpa?.toFixed(2) ?? '—', sub: 'out of 10.00' },
    { label: 'Active Backlogs', value: stats.totalActiveBacklogs, sub: 'across all students' },
    { label: 'Departments', value: stats.byDepartment?.length ?? 0, sub: 'active departments' },
  ];

  return (
    <div className="stats-grid">
      {cards.map(c => (
        <div key={c.label} className="stat-card">
          <div className="stat-card-label">{c.label}</div>
          <div className="stat-card-value">{c.value}</div>
          <div className="stat-card-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
