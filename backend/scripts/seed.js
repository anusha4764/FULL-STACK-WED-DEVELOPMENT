require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const sampleStudents = [
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

const seedDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Error: MONGODB_URI environment variable is not defined.');
    console.log('👉 Please set MONGODB_URI in your .env file before running seed.');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas.');

    console.log('🧹 Clearing existing student records...');
    await Student.deleteMany({});

    console.log(`🌱 Inserting ${sampleStudents.length} sample student records...`);
    const result = await Student.insertMany(sampleStudents);

    console.log('🎉 Successfully seeded records:');
    result.forEach((s) => {
      console.log(`   - [${s.studentId}] ${s.name} (${s.department}, ${s.year}) - GPA: ${s.gpa}`);
    });

    console.log('\n✅ Database seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
