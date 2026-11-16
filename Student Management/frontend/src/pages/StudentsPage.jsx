import React, { useState } from 'react';
import StudentTable from '../components/StudentTable';
import StudentModal from '../components/StudentModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ErrorBanner from '../components/ErrorBanner';

export const StudentsPage = ({
  students,
  isLoading,
  error,
  onRefresh,
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  selectedYear,
  setSelectedYear,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSeedData,
  isSeeding,
  onNavigateToDiagnostics,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  // Save (Add or Update)
  const handleSaveStudent = async (studentData) => {
    setIsSaving(true);
    try {
      if (editingStudent) {
        await onUpdateStudent(editingStudent._id || editingStudent.studentId, studentData);
      } else {
        await onAddStudent(studentData);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (err) {
      console.error('Failed to save student:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete modal
  const handleOpenDelete = (student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      await onDeleteStudent(id);
      setIsDeleteOpen(false);
      setDeletingStudent(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic enrollments, grades, and records persisted in MongoDB Atlas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-indigo-600' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Error notification banner if API failed */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={onRefresh}
          onNavigateToDiagnostics={onNavigateToDiagnostics}
        />
      )}

      {/* Main Student Records Table */}
      <StudentTable
        students={students}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onAddStudent={handleOpenAdd}
        onEditStudent={handleOpenEdit}
        onDeleteStudent={handleOpenDelete}
        onSeedData={onSeedData}
        isSeeding={isSeeding}
      />

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        student={deletingStudent}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StudentsPage;
