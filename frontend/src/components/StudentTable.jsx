import React, { useState } from 'react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Data Science & AI',
  'Business Administration',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export const StudentTable = ({
  students = [],
  isLoading = false,
  searchTerm = '',
  setSearchTerm,
  selectedDept = 'All',
  setSelectedDept,
  selectedYear = 'All',
  setSelectedYear,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSeedData,
  isSeeding = false,
}) => {
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);

  // Status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Graduated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // GPA color coding
  const getGpaBadge = (gpa) => {
    if (gpa >= 3.75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (gpa >= 3.0) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  // Color generator for avatar based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-indigo-600',
      'bg-violet-600',
      'bg-sky-600',
      'bg-emerald-600',
      'bg-rose-600',
      'bg-amber-600',
      'bg-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar & Filters */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, ID, or email..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden shadow-xs"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:outline-hidden shadow-xs"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr === 'All' ? 'All Years' : yr}
              </option>
            ))}
          </select>

          {/* Seed Data Button */}
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            title="Populate sample records"
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-indigo-500 ${isSeeding ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Seed Records</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={onAddStudent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider text-left">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Student Name & Email
              </th>
              <th scope="col" className="px-6 py-3.5">
                Student ID
              </th>
              <th scope="col" className="px-6 py-3.5">
                Department
              </th>
              <th scope="col" className="px-6 py-3.5">
                Year
              </th>
              <th scope="col" className="px-6 py-3.5">
                GPA
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-sm">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                      <div className="space-y-1.5">
                        <div className="h-4 bg-slate-200 rounded-sm w-32"></div>
                        <div className="h-3 bg-slate-100 rounded-sm w-44"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-16"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 bg-slate-200 rounded-sm w-14 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-slate-700">No student records found</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      {searchTerm || selectedDept !== 'All' || selectedYear !== 'All'
                        ? 'Try adjusting your search criteria or resetting the filters.'
                        : 'No records exist in the database yet. Click "Add Student" or "Seed Records" to get started.'}
                    </p>
                    {(searchTerm || selectedDept !== 'All' || selectedYear !== 'All') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedDept('All');
                          setSelectedYear('All');
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Actual Student Records Rows
              students.map((student) => {
                const initials = student.name
                  ? student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'ST';

                return (
                  <tr
                    key={student._id || student.studentId}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Student Name & Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full ${getAvatarColor(
                            student.name
                          )} flex items-center justify-center text-white text-xs font-bold shadow-xs`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {student.studentId}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                      {student.department}
                    </td>

                    {/* Academic Year */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      {student.year}
                    </td>

                    {/* GPA */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getGpaBadge(
                          student.gpa || 3.5
                        )}`}
                      >
                        {Number(student.gpa || 3.5).toFixed(2)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          student.status || 'Active'
                        )}`}
                      >
                        {student.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      {/* View Quick Details */}
                      <button
                        onClick={() => setSelectedStudentForView(student)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEditStudent(student)}
                        title="Edit Student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteStudent(student)}
                        title="Delete Student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-700">{students.length}</span> student record
          {students.length === 1 ? '' : 's'}
        </div>
        <div className="text-slate-400">
          MongoDB Atlas Cloud Synchronized
        </div>
      </div>

      {/* Quick View Student Detail Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl ${getAvatarColor(
                    selectedStudentForView.name
                  )} flex items-center justify-center text-white text-base font-bold shadow-sm`}
                >
                  {selectedStudentForView.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStudentForView.name}
                  </h3>
                  <p className="text-xs font-mono text-indigo-600 font-semibold">
                    {selectedStudentForView.studentId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedStudentForView.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-900">
                  {selectedStudentForView.department}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Academic Year</span>
                <span className="font-semibold text-slate-900">
                  {selectedStudentForView.year}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Grade Point Average</span>
                <span className="font-bold text-emerald-600">
                  {Number(selectedStudentForView.gpa || 3.5).toFixed(2)} / 4.0
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Enrollment Status</span>
                <span className="font-semibold text-slate-900">
                  {selectedStudentForView.status || 'Active'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Database ID</span>
                <span className="font-mono text-slate-400 text-[10px]">
                  {selectedStudentForView._id}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
