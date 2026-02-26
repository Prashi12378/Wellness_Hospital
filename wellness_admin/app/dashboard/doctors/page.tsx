'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Mail, Phone, Stethoscope, UserRound, Clock, IndianRupee, Award, Briefcase, Upload, X, Pencil, Eye, EyeOff } from 'lucide-react';

// Define Timing type
type TimingSlot = {
    day: string;
    start: string;
    end: string;
};

export default function DoctorManagementPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // New Doctor Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        fee: '',
        bio: '',
        avatar_url: ''
    });


    // Timings State
    const [timings, setTimings] = useState<TimingSlot[]>([]);
    const [currentSlot, setCurrentSlot] = useState<TimingSlot>({ day: 'Monday', start: '09:00', end: '17:00' });

    const [uploading, setUploading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/doctors');
            if (res.ok) {
                const data = await res.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const data = new FormData();
            data.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const { publicUrl } = await res.json();
            setFormData({ ...formData, avatar_url: publicUrl });

        } catch (error: any) {
            setFormError(error.message);
        } finally {
            setUploading(false);
        }
    };

    const addTimingSlot = () => {
        setTimings([...timings, currentSlot]);
    };

    const removeTimingSlot = (index: number) => {
        const newTimings = [...timings];
        newTimings.splice(index, 1);
        setTimings(newTimings);
    };

    const handleEditDoctor = (doctor: any) => {
        setIsEditing(true);
        setEditingId(doctor.id);
        setFormData({
            email: doctor.email || '',
            password: '', // Password cannot be retrieved
            fullName: doctor.full_name || '',
            phone: doctor.phone || '',
            specialization: doctor.specialization || '',
            qualification: doctor.qualification || '',
            experience: doctor.experience_years?.toString() || '',
            fee: doctor.consultation_fee?.toString() || '',
            bio: doctor.bio || '',
            avatar_url: doctor.avatar_url || ''
        });

        // Ensure timings is an array
        let safeTimings: TimingSlot[] = [];
        if (Array.isArray(doctor.available_timings)) {
            safeTimings = doctor.available_timings;
        } else if (typeof doctor.available_timings === 'string') {
            try {
                const parsed = JSON.parse(doctor.available_timings);
                if (Array.isArray(parsed)) safeTimings = parsed;
            } catch (e) {
                // If parsing fails or not valid JSON, fallback to empty
            }
        }
        setTimings(safeTimings);
        setAddModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            email: '', password: '', fullName: '', phone: '',
            specialization: '', qualification: '', experience: '', fee: '', bio: '', avatar_url: ''
        });
        setTimings([]);
        setIsEditing(false);
        setEditingId(null);
        setFormError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            const endpoint = isEditing ? '/api/admin/update-user' : '/api/admin/create-user';

            const payload = {
                id: editingId, // Only used for update
                email: formData.email,
                password: formData.password, // Ignored on update if empty
                fullName: formData.fullName,
                role: 'doctor',
                phone: formData.phone,
                specialization: formData.specialization,
                qualification: formData.qualification,
                experience: formData.experience,
                fee: formData.fee,
                timings: timings,
                bio: formData.bio,
                avatar_url: formData.avatar_url
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} doctor`);
            }

            // Success
            setAddModalOpen(false);
            resetForm();
            fetchDoctors(); // Refresh list

        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteDoctor = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}?`)) return;
        try {
            const res = await fetch('/api/admin/delete-user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }

            fetchDoctors();
        } catch (err: any) {
            alert('Error deleting doctor: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctor Management</h1>
                    <p className="text-slate-500">Manage doctor profiles, specializations, and schedules</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add New Doctor
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading doctors...</div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-700">No doctors found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1">Get started by adding a new doctor to the platform.</p>
                    </div>
                ) : (
                    doctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 group hover:border-primary/50 transition-colors relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEditDoctor(doctor)}
                                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Doctor"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteDoctor(doctor.id, doctor.email)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Doctor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-shrink-0">
                                {doctor.avatar_url ? (
                                    <img
                                        src={doctor.avatar_url}
                                        alt={doctor.full_name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-100"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                        {doctor.full_name?.[0]?.toUpperCase() || 'D'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{doctor.full_name}</h3>
                                    <p className="text-primary font-medium">{doctor.specialization || 'General Practitioner'}</p>
                                    <p className="text-sm text-slate-500 mt-1">{doctor.qualification}</p>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-3">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {doctor.email}
                                        </span>
                                        {doctor.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                {doctor.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 border-l border-slate-100 pl-4 md:pl-6">
                                    {(doctor.experience_years > 0) && (
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                            <span>{doctor.experience_years} Years Experience</span>
                                        </div>
                                    )}
                                    {(doctor.consultation_fee > 0) && (
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-slate-400" />
                                            <span>{doctor.consultation_fee} Consultation Fee</span>
                                        </div>
                                    )}
                                    {/* Display Timings */}
                                    {doctor.available_timings && Array.isArray(doctor.available_timings) && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">Schedule:</span>
                                            </div>
                                            <div className="pl-6 space-y-1">
                                                {doctor.available_timings.map((slot: any, idx: number) => (
                                                    <div key={idx} className="text-xs bg-slate-50 px-2 py-1 rounded inline-block mr-2 mb-1 border border-slate-100">
                                                        <span className="font-semibold">{slot.day}:</span> {slot.start} - {slot.end}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                            <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            <form id="doctor-form" onSubmit={handleSubmit} className="space-y-6">
                                {formError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                                        <div className="mt-0.5">⚠️</div>
                                        <div>{formError}</div>
                                    </div>
                                )}

                                {/* Photo Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group shadow-inner">
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserRound className="w-8 h-8 text-slate-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadPhoto}
                                            disabled={uploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            title="Upload Profile Photo"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-700">Profile Photo</h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                                            {uploading ? 'Uploading...' : 'Click the circle to upload. SVG, PNG, JPG or GIF (max 800x400px)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Dr. John Doe"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Specialization</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="e.g. Cardiologist"
                                            value={formData.specialization}
                                            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Qualification</label>
                                        <input
                                            type="text"
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="e.g. MBBS, MD"
                                            value={formData.qualification}
                                            onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Experience (Years)</label>
                                        <input
                                            type="number"
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="10"
                                            value={formData.experience}
                                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Consultation Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="500"
                                            value={formData.fee}
                                            onChange={e => setFormData({ ...formData, fee: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {/* Spacer or additional field */}
                                    </div>
                                </div>

                                {/* Timings Builder */}
                                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Schedule Builder
                                    </label>

                                    <div className="grid grid-cols-7 gap-2 items-center">
                                        <select
                                            className="col-span-3 h-9 px-2 text-sm rounded border border-slate-200 bg-white"
                                            value={currentSlot.day}
                                            onChange={e => setCurrentSlot({ ...currentSlot, day: e.target.value })}
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="time"
                                            className="col-span-2 h-9 px-2 text-sm rounded border border-slate-200"
                                            value={currentSlot.start}
                                            onChange={e => setCurrentSlot({ ...currentSlot, start: e.target.value })}
                                        />
                                        <input
                                            type="time"
                                            className="col-span-2 h-9 px-2 text-sm rounded border border-slate-200"
                                            value={currentSlot.end}
                                            onChange={e => setCurrentSlot({ ...currentSlot, end: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTimingSlot}
                                        className="w-full h-8 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                                    >
                                        + Add Time Slot
                                    </button>

                                    {timings.length > 0 && (
                                        <div className="space-y-2 mt-3 p-2 bg-white rounded border border-slate-100">
                                            {timings.map((t, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-slate-50">
                                                    <span><span className="font-semibold text-slate-600">{t.day}:</span> {t.start} - {t.end}</span>
                                                    <button type="button" onClick={() => removeTimingSlot(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Bio / Description (Optional)</label>
                                    <textarea
                                        className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        placeholder="Brief professional summary..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Login Credentials</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                disabled={isEditing}
                                                className={`w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isEditing ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                                                placeholder="doctor@hospital.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isEditing ? 'Reset Password (Optional)' : 'Password'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required={!isEditing}
                                                    className={`w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                                                    placeholder={isEditing ? "Leave blank to keep same" : "••••••••"}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="+91..."
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="doctor-form"
                                disabled={formLoading || uploading}
                                className="flex-1 h-10 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm"
                            >
                                {formLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isEditing ? 'Update Doctor' : 'Create Doctor Account')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
