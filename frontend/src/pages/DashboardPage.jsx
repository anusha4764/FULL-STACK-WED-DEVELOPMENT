import React from 'react';
import StatsCards from '../components/StatsCards';

export const DashboardPage = ({
  stats,
  healthStatus,
  students = [],
  onNavigateToStudents,
  onOpenAddModal,
  onNavigateToDiagnostics,
}) => {
  // Compute top performing students
  const topStudents = [...students]
    .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
    .slice(0, 4);

  // Department breakdown calculations
  const departments = stats?.departmentBreakdown || {};
  const totalCount = stats?.totalStudents || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Overview Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
              <span>Full-Stack Cloud Architecture</span>
              <span>•</span>
              <span>Vercel + Render + Atlas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Records Management System
            </h1>
            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
              Real-time student registry integrating React (Vercel) with Express REST API (Render)
              and MongoDB Atlas cloud database.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Student</span>
            </button>
            <button
              onClick={onNavigateToDiagnostics}
              className="px-4 py-2.5 bg-indigo-800/80 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs border border-indigo-600/50 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Cloud Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <StatsCards
        stats={stats}
        healthStatus={healthStatus}
        onNavigateToStudents={onNavigateToStudents}
      />

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Department Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrollment spread across academic divisions
              </p>
            </div>
            <button
              onClick={onNavigateToStudents}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Directory →
            </button>
          </div>

          <div className="space-y-4">
            {Object.keys(departments).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No department data yet.</p>
            ) : (
              Object.entries(departments).map(([dept, count]) => {
                const percentage = Math.round((count / totalCount) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{dept}</span>
                      <span className="text-slate-500">
                        {count} student{count > 1 ? 's' : ''} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Academic Year Breakdown (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Academic Year Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-6">
              Distribution by student seniority
            </p>

            <div className="grid grid-cols-2 gap-3">
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => {
                const count = stats?.yearBreakdown?.[yr] || 0;
                return (
                  <div
                    key={yr}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center"
                  >
                    <span className="text-xs font-semibold text-slate-500">{yr}</span>
                    <span className="text-xl font-bold text-slate-900 mt-1">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Retention</span>
            <span className="font-semibold text-emerald-600">98.4% Active</span>
          </div>
        </div>
      </div>

      {/* Top Academic Performers & Quick Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Honor Roll Students
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest Cumulative Grade Point Average
              </p>
            </div>
            <button
              onClick={onNavigateToStudents}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              See All →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No student records available yet.</p>
            ) : (
              topStudents.map((st) => (
                <div key={st._id || st.studentId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {st.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{st.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {st.department} • {st.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      GPA {Number(st.gpa || 3.5).toFixed(2)}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{st.studentId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Architecture Card */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-3 text-xs font-bold uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Deployment Matrix</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Live Cloud Pipeline</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Requests flow seamlessly from Vercel edge nodes to Render Web Service, authenticated
              through strict CORS headers and persisted directly to MongoDB Atlas.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="text-slate-400">Frontend Host:</span>
                <span className="font-semibold text-white">Vercel (React 18)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="text-slate-400">Backend Host:</span>
                <span className="font-semibold text-white">Render (Express.js)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="text-slate-400">Cloud Database:</span>
                <span className="font-semibold text-white">MongoDB Atlas</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onNavigateToDiagnostics}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors text-center"
            >
              Open Diagnostics & Troubleshooting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
