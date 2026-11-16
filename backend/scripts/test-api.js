/**
 * Comprehensive API Test Suite for Student Records Management System
 * Uses Node.js native fetch to test all REST endpoints and CORS headers.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS${colors.reset}: ${testName}`);
    passed++;
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset}: ${testName}`);
    if (details) console.log(`    ${colors.yellow}Details: ${details}${colors.reset}`);
    failed++;
  }
};

const runTests = async () => {
  console.log(`\n${colors.bold}${colors.blue}====================================================`);
  console.log(`🧪 Starting API Test Suite against: ${BASE_URL}`);
  console.log(`====================================================${colors.reset}\n`);

  try {
    // 1. Root Endpoint Test
    console.log(`${colors.bold}1. Testing Root Endpoint (GET /)${colors.reset}`);
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'Root status is 200 OK');
    assert(rootData.status === 'online', 'API status reports "online"');
    assert(rootData.endpoints?.getAllStudents !== undefined, 'Endpoints catalog provided in response');

    // 2. Health & Diagnostics Endpoint Test
    console.log(`\n${colors.bold}2. Testing Health Check (GET /api/health)${colors.reset}`);
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint status is 200 OK');
    assert(healthData.database !== undefined, 'Database connectivity status reported');
    assert(healthData.cors?.allowedOrigins?.length > 0, 'CORS allowed origins list is populated');
    console.log(`    ℹ️ Database State: ${healthData.database?.state} (Connected: ${healthData.database?.connected})`);

    // 3. CORS Preflight (OPTIONS) Test
    console.log(`\n${colors.bold}3. Testing CORS Headers & Preflight (OPTIONS /api/students)${colors.reset}`);
    const corsRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://test-student-frontend.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const allowMethods = corsRes.headers.get('access-control-allow-methods');
    assert(
      allowOrigin === 'https://test-student-frontend.vercel.app' || allowOrigin === '*',
      'Access-Control-Allow-Origin header properly returned for Vercel origin',
      `Got: ${allowOrigin}`
    );
    assert(
      allowMethods && allowMethods.includes('POST'),
      'Access-Control-Allow-Methods includes POST',
      `Got: ${allowMethods}`
    );

    // 4. Retrieve All Students (GET /api/students)
    console.log(`\n${colors.bold}4. Testing Get All Students (GET /api/students)${colors.reset}`);
    const getAllRes = await fetch(`${BASE_URL}/api/students`);
    const getAllData = await getAllRes.json();
    assert(getAllRes.status === 200, 'Get all students returns 200 OK');
    assert(Array.isArray(getAllData.data), 'Returns an array of student records');
    assert(getAllData.data.length > 0, `Contains records (Count: ${getAllData.data.length})`);

    // 5. Create New Student (POST /api/students)
    console.log(`\n${colors.bold}5. Testing Create Student (POST /api/students)${colors.reset}`);
    const testStudentId = `TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newStudentPayload = {
      studentId: testStudentId,
      name: 'Automated Test Student',
      email: `autotest.${Date.now()}@university.edu`,
      department: 'Computer Science',
      year: '2nd Year',
      gpa: 3.82,
      status: 'Active',
    };

    const createRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudentPayload),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'POST /api/students returns 201 Created', createData.message);
    assert(createData.data?.studentId === testStudentId, 'Created record has correct studentId');
    const createdId = createData.data?._id || testStudentId;

    // 6. Duplicate Key Validation Test (POST /api/students with same ID)
    console.log(`\n${colors.bold}6. Testing Validation & Duplicate Rejection${colors.reset}`);
    const dupRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudentPayload),
    });
    assert(dupRes.status === 409, 'Duplicate studentId rejected with 409 Conflict');

    // Missing required field test
    const invalidRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete Payload' }),
    });
    assert(invalidRes.status === 400, 'Incomplete payload rejected with 400 Bad Request');

    // 7. Get Student by ID (GET /api/students/:id)
    console.log(`\n${colors.bold}7. Testing Get Student By ID (GET /api/students/:id)${colors.reset}`);
    const getOneRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`);
    const getOneData = await getOneRes.json();
    assert(getOneRes.status === 200, 'Get single student returns 200 OK');
    assert(getOneData.data?.name === 'Automated Test Student', 'Retrieved student name matches');

    // 8. Update Student (PUT /api/students/:id)
    console.log(`\n${colors.bold}8. Testing Update Student (PUT /api/students/:id)${colors.reset}`);
    const updateRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gpa: 3.98,
        year: '3rd Year',
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'PUT /api/students/:id returns 200 OK');
    assert(updateData.data?.gpa === 3.98, 'Student GPA successfully updated to 3.98');
    assert(updateData.data?.year === '3rd Year', 'Student year successfully updated to 3rd Year');

    // 9. Delete Student (DELETE /api/students/:id)
    console.log(`\n${colors.bold}9. Testing Delete Student (DELETE /api/students/:id)${colors.reset}`);
    const deleteRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200, 'DELETE /api/students/:id returns 200 OK');
    assert(deleteData.success === true, 'Response confirms deletion');

    // Confirm student is deleted
    const verifyDeleteRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`);
    assert(verifyDeleteRes.status === 404, 'Deleted student now returns 404 Not Found');

    // 10. Summary Statistics Test (GET /api/students/stats/summary)
    console.log(`\n${colors.bold}10. Testing Dashboard Summary Stats (GET /api/students/stats/summary)${colors.reset}`);
    const statsRes = await fetch(`${BASE_URL}/api/students/stats/summary`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Stats endpoint returns 200 OK');
    assert(statsData.data?.totalStudents !== undefined, 'Stats includes totalStudents count');
    assert(statsData.data?.averageGpa !== undefined, 'Stats includes averageGpa');

    // ==========================================
    // Final Results Summary
    // ==========================================
    console.log(`\n${colors.bold}====================================================`);
    console.log(`📊 Test Results: ${colors.green}${passed} Passed${colors.reset}, ${failed > 0 ? colors.red : colors.green}${failed} Failed${colors.reset}`);
    console.log(`====================================================${colors.reset}\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log(`${colors.green}🎉 ALL ENDPOINTS AND CORS HEADERS VERIFIED SUCCESSFULLY!${colors.reset}\n`);
      process.exit(0);
    }
  } catch (err) {
    console.error(`\n${colors.red}❌ Test Suite encountered connection error:${colors.reset}`, err.message);
    console.error(`👉 Ensure the backend server is running: "node server.js"\n`);
    process.exit(1);
  }
};

runTests();
