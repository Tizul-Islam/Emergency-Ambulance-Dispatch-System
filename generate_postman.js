const fs = require('fs');

/**
 * Build a Postman request aligned with current API routes + Zod schemas.
 */
const createRequest = (name, method, urlPath, bodyObj = null, desc = '') => {
  const [pathOnly, queryString] = urlPath.split('?');
  const pathSegments = pathOnly.split('/').filter(Boolean);

  const url = {
    raw: `{{baseUrl}}/${urlPath}`,
    host: ['{{baseUrl}}'],
    path: pathSegments.map((p) => (p.startsWith(':') ? `:${p.slice(1)}` : p)),
  };

  if (queryString) {
    url.query = queryString.split('&').map((pair) => {
      const [key, value] = pair.split('=');
      return { key, value: value ?? '' };
    });
  }

  if (pathSegments.some((p) => p.startsWith(':'))) {
    url.variable = pathSegments
      .filter((p) => p.startsWith(':'))
      .map((p) => ({ key: p.slice(1), value: `{{${p.slice(1)}}}` }));
  }

  const req = {
    name,
    request: {
      method,
      header: [
        { key: 'Authorization', value: 'Bearer {{accessToken}}' },
        { key: 'Content-Type', value: 'application/json' },
      ],
      url,
    },
  };

  if (bodyObj !== null && bodyObj !== undefined) {
    req.request.body = {
      mode: 'raw',
      raw: JSON.stringify(bodyObj, null, 2),
    };
  }

  if (desc) {
    req.request.description = desc;
  }

  return req;
};

const collection = {
  info: {
    name: 'Emergency Ambulance Dispatch System',
    description:
      'API collection aligned with current schema.\n\nRoles: PATIENT | DISPATCHER | ADMIN\n\nSeed logins (password: Password123!):\n- admin@dispatch.com\n- dispatcher1@dispatch.com\n- patient1@dispatch.com\n\nFlow: Auth → create request (PATIENT) → queue/assign (DISPATCHER) → status transitions → select hospital → complete → payment.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000/api/v1', type: 'string' },
    { key: 'accessToken', value: '', type: 'string' },
    { key: 'refreshToken', value: '', type: 'string' },
    { key: 'requestId', value: '', type: 'string' },
    { key: 'ambulanceId', value: '', type: 'string' },
    { key: 'dispatchId', value: '', type: 'string' },
    { key: 'hospitalId', value: '', type: 'string' },
    { key: 'driverId', value: '', type: 'string' },
    { key: 'tripId', value: '', type: 'string' },
    { key: 'paymentId', value: '', type: 'string' },
    { key: 'notificationId', value: '', type: 'string' },
    { key: 'userId', value: '', type: 'string' },
  ],
  item: [
    {
      name: 'Health',
      item: [createRequest('Health Check', 'GET', 'health')],
    },
    {
      name: 'Auth',
      description:
        'Public register always creates PATIENT. Promote roles via Admin → Change Role. Login test script saves tokens to collection variables.',
      item: [
        createRequest(
          'Register (Patient)',
          'POST',
          'auth/register',
          {
            name: 'Patient User',
            email: 'patient@example.com',
            password: 'Password123!',
            phone: '01712345678',
          },
          'role is ignored/forced to PATIENT on server',
        ),
        createRequest('Login (Admin)', 'POST', 'auth/login', {
          email: 'admin@dispatch.com',
          password: 'Password123!',
        }),
        createRequest('Login (Dispatcher)', 'POST', 'auth/login', {
          email: 'dispatcher1@dispatch.com',
          password: 'Password123!',
        }),
        createRequest('Login (Patient)', 'POST', 'auth/login', {
          email: 'patient1@dispatch.com',
          password: 'Password123!',
        }),
        createRequest('Refresh Token', 'POST', 'auth/refresh-token', {
          refreshToken: '{{refreshToken}}',
        }),
        createRequest('Logout', 'POST', 'auth/logout', {
          refreshToken: '{{refreshToken}}',
        }),
        createRequest(
          'Login - FAILURE (Invalid Password)',
          'POST',
          'auth/login',
          { email: 'admin@dispatch.com', password: 'WrongPassword!' },
          'Expect 401 Invalid email or password',
        ),
        createRequest(
          'Register - FAILURE (Validation)',
          'POST',
          'auth/register',
          {
            name: 'A',
            email: 'not-an-email',
            password: '123',
            phone: '1',
          },
          'Expect 400 Validation failed with field errors',
        ),
      ],
    },
    {
      name: 'Users',
      item: [
        createRequest('Get Me', 'GET', 'users/me'),
        createRequest('Update Me', 'PATCH', 'users/me', {
          name: 'Updated Name',
          phone: '01799998888',
        }),
        createRequest(
          'Admin/Dispatcher Only Probe',
          'GET',
          'users/admin-only',
          null,
          '403 for PATIENT',
        ),
      ],
    },
    {
      name: 'Ambulances',
      description: 'Admin create/update/delete. Dispatcher can list + nearest.',
      item: [
        createRequest(
          'Create Ambulance',
          'POST',
          'ambulances',
          {
            registrationNumber: 'DHA-AMB-1001',
            type: 'ICU',
            capacity: 2,
            locationLat: 23.8103,
            locationLng: 90.4125,
            driverId: '{{driverId}}',
          },
          'type: BASIC | ICU | CARDIAC',
        ),
        createRequest(
          'Get Ambulances (AVAILABLE)',
          'GET',
          'ambulances/available',
        ),
        createRequest('Search Ambulances', 'GET', 'ambulances/search?q=DHA'),
        createRequest('Get Ambulance by ID', 'GET', 'ambulances/:ambulanceId'),
        createRequest('Get Nearest Ambulance', 'GET', 'ambulances/nearest?lat=23.81&lng=90.41'),
        createRequest('Update Ambulance', 'PATCH', 'ambulances/:ambulanceId', {
          status: 'MAINTENANCE',
          locationLat: 23.82,
          locationLng: 90.42,
        }),
        createRequest(
          'Soft Delete Ambulance',
          'DELETE',
          'ambulances/:ambulanceId',
          null,
          'Sets deletedAt — row is not hard-deleted',
        ),
      ],
    },
    {
      name: 'Drivers',
      item: [
        createRequest('Create Driver', 'POST', 'drivers', {
          name: 'Driver Rahim',
          phone: '01612345678',
          licenseNumber: 'LIC-5001',
          userId: '{{userId}}',
        }),
        createRequest('Get Drivers', 'GET', 'drivers?status=AVAILABLE&page=1&limit=10'),
        createRequest('Update Driver Status', 'PATCH', 'drivers/:driverId/status', {
          status: 'AVAILABLE',
        }),
        createRequest('Update Driver', 'PATCH', 'drivers/:driverId', {
          phone: '01687654321',
        }),
        createRequest('Soft Delete Driver', 'DELETE', 'drivers/:driverId', null, 'Sets deletedAt'),
      ],
    },
    {
      name: 'Hospitals',
      item: [
        createRequest('Create Hospital', 'POST', 'hospitals', {
          name: 'Central Hospital',
          address: '1 Main Road, Dhaka',
          phone: '01912345678',
          latitude: 23.75,
          longitude: 90.38,
          emergencyAvailable: true,
        }),
        createRequest('Get Hospitals', 'GET', 'hospitals?page=1&limit=10'),
        createRequest('Search Hospitals', 'GET', 'hospitals/search?q=Central'),
        createRequest('Get Hospital by ID', 'GET', 'hospitals/:hospitalId'),
        createRequest(
          'Update Hospital Availability',
          'PATCH',
          'hospitals/:hospitalId/availability',
          {
            emergencyAvailable: true,
          },
        ),
        createRequest('Update Hospital', 'PATCH', 'hospitals/:hospitalId', {
          name: 'Central Hospital Updated',
          phone: '01987654321',
        }),
        createRequest('Soft Delete Hospital', 'DELETE', 'hospitals/:hospitalId'),
        createRequest(
          'Update Hospital - FAILURE (Invalid UUID)',
          'PATCH',
          'hospitals/not-a-uuid',
          { name: 'X' },
          'Expect 400 Validation failed',
        ),
      ],
    },
    {
      name: 'Requests',
      description: 'PATIENT creates/cancels. DISPATCHER/ADMIN list + queue + assign.',
      item: [
        createRequest(
          'Create Emergency Request',
          'POST',
          'requests',
          {
            description: 'Chest pain, needs urgent care',
            pickupAddress: 'Gulshan 2, Dhaka',
            pickupLat: 23.7925,
            pickupLng: 90.4078,
            priority: 'CRITICAL',
          },
          'priority: CRITICAL | HIGH | MEDIUM | LOW',
        ),
        createRequest('Get My Requests', 'GET', 'requests/my?page=1&limit=10'),
        createRequest('Get All Requests', 'GET', 'requests?page=1&limit=10'),
        createRequest('Search Requests', 'GET', 'requests/search?q=pain'),
        createRequest(
          'Get Queue (Priority Ordered)',
          'GET',
          'requests/queue',
          null,
          'PENDING/DISPATCHING ordered CRITICAL→LOW, then oldest first',
        ),
        createRequest('Get Request by ID', 'GET', 'requests/:requestId'),
        createRequest(
          'Assign (Auto Nearest Ambulance)',
          'POST',
          'requests/:requestId/assign',
          {},
          'Omit ambulanceId → nearest AVAILABLE ambulance selected inside transaction',
        ),
        createRequest(
          'Assign (Specific Ambulance)',
          'POST',
          'requests/:requestId/assign',
          { ambulanceId: '{{ambulanceId}}' },
          'Race-safe: second concurrent assign gets 409',
        ),
        createRequest(
          'Assign - FAILURE (Double Assignment)',
          'POST',
          'requests/:requestId/assign',
          { ambulanceId: '{{ambulanceId}}' },
          'Expect 409 if ambulance/request already has active dispatch',
        ),
        createRequest('Cancel Request', 'PATCH', 'requests/:requestId/cancel'),
        createRequest(
          'Cancel - FAILURE (Not Pending)',
          'PATCH',
          'requests/:requestId/cancel',
          null,
          'Fails if already ASSIGNED or beyond',
        ),
      ],
    },
    {
      name: 'Dispatch',
      description:
        'Status machine: PENDING -> DISPATCHING -> ASSIGNED -> EN_ROUTE -> PICKED_UP -> HOSPITAL_SELECTED -> ARRIVED -> COMPLETED. HOSPITAL_SELECTED only via select-hospital.',
      item: [
        createRequest('Get My Assigned Dispatches', 'GET', 'dispatches/my-assigned'),
        createRequest('Search Dispatches', 'GET', 'dispatches/search?q=AMB'),
        createRequest('Get Dispatch by ID', 'GET', 'dispatches/:dispatchId'),
        createRequest('Update Status to EN_ROUTE', 'PATCH', 'dispatches/:dispatchId/status', {
          status: 'EN_ROUTE',
        }),
        createRequest('Update Status to PICKED_UP', 'PATCH', 'dispatches/:dispatchId/status', {
          status: 'PICKED_UP',
        }),
        createRequest(
          'Select Hospital (HOSPITAL_SELECTED)',
          'POST',
          'dispatches/:dispatchId/select-hospital',
          { hospitalId: '{{hospitalId}}' },
          'Allowed only from PICKED_UP',
        ),
        createRequest('Update Status to ARRIVED', 'PATCH', 'dispatches/:dispatchId/status', {
          status: 'ARRIVED',
        }),
        createRequest('Update Status to COMPLETED', 'PATCH', 'dispatches/:dispatchId/status', {
          status: 'COMPLETED',
        }),
        createRequest(
          'Update Status - FAILURE (Invalid Transition)',
          'PATCH',
          'dispatches/:dispatchId/status',
          { status: 'COMPLETED' },
          'Expect 400 if jumping e.g. ASSIGNED → COMPLETED',
        ),
      ],
    },
    {
      name: 'Trips',
      item: [
        createRequest('Get Trips', 'GET', 'trips?page=1&limit=10'),
        createRequest('Get Trip by ID', 'GET', 'trips/:tripId'),
      ],
    },
    {
      name: 'Payments',
      item: [
        createRequest('Initiate Payment', 'POST', 'payments/initiate', {
          tripId: '{{tripId}}',
        }),
        createRequest('Get Payment by ID', 'GET', 'payments/:paymentId'),
      ],
    },
    {
      name: 'Notifications',
      item: [
        createRequest('Get My Notifications', 'GET', 'notifications/my?page=1&limit=10'),
        createRequest('Mark Notification Read', 'PATCH', 'notifications/:notificationId/read'),
      ],
    },
    {
      name: 'Admin',
      description: 'ADMIN only.',
      item: [
        createRequest('Dashboard Stats', 'GET', 'admin/dashboard-stats'),
        createRequest('Get Users', 'GET', 'admin/users?page=1&limit=10'),
        createRequest('Search Users', 'GET', 'admin/users/search?q=test'),
        createRequest('Get Users by Role', 'GET', 'admin/users?role=PATIENT&page=1&limit=10'),
        createRequest('Change User Role', 'PATCH', 'admin/users/:userId/role', {
          role: 'DISPATCHER',
        }),
        createRequest('Audit Logs', 'GET', 'admin/audit-logs?page=1&limit=10'),
        createRequest(
          'Incident History',
          'GET',
          'admin/incident-history?page=1&limit=10&priority=CRITICAL',
        ),
        createRequest(
          'Dashboard - FAILURE (Unauthorized)',
          'GET',
          'admin/dashboard-stats',
          null,
          'Login as PATIENT first — expect 403',
        ),
      ],
    },
  ],
};

const saveTokensScript = [
  'const response = pm.response.json();',
  'if (response.data && response.data.accessToken) {',
  "  pm.collectionVariables.set('accessToken', response.data.accessToken);",
  "  pm.collectionVariables.set('refreshToken', response.data.refreshToken);",
  '  if (response.data.user && response.data.user.id) {',
  "    pm.collectionVariables.set('userId', response.data.user.id);",
  '  }',
  '}',
];

const saveRequestIdScript = [
  'const response = pm.response.json();',
  'if (response.data && response.data.id) {',
  "  pm.collectionVariables.set('requestId', response.data.id);",
  '}',
];

const saveDispatchIdScript = [
  'const response = pm.response.json();',
  'if (response.data && response.data.id) {',
  "  pm.collectionVariables.set('dispatchId', response.data.id);",
  '  if (response.data.trips && response.data.trips[0]) {',
  "    pm.collectionVariables.set('tripId', response.data.trips[0].id);",
  '  }',
  '  if (response.data.ambulanceId) {',
  "    pm.collectionVariables.set('ambulanceId', response.data.ambulanceId);",
  '  }',
  '}',
];

const saveHospitalIdScript = [
  'const response = pm.response.json();',
  'if (response.data && response.data.id) {',
  "  pm.collectionVariables.set('hospitalId', response.data.id);",
  '}',
];

const saveDriverIdScript = [
  'const response = pm.response.json();',
  'if (response.data && response.data.id) {',
  "  pm.collectionVariables.set('driverId', response.data.id);",
  '}',
];

const attachTest = (folderName, requestName, execLines) => {
  const folder = collection.item.find((f) => f.name === folderName);
  if (!folder) return;
  const item = folder.item.find((r) => r.name === requestName);
  if (!item) return;
  item.event = [
    {
      listen: 'test',
      script: { exec: execLines, type: 'text/javascript' },
    },
  ];
};

['Login (Admin)', 'Login (Dispatcher)', 'Login (Patient)', 'Refresh Token'].forEach((name) =>
  attachTest('Auth', name, saveTokensScript),
);
attachTest('Requests', 'Create Emergency Request', saveRequestIdScript);
attachTest('Requests', 'Assign (Auto Nearest Ambulance)', saveDispatchIdScript);
attachTest('Requests', 'Assign (Specific Ambulance)', saveDispatchIdScript);
attachTest('Hospitals', 'Create Hospital', saveHospitalIdScript);
attachTest('Drivers', 'Create Driver', saveDriverIdScript);

fs.writeFileSync('Postman_Collection.json', JSON.stringify(collection, null, 2));
console.log('Postman_Collection.json regenerated successfully.');
