/**
 * Centralized API Service for Student Management System
 * 
 * Handles all HTTP requests between the Vercel React frontend
 * and the Render Express backend.
 */

// Resolves base API URL from environment variable, stripping trailing slashes
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Default fallback for local development
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Enhanced fetch wrapper with timeout, JSON parsing, and diagnostic error classification
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    let data;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Detect typical Network / CORS failures
    const isNetworkError =
      error.name === 'TypeError' && error.message.toLowerCase().includes('fetch');

    if (isNetworkError) {
      console.error(`[API Network/CORS Error] Failed to connect to ${url}`);
      const enrichedError = new Error(
        'Unable to reach the backend server. Possible causes: (1) Render server is waking up from sleep (can take 50s), (2) CORS policy blocked the request from this domain, or (3) Backend URL is misconfigured.'
      );
      enrichedError.isNetworkError = true;
      enrichedError.originalError = error;
      enrichedError.endpoint = url;
      throw enrichedError;
    }

    throw error;
  }
};

// ==========================================
// API Operations
// ==========================================

export const apiService = {
  /**
   * Health check to test backend connectivity and MongoDB Atlas status
   */
  async checkHealth() {
    return request('/health');
  },

  /**
   * Retrieve all students with optional search & filter parameters
   */
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.year && params.year !== 'All') query.append('year', params.year);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/students${queryString}`);
  },

  /**
   * Retrieve a single student by Mongo ID or Student ID
   */
  async getStudentById(id) {
    return request(`/students/${id}`);
  },

  /**
   * Create a new student record
   */
  async createStudent(studentData) {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  /**
   * Update an existing student record
   */
  async updateStudent(id, studentData) {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  /**
   * Delete a student record
   */
  async deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Fetch aggregate statistics for the dashboard
   */
  async getStats() {
    return request('/students/stats/summary');
  },

  /**
   * Seed sample data into the database
   */
  async seedDatabase() {
    return request('/students/seed', {
      method: 'POST',
    });
  },
};

export default apiService;
