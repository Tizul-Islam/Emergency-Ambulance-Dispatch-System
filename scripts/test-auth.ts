/**
 * Test Script to verify authentication and RBAC
 * 
 * Instructions:
 * 1. Ensure your database is running and migrated (`npm run prisma:migrate`)
 * 2. Ensure your database is seeded (`npm run seed`)
 * 3. Start your server (`npm run dev`)
 * 4. Run this script in another terminal: `npx ts-node scripts/test-auth.ts`
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function fetchApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Auth & RBAC Test Script ---');

  // 1. Unauthenticated Request
  console.log('\n[Test 1] Unauthenticated request to /users/me...');
  const test1 = await fetchApi('/users/me');
  if (test1.status === 401) {
    console.log('✅ Passed: Got 401 Unauthorized');
  } else {
    console.error('❌ Failed:', test1);
  }

  // 2. Login as CALLER
  console.log('\n[Test 2] Logging in as Caller...');
  const callerLogin = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'caller1@dispatch.com', password: 'hashed_password_placeholder' }),
  });
  const callerToken = callerLogin.data.data?.accessToken;
  if (callerToken) {
    console.log('✅ Passed: Caller logged in successfully');
  } else {
    console.error('❌ Failed to login caller:', callerLogin);
    return;
  }

  // 3. CALLER accesses /users/me
  console.log('\n[Test 3] Caller accessing /users/me...');
  const test3 = await fetchApi('/users/me', {
    headers: { Authorization: `Bearer ${callerToken}` },
  });
  if (test3.status === 200 && test3.data.data.role === 'CALLER') {
    console.log('✅ Passed: Caller got profile');
  } else {
    console.error('❌ Failed:', test3);
  }

  // 4. CALLER accesses /users/admin-only (Expect 403)
  console.log('\n[Test 4] Caller accessing /users/admin-only (Expect 403)...');
  const test4 = await fetchApi('/users/admin-only', {
    headers: { Authorization: `Bearer ${callerToken}` },
  });
  if (test4.status === 403) {
    console.log('✅ Passed: Caller forbidden from admin route');
  } else {
    console.error('❌ Failed:', test4);
  }

  // 5. Login as ADMIN
  console.log('\n[Test 5] Logging in as Admin...');
  const adminLogin = await fetchAuth('/auth/login', { email: 'admin@dispatch.com', password: 'hashed_password_placeholder' });
  const adminToken = adminLogin.data?.accessToken;
  if (adminToken) {
    console.log('✅ Passed: Admin logged in successfully');
  } else {
    console.error('❌ Failed to login admin:', adminLogin);
    return;
  }

  // 6. ADMIN accesses /users/admin-only (Expect 200)
  console.log('\n[Test 6] Admin accessing /users/admin-only...');
  const test6 = await fetchApi('/users/admin-only', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (test6.status === 200) {
    console.log('✅ Passed: Admin successfully accessed admin route');
  } else {
    console.error('❌ Failed:', test6);
  }

  console.log('\nAll tests executed.');
}

async function fetchAuth(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

runTests();
