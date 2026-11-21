import React, { useState } from 'react';
import {
  User, Stethoscope, Shield, Lock, Mail, Phone, ArrowRight,
  CheckCircle2, AlertTriangle, Eye, EyeOff, Sparkles, X, HeartPulse
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'Patient',
  onAuthSuccess,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialRole); // 'Patient' | 'Doctor' | 'Hospital Administrator'
  const [isRegister, setIsRegister] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'Female',
    medicalHistory: '',
    department: 'General Medicine',
    licenseNumber: '',
    specialization: '',
    shift: '08:00–16:00',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === 'age') {
      // Prevent negative signs, decimals, or non-digit characters
      sanitizedValue = sanitizedValue.replace(/[^0-9]/g, '');
      if (sanitizedValue !== '') {
        const num = parseInt(sanitizedValue, 10);
        if (num > 125) sanitizedValue = '125';
        else sanitizedValue = String(num);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    setError(null);
  };

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError(null);
    setSuccess(null);
    if (role === 'Hospital Administrator') {
      setIsRegister(false); // Admin is primarily login
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRegister) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (activeTab === 'Doctor' && !formData.licenseNumber.trim()) {
          throw new Error('Medical License or Registration Number is required for doctors.');
        }
        if (activeTab === 'Patient' && formData.age) {
          const numAge = Number(formData.age);
          if (isNaN(numAge) || numAge <= 0 || numAge > 125) {
            throw new Error('Age must be a valid positive number between 1 and 125.');
          }
        }

        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: activeTab,
          phone: formData.phone.trim(),
          department: formData.department,
          age: formData.age ? Number(formData.age) : undefined,
          gender: formData.gender,
          medicalHistory: formData.medicalHistory.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          specialization: formData.specialization.trim(),
          shift: formData.shift,
        };

        const res = await registerUser(payload);
        setSuccess(`Registration successful! Welcome to CareBridge, ${res.user.name}.`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        }, 800);
      } else {
        // Login
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please enter both email and password.');
        }

        const res = await loginUser({
          email: formData.email.trim(),
          password: formData.password,
          role: activeTab,
        });

        setSuccess(`Logged in successfully as ${res.user.name}.`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo One-Click Autologins
  const handleQuickDemo = (role) => {
    let demoUser;
    if (role === 'Doctor') {
      demoUser = {
        id: 'DR-104',
        name: 'Dr. Kavita Menon',
        email: 'kavita.menon@carebridge.ai',
        role: 'Doctor',
        department: 'General Medicine',
        licenseNumber: 'KMC-48291',
        shift: '08:00–16:00',
      };
    } else if (role === 'Hospital Administrator') {
      demoUser = {
        id: 'ADM-001',
        name: 'Dr. Rajesh Varma',
        email: 'admin@carebridge.ai',
        role: 'Hospital Administrator',
        department: 'Hospital Administration & Governance',
        shift: 'Full Time',
      };
    } else {
      demoUser = {
        id: 'CB-2050',
        name: 'Ananya Rao',
        email: 'ananya@carebridge.ai',
        role: 'Patient',
        age: 29,
        gender: 'Female',
        department: 'General Medicine',
      };
    }

    setSuccess(`Logged in with demo access as ${demoUser.name} (${role}).`);
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess(demoUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#071324] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1.5px] shadow-[0_0_20px_rgba(0,212,255,0.4)] mb-3">
            <div className="w-full h-full bg-[#071324] rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            CareBridge <span className="text-cyan-400">AI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Secure Healthcare Coordination & Dedicated Role Portals
          </p>
        </div>

        {/* 3 Portal Tabs (Patient, Doctor, Administrator) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-[#09192f] border border-cyan-900/50 mb-6 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('Patient')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold transition-all ${
              activeTab === 'Patient'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Doctor')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold transition-all ${
              activeTab === 'Doctor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Hospital Administrator')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold transition-all ${
              activeTab === 'Hospital Administrator'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Mode Toggle (Login vs Register) */}
        {activeTab !== 'Hospital Administrator' && (
          <div className="flex items-center justify-center gap-6 pb-4 border-b border-cyan-900/40 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`pb-1 transition-colors relative ${
                !isRegister
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to {activeTab} Account
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`pb-1 transition-colors relative ${
                isRegister
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New {activeTab}
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-xs text-rose-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-xs text-emerald-200 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Registration Fields */}
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {activeTab === 'Doctor' ? 'Doctor Full Name *' : 'Patient Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={activeTab === 'Doctor' ? 'e.g. Dr. Kavita Menon' : 'e.g. Ananya Rao'}
                  className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Doctor Specific Reg Fields */}
              {activeTab === 'Doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      MCI / State Medical License No *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="e.g. KMC-48291"
                      className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Radiology & Imaging">Radiology & Imaging</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Patient Specific Reg Fields */}
              {activeTab === 'Patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      min="1"
                      max="125"
                      value={formData.age}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="e.g. 29"
                      className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {activeTab === 'Hospital Administrator' ? 'Administrator Email *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  activeTab === 'Hospital Administrator'
                    ? 'admin@carebridge.ai'
                    : activeTab === 'Doctor'
                    ? 'doctor@carebridge.ai'
                    : 'patient@carebridge.ai'
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only on Register) */}
          {isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09182d] border border-cyan-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              activeTab === 'Doctor'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/60'
                : activeTab === 'Hospital Administrator'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-950/60'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-950/60'
            }`}
          >
            <span>
              {isLoading
                ? 'Processing...'
                : isRegister
                ? `Create ${activeTab} Account`
                : `Sign In as ${activeTab}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo One-Click Access Divider */}
        <div className="pt-5 mt-5 border-t border-cyan-900/40 text-center space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Or One-Click Instant Demo Login:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('Patient')}
              className="py-2 px-2.5 rounded-lg bg-[#0a1f3a] hover:bg-[#0e2a4f] text-cyan-300 border border-cyan-800/50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3 h-3" />
              <span>Demo Patient</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('Doctor')}
              className="py-2 px-2.5 rounded-lg bg-[#082a20] hover:bg-[#0c382b] text-emerald-300 border border-emerald-800/50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-3 h-3" />
              <span>Demo Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('Hospital Administrator')}
              className="py-2 px-2.5 rounded-lg bg-[#1a1838] hover:bg-[#23204a] text-indigo-300 border border-indigo-800/50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3 h-3" />
              <span>Master Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
