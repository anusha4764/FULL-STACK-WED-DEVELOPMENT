const mongoose = require('mongoose');
const Student = require('../models/Student');
const { getConnectionStatus } = require('../config/db');

const isDbReady = () => mongoose.connection.readyState === 1;

const dbUnavailableResponse = (res) => {
  return res.status(503).json({
    success: false,
    message: 'Database unavailable: MongoDB is disconnected. Please check MONGODB_URI and verify database service.',
    database: getConnectionStatus(),
  });
};

/**
 * @route   GET /api/students
 * @desc    Get all students from MongoDB with optional search and filters
 * @access  Public
 */
const getStudents = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const { search, department, year, sort = '-createdAt' } = req.query;
    const query = {};

    // Department filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // Year filter
    if (year && year !== 'All') {
      query.year = year;
    }

    // Search by name, studentId, or email
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { studentId: regex }, { email: regex }];
    }

    const students = await Student.find(query).sort(sort);

    return res.status(200).json({
      success: true,
      count: students.length,
      source: 'mongodb',
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/:id
 * @desc    Get single student by MongoDB _id or studentId
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const { id } = req.params;
    let student = null;

    if (mongoose.isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier "${id}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/students
 * @desc    Create a new student record in MongoDB
 * @access  Public
 */
const createStudent = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const { studentId, name, email, department, year, gpa, status } = req.body;

    if (!studentId || !name || !email || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, name, email, department, and year.',
      });
    }

    const cleanId = studentId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate ID
    const existingId = await Student.findOne({ studentId: cleanId });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: `Student ID "${cleanId}" is already registered.`,
      });
    }

    // Check duplicate Email
    const existingEmail = await Student.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Email "${cleanEmail}" is already registered.`,
      });
    }

    const newStudent = await Student.create({
      studentId: cleanId,
      name: name.trim(),
      email: cleanEmail,
      department: department.trim(),
      year,
      gpa: gpa !== undefined ? Number(gpa) : 3.5,
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Student record created successfully in MongoDB!',
      source: 'mongodb',
      data: newStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student record in MongoDB
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const { id } = req.params;
    const { studentId, name, email, department, year, gpa, status } = req.body;

    let student = null;
    if (mongoose.isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier "${id}" not found.`,
      });
    }

    // Check uniqueness if updating studentId
    if (studentId && studentId.toUpperCase() !== student.studentId) {
      const idTaken = await Student.findOne({ studentId: studentId.toUpperCase() });
      if (idTaken) {
        return res.status(409).json({
          success: false,
          message: `Student ID "${studentId.toUpperCase()}" is already assigned to another student.`,
        });
      }
      student.studentId = studentId.toUpperCase();
    }

    // Check uniqueness if updating email
    if (email && email.toLowerCase() !== student.email) {
      const emailTaken = await Student.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: `Email "${email.toLowerCase()}" is already assigned to another student.`,
        });
      }
      student.email = email.toLowerCase();
    }

    if (name) student.name = name.trim();
    if (department) student.department = department.trim();
    if (year) student.year = year;
    if (gpa !== undefined) student.gpa = Number(gpa);
    if (status) student.status = status;

    const updated = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully!',
      source: 'mongodb',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student record from MongoDB
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const { id } = req.params;
    let student = null;

    if (mongoose.isValidObjectId(id)) {
      student = await Student.findByIdAndDelete(id);
    }
    if (!student) {
      student = await Student.findOneAndDelete({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier "${id}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.studentId}) removed from MongoDB.`,
      source: 'mongodb',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/stats/summary
 * @desc    Get aggregate dashboard statistics directly from MongoDB
 * @access  Public
 */
const getStats = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const students = await Student.find({});
    const totalStudents = students.length;
    const departmentCounts = {};
    const yearCounts = {};
    let totalGpa = 0;
    let activeStudents = 0;

    students.forEach((s) => {
      departmentCounts[s.department] = (departmentCounts[s.department] || 0) + 1;
      yearCounts[s.year] = (yearCounts[s.year] || 0) + 1;
      totalGpa += s.gpa || 0;
      if (s.status === 'Active') activeStudents++;
    });

    const averageGpa = totalStudents > 0 ? (totalGpa / totalStudents).toFixed(2) : '0.00';

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        averageGpa: Number(averageGpa),
        departmentsCount: Object.keys(departmentCounts).length,
        departmentBreakdown: departmentCounts,
        yearBreakdown: yearCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/students/seed
 * @desc    Seed sample student records directly into MongoDB
 * @access  Public
 */
const seedStudents = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      return dbUnavailableResponse(res);
    }

    const initialData = [
      {
        studentId: 'STU-1001',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.edu',
        department: 'Computer Science',
        year: '3rd Year',
        gpa: 3.85,
        status: 'Active',
      },
      {
        studentId: 'STU-1002',
        name: 'Bob Smith',
        email: 'bob.smith@example.edu',
        department: 'Information Technology',
        year: '2nd Year',
        gpa: 3.60,
        status: 'Active',
      },
      {
        studentId: 'STU-1003',
        name: 'Catherine Davis',
        email: 'catherine.d@example.edu',
        department: 'Data Science & AI',
        year: '4th Year',
        gpa: 3.92,
        status: 'Active',
      },
      {
        studentId: 'STU-1004',
        name: 'David Miller',
        email: 'david.miller@example.edu',
        department: 'Mechanical Engineering',
        year: '1st Year',
        gpa: 3.45,
        status: 'Active',
      },
      {
        studentId: 'STU-1005',
        name: 'Emma Wilson',
        email: 'emma.wilson@example.edu',
        department: 'Electronics & Communication',
        year: '3rd Year',
        gpa: 3.78,
        status: 'Active',
      },
      {
        studentId: 'STU-1006',
        name: 'Frank Thomas',
        email: 'frank.thomas@example.edu',
        department: 'Civil Engineering',
        year: '2nd Year',
        gpa: 3.30,
        status: 'Active',
      },
      {
        studentId: 'STU-1007',
        name: 'Grace Lee',
        email: 'grace.lee@example.edu',
        department: 'Business Administration',
        year: '4th Year',
        gpa: 3.95,
        status: 'Active',
      },
    ];

    await Student.deleteMany({});
    const inserted = await Student.insertMany(initialData);

    return res.status(201).json({
      success: true,
      message: `MongoDB successfully seeded with ${inserted.length} real student records!`,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
  seedStudents,
};
