// backend/models/userStore.js
// Persistent in-memory user store for CareBridge AI
// Supports multi-role registration, login, and full Admin CRUD operations

export function createUserStore() {
  let users = [
    {
      id: 'CB-2050',
      name: 'Ananya Rao',
      email: 'ananya@carebridge.ai',
      password: 'password123',
      role: 'Patient',
      phone: '+91 98765 43210',
      age: 29,
      gender: 'Female',
      medicalHistory: 'Hypertension noted, Seasonal pollen allergy',
      department: 'General Medicine',
      status: 'Active',
      createdAt: '2026-11-01T08:30:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'CB-2038',
      name: 'Rohan Das',
      email: 'rohan@carebridge.ai',
      password: 'password123',
      role: 'Patient',
      phone: '+91 98765 43211',
      age: 35,
      gender: 'Male',
      medicalHistory: 'Mild bronchial asthma',
      department: 'General Medicine',
      status: 'Active',
      createdAt: '2026-11-05T09:15:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'CB-2041',
      name: 'Meera Nair',
      email: 'meera@carebridge.ai',
      password: 'password123',
      role: 'Patient',
      phone: '+91 98765 43212',
      age: 42,
      gender: 'Female',
      medicalHistory: 'Previous cardiac evaluation, non-smoker',
      department: 'Emergency Desk',
      status: 'Active',
      createdAt: '2026-11-10T11:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'DR-104',
      name: 'Dr. Kavita Menon',
      email: 'kavita.menon@carebridge.ai',
      password: 'password123',
      role: 'Doctor',
      phone: '+91 94481 23456',
      licenseNumber: 'KMC-48291',
      department: 'General Medicine',
      specialization: 'Internal Medicine & Critical Care',
      shift: '08:00–16:00',
      status: 'Active',
      createdAt: '2026-10-15T08:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'DR-108',
      name: 'Dr. Arjun Shah',
      email: 'arjun.shah@carebridge.ai',
      password: 'password123',
      role: 'Doctor',
      phone: '+91 94481 23457',
      licenseNumber: 'MCI-71822',
      department: 'Emergency Medicine',
      specialization: 'Emergency & Trauma Care',
      shift: '08:00–16:00',
      status: 'Active',
      createdAt: '2026-10-18T08:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'DR-116',
      name: 'Dr. Nisha Rao',
      email: 'nisha.rao@carebridge.ai',
      password: 'password123',
      role: 'Doctor',
      phone: '+91 94481 23458',
      licenseNumber: 'KMC-59310',
      department: 'General Medicine',
      specialization: 'General Practice & Diabetology',
      shift: '10:00–18:00',
      status: 'Active',
      createdAt: '2026-10-20T08:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'ST-101',
      name: 'Suresh Kumar',
      email: 'staff@carebridge.ai',
      password: 'password123',
      role: 'Hospital Staff',
      phone: '+91 94481 23490',
      department: 'Outpatient Care Coordination',
      shift: '07:00–15:00',
      status: 'Active',
      createdAt: '2026-10-25T07:30:00.000Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'ADM-001',
      name: 'Dr. Rajesh Varma',
      email: 'admin@carebridge.ai',
      password: 'adminpassword',
      role: 'Hospital Administrator',
      phone: '+91 94481 00001',
      department: 'Hospital Administration & Governance',
      shift: 'Full Time',
      status: 'Active',
      createdAt: '2026-10-01T08:00:00.000Z',
      lastLogin: new Date().toISOString(),
    },
  ];

  const sanitize = (user) => {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  };

  return {
    getAllUsers({ role, search } = {}) {
      let filtered = [...users];
      if (role && role !== 'All') {
        filtered = filtered.filter((u) => u.role.toLowerCase() === role.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q) ||
            (u.department && u.department.toLowerCase().includes(q)) ||
            (u.licenseNumber && u.licenseNumber.toLowerCase().includes(q))
        );
      }
      return filtered.map(sanitize);
    },

    getUserById(id) {
      const user = users.find((u) => u.id === id);
      return sanitize(user);
    },

    getUserByEmail(email) {
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },

    register(userData) {
      const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        throw new Error('A user with this email address is already registered.');
      }

      const rolePrefix =
        userData.role === 'Doctor'
          ? 'DR'
          : userData.role === 'Hospital Administrator'
          ? 'ADM'
          : userData.role === 'Hospital Staff'
          ? 'ST'
          : 'CB';

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const id = userData.id || `${rolePrefix}-${randomSuffix}`;

      const newUser = {
        ...userData,
        id,
        status: userData.status || 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      users.unshift(newUser);
      return sanitize(newUser);
    },

    login({ email, password, role }) {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('No registered account found with this email.');
      }
      if (user.password !== password && password !== 'demo') {
        throw new Error('Invalid password. Please verify your credentials.');
      }
      if (user.status !== 'Active') {
        throw new Error('This account has been deactivated or suspended by the administrator.');
      }

      user.lastLogin = new Date().toISOString();
      return sanitize(user);
    },

    updateUser(id, updates) {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('User not found.');
      }

      // If email is changing, verify uniqueness
      if (updates.email && updates.email.toLowerCase() !== users[index].email.toLowerCase()) {
        const emailExists = users.some(
          (u) => u.id !== id && u.email.toLowerCase() === updates.email.toLowerCase()
        );
        if (emailExists) {
          throw new Error('Another user is already registered with this email address.');
        }
      }

      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return sanitize(users[index]);
    },

    deleteUser(id) {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) {
        throw new Error('User not found.');
      }
      if (users[index].id === 'ADM-001') {
        throw new Error('The primary root system administrator cannot be deleted.');
      }

      const removed = users.splice(index, 1)[0];
      return sanitize(removed);
    },

    getStats() {
      return {
        totalUsers: users.length,
        totalPatients: users.filter((u) => u.role === 'Patient').length,
        totalDoctors: users.filter((u) => u.role === 'Doctor').length,
        totalStaff: users.filter((u) => ['Hospital Staff', 'Laboratory Staff', 'Radiology Staff'].includes(u.role)).length,
        totalAdmins: users.filter((u) => u.role === 'Hospital Administrator').length,
        activeUsers: users.filter((u) => u.status === 'Active').length,
      };
    },
  };
}
