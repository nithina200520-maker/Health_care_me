import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Edit2, Trash2, CheckCircle2, XCircle,
  Shield, User, Stethoscope, AlertTriangle, RefreshCw, X, Plus, Filter,
  Phone, Mail, Calendar, Building, Clock
} from 'lucide-react';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, getAdminStats } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminUserManagement() {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalStaff: 0,
    totalAdmins: 0,
    activeUsers: 0,
  });
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const initialForm = {
    name: '',
    email: '',
    password: 'password123',
    role: 'Patient',
    phone: '',
    department: 'General Medicine',
    licenseNumber: '',
    specialization: '',
    shift: '08:00–16:00',
    age: '',
    gender: 'Female',
    medicalHistory: '',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({ role: roleFilter, search });
      setUsers(data.users || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load registered persons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Patient',
      phone: user.phone || '',
      department: user.department || 'General Medicine',
      licenseNumber: user.licenseNumber || '',
      specialization: user.specialization || '',
      shift: user.shift || '08:00–16:00',
      age: user.age || '',
      gender: user.gender || 'Female',
      medicalHistory: user.medicalHistory || '',
      status: user.status || 'Active',
    });
    setError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createAdminUser(formData);
      setSuccessMessage(`Person "${formData.name}" registered successfully.`);
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to register person.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true);
    setError(null);
    try {
      await updateAdminUser(selectedUser.id, formData);
      setSuccessMessage(`User "${formData.name}" updated successfully.`);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    setError(null);
    try {
      await deleteAdminUser(selectedUser.id);
      setSuccessMessage(`User "${selectedUser.name}" was permanently removed.`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto clear success message after 4s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {/* Admin Title & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0a1b33] via-[#0d2345] to-[#081528] border border-cyan-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hospital Master Administrator Control Panel
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Full administrative governance with CRUD power across all registered Patients, Doctors, and Hospital Personnel.
            Manage access credentials, department assignments, account statuses, and system directories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/60 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Person</span>
        </button>
      </div>

      {/* Live System Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers || users.length}</p>
          <p className="text-[10px] text-cyan-400 mt-0.5">All Registered</p>
        </div>
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Patients</p>
          <p className="text-2xl font-bold text-cyan-300 mt-1">{stats.totalPatients || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Registered Patients</p>
        </div>
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Doctors</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.totalDoctors || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Licensed Clinicians</p>
        </div>
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Hospital Staff</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{stats.totalStaff || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Care Coordinators</p>
        </div>
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Active Accounts</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{stats.activeUsers || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">In Good Standing</p>
        </div>
        <div className="p-4 rounded-xl bg-[#09182d] border border-cyan-900/30">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Admin Accounts</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">{stats.totalAdmins || 1}</p>
          <p className="text-[10px] text-indigo-400 mt-0.5">Master Overseers</p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Controls Bar */}
      <div className="p-4 rounded-xl bg-[#08172c] border border-cyan-900/40 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or license..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0b1d36] border border-cyan-900/50 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-[#0b1d36] border border-cyan-900/50 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Roles ({stats.totalUsers || users.length})</option>
              <option value="Patient">Patients ({stats.totalPatients || 0})</option>
              <option value="Doctor">Doctors ({stats.totalDoctors || 0})</option>
              <option value="Hospital Staff">Hospital Staff</option>
              <option value="Hospital Administrator">Administrators</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh directory"
            className="p-2 rounded-lg bg-[#0b1d36] hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-cyan-900/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Registered Persons Table */}
      <div className="rounded-xl border border-cyan-900/40 bg-[#071324] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1b33] text-slate-300 text-[11px] uppercase tracking-wider border-b border-cyan-900/50">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Demographics / Shift</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">CRUD Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/60 font-sans">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No registered persons found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isPatient = u.role === 'Patient';
                  const isDoctor = u.role === 'Doctor';
                  const isAdmin = u.role === 'Hospital Administrator';

                  return (
                    <tr key={u.id} className="hover:bg-cyan-950/20 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDoctor
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                                : isAdmin
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-600/50'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-600/50'
                            }`}
                          >
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{u.name}</p>
                            <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            isDoctor
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                              : isAdmin
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                              : isPatient
                              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                          }`}
                        >
                          {u.role}
                        </span>
                        <p className="text-slate-300 text-[11px]">{u.department || 'General'}</p>
                        {u.licenseNumber && (
                          <p className="text-[10px] text-slate-400 font-mono">Lic: {u.licenseNumber}</p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-cyan-500/80" />
                          <span>{u.email}</span>
                        </p>
                        {u.phone && (
                          <p className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{u.phone}</span>
                          </p>
                        )}
                      </td>

                      {/* Demographics / Shift */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        {isPatient ? (
                          <div>
                            <p>
                              {u.age ? `${u.age} yrs` : 'Age N/A'} • {u.gender || 'N/A'}
                            </p>
                            {u.medicalHistory && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5" title={u.medicalHistory}>
                                {u.medicalHistory}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{u.shift || 'Standard Shift'}</span>
                            </p>
                            {u.specialization && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{u.specialization}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === 'Active'
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/50'
                              : 'bg-rose-950/90 text-rose-300 border border-rose-600/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{u.status || 'Active'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit person details"
                            className="p-1.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-700/60 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {u.id !== 'ADM-001' && (
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(u)}
                              title="Delete person from system"
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#071324] border border-cyan-500/40 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register New Person (Admin Control)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              {/* Role selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Hospital Staff">Hospital Staff</option>
                  <option value="Hospital Administrator">Hospital Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh or Ananya"
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@carebridge.ai"
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                    <option value="Hospital Administration">Hospital Administration</option>
                  </select>
                </div>
              </div>

              {/* Conditional Doctor Fields */}
              {formData.role === 'Doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                      License / MCI Registration No *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="e.g. KMC-49201"
                      className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-emerald-700/50 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-300 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Internal Medicine"
                      className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-emerald-700/50 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Patient Fields */}
              {formData.role === 'Patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                  <div>
                    <label className="block text-[11px] font-semibold text-cyan-300 mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 32"
                      className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-700/50 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-cyan-300 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-700/50 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {isLoading ? 'Registering...' : 'Create Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#071324] border border-cyan-500/40 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Edit Registered Person ({selectedUser.id})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Hospital Staff">Hospital Staff</option>
                    <option value="Hospital Administrator">Hospital Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {formData.role === 'Doctor' ? 'Medical License No' : 'Demographics / Notes'}
                  </label>
                  <input
                    type="text"
                    value={formData.role === 'Doctor' ? formData.licenseNumber : formData.medicalHistory}
                    onChange={(e) =>
                      formData.role === 'Doctor'
                        ? setFormData({ ...formData, licenseNumber: e.target.value })
                        : setFormData({ ...formData, medicalHistory: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg bg-[#0a1b32] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#071324] border border-rose-500/50 p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Person Removal</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{selectedUser.name}"</strong> ({selectedUser.id} • {selectedUser.role})
              from the hospital system? This action removes all records and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleDeleteSubmit}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {isLoading ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
