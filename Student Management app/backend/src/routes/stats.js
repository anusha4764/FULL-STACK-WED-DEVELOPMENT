const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const cgpaAgg = await Student.aggregate([
      { $group: { _id: null, avgCgpa: { $avg: '$cgpa' }, totalBacklogs: { $sum: '$activeBacklogs' } } }
    ]);
    const deptAgg = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const yearAgg = await Student.aggregate([
      { $group: { _id: '$yearOfStudy', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        averageCgpa: cgpaAgg[0] ? parseFloat(cgpaAgg[0].avgCgpa.toFixed(2)) : 0,
        totalActiveBacklogs: cgpaAgg[0] ? cgpaAgg[0].totalBacklogs : 0,
        byDepartment: deptAgg.map(d => ({ department: d._id, count: d.count })),
        byYear: yearAgg.map(y => ({ year: y._id, count: y.count })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
