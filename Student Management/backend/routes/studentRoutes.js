const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
  seedStudents,
} = require('../controllers/studentController');

// Aggregate statistics route
router.get('/stats/summary', getStats);

// Database seed utility route
router.post('/seed', seedStudents);

// Main Student CRUD routes
router.route('/')
  .get(getStudents)      // GET /api/students
  .post(createStudent);   // POST /api/students

router.route('/:id')
  .get(getStudentById)   // GET /api/students/:id
  .put(updateStudent)    // PUT /api/students/:id
  .delete(deleteStudent);// DELETE /api/students/:id

module.exports = router;
