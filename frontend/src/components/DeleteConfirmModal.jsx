import React from 'react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, student, isDeleting }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <div className="p-3 bg-rose-100 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete Student Record</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to permanently delete the student record for{' '}
          <strong className="text-slate-900 font-semibold">{student.name}</strong> (
          <span className="font-mono text-xs font-bold text-indigo-600">{student.studentId}</span>)?
          This record will be removed from MongoDB Atlas.
        </p>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(student._id || student.studentId)}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>Delete Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
