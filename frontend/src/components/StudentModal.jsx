import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Data Science & AI',
  'Business Administration',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const STATUSES = ['Active', 'On Leave', 'Graduated'];

export const StudentModal = ({ isOpen, onClose, onSave, student = null, isSaving = false }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    year: '1st Year',
    gpa: 3.5,
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId || '',
        name: student.name || '',
        email: student.email || '',
        department: student.department || 'Computer Science',
        year: student.year || '1st Year',
        gpa: student.gpa !== undefined ? student.gpa : 3.5,
        status: student.status || 'Active',
      });
    } else {
      // Suggest next student ID for new record
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        studentId: `STU-${randomNum}`,
        name: '',
        email: '',
        department: 'Computer Science',
        year: '1st Year',
        gpa: 3.5,
        status: 'Active',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.studentId.trim()) {
      errs.studentId = 'Student ID is required (e.g. STU-1001)';
    }
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format';
    }
    if (!formData.department) {
      errs.department = 'Department is required';
    }
    if (!formData.year) {
      errs.year = 'Academic year is required';
    }
    const gpaNum = parseFloat(formData.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      errs.gpa = 'GPA must be a number between 0.0 and 4.0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      studentId: formData.studentId.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      gpa: parseFloat(formData.gpa),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {student ? 'Edit Student Record' : 'Add New Student'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {student ? `Updating records for ${student.studentId}` : 'Enter student credentials to save in MongoDB Atlas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student ID *
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="STU-1001"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:ring-2 focus:outline-hidden transition-all uppercase ${
                  errors.studentId
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
              {errors.studentId && <p className="text-xs text-rose-500 mt-1">{errors.studentId}</p>}
            </div>

            {/* GPA */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                GPA (0.0 - 4.0) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="4.0"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:ring-2 focus:outline-hidden transition-all ${
                  errors.gpa
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
              {errors.gpa && <p className="text-xs text-rose-500 mt-1">{errors.gpa}</p>}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alexander Hamilton"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:ring-2 focus:outline-hidden transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@university.edu"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:ring-2 focus:outline-hidden transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 focus:outline-hidden bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Academic Year *
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 focus:outline-hidden bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Enrollment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 focus:outline-hidden bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{student ? 'Save Changes' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
