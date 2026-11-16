import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TroubleshootingPage from './pages/TroubleshootingPage';
import AlertToast from './components/AlertToast';
import apiService, { API_BASE_URL } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const showToast = (type, message, title = '') => {
    setToast({ type, message, title });
  };

  // 1. Check Backend Health & MongoDB Connection
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await apiService.checkHealth();
      setHealthStatus(data);
      return data;
    } catch (err) {
      console.warn('Backend health check error:', err);
      setHealthStatus({
        status: 'offline',
        message: 'Backend server is currently offline or unreachable via CORS.',
        database: { connected: false },
      });
      return null;
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // 2. Fetch Student Records
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getStudents({
        search: searchTerm,
        department: selectedDept,
        year: selectedYear,
      });
      setStudents(response.data || []);
      if (response.notice) {
        console.info(response.notice);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      setError(err);
      showToast(
        'error',
        err.message || 'Failed to retrieve students from Render backend.',
        'API Error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDept, selectedYear]);

  // 3. Fetch Dashboard Summary Statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn('Fetch stats error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchStudents();
    fetchStats();
  }, [checkHealth, fetchStudents, fetchStats]);

  // Periodic health check every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      checkHealth();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // ==========================================
  // CRUD Handlers
  // ==========================================

  const handleAddStudent = async (studentData) => {
    try {
      const res = await apiService.createStudent(studentData);
      showToast('success', `Student ${res.data.name} added successfully!`, 'Record Created');
      await fetchStudents();
      await fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Could not save student record.', 'Validation Error');
      throw err;
    }
  };

  const handleUpdateStudent = async (id, studentData) => {
    try {
      const res = await apiService.updateStudent(id, studentData);
      showToast('success', `Student ${res.data.name} updated successfully!`, 'Record Updated');
      await fetchStudents();
      await fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Could not update student record.', 'Update Failed');
      throw err;
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await apiService.deleteStudent(id);
      showToast('success', 'Student record removed from database.', 'Record Deleted');
      await fetchStudents();
      await fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Could not delete student record.', 'Delete Failed');
      throw err;
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await apiService.seedDatabase();
      showToast('success', res.message || 'Sample student records seeded!', 'Database Seeded');
      await fetchStudents();
      await fetchStats();
    } catch (err) {
      showToast(
        'warning',
        'Database seeding requires live MongoDB connection. Fallback mock records are active.',
        'Seeding Notice'
      );
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthStatus={healthStatus}
        isCheckingHealth={isCheckingHealth}
        onRefreshHealth={checkHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            healthStatus={healthStatus}
            students={students}
            onNavigateToStudents={() => setActiveTab('students')}
            onOpenAddModal={() => setActiveTab('students')}
            onNavigateToDiagnostics={() => setActiveTab('diagnostics')}
          />
        )}

        {activeTab === 'students' && (
          <StudentsPage
            students={students}
            isLoading={isLoading}
            error={error}
            onRefresh={() => {
              fetchStudents();
              fetchStats();
              checkHealth();
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
            onNavigateToDiagnostics={() => setActiveTab('diagnostics')}
          />
        )}

        {activeTab === 'diagnostics' && (
          <TroubleshootingPage
            healthStatus={healthStatus}
            onRefreshHealth={checkHealth}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">EduRecord</span>
            <span>—</span>
            <span>Student Records Management System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Target API: <code className="font-mono text-indigo-600">{API_BASE_URL}</code></span>
            <span>•</span>
            <span>Vercel + Render Cloud Architecture</span>
          </div>
        </div>
      </footer>

      {/* Alert Toast Notification */}
      <AlertToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
