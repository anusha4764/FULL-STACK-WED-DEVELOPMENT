import React from 'react';

export const StatsCards = ({ stats, healthStatus, onNavigateToStudents }) => {
  const cards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents ?? '...',
      subtitle: `${stats?.activeStudents ?? 0} currently active`,
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: 'bg-indigo-50 border-indigo-100',
      action: onNavigateToStudents,
      actionText: 'View All Records →',
    },
    {
      title: 'Active Departments',
      value: stats?.departmentsCount ?? '...',
      subtitle: 'Across engineering & management',
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: 'bg-violet-50 border-violet-100',
    },
    {
      title: 'Average GPA',
      value: stats?.averageGpa ? `${stats.averageGpa} / 4.0` : '...',
      subtitle: 'Cumulative performance index',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Database & Cloud',
      value: healthStatus?.database?.connected
        ? `${healthStatus?.database?.connectionType || 'MongoDB'} Connected`
        : 'Database Disconnected',
      subtitle: healthStatus?.database?.connected
        ? `Host: ${healthStatus?.database?.host} (${healthStatus?.database?.dbName})`
        : (healthStatus?.database?.error || 'Check MONGODB_URI in .env'),
      icon: (
        <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      bg: healthStatus?.database?.connected ? 'bg-sky-50 border-sky-100' : 'bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-xl border ${card.bg}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>{card.subtitle}</span>
            {card.action && (
              <button
                onClick={card.action}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {card.actionText}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
