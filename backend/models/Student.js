const mongoose = require('mongoose');

/**
 * Student Schema definition
 * Represents student records in MongoDB Atlas.
 */
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required (e.g. STU-1001)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: [
          'Computer Science',
          'Information Technology',
          'Electronics & Communication',
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
          'Data Science & AI',
          'Business Administration'
        ],
        message: '{VALUE} is not a recognized department',
      },
    },
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      enum: {
        values: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        message: '{VALUE} must be 1st Year, 2nd Year, 3rd Year, or 4th Year',
      },
    },
    gpa: {
      type: Number,
      min: [0.0, 'GPA cannot be less than 0.0'],
      max: [4.0, 'GPA cannot be greater than 4.0'],
      default: 3.5,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Graduated'],
      default: 'Active',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for high performance text search and department filtering
studentSchema.index({ name: 'text', department: 1 });

module.exports = mongoose.model('Student', studentSchema);
