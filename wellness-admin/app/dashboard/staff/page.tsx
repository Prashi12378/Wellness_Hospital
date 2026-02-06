'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, User, Trash2, Edit, X, Save } from 'lucide-react';

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ fullName: '', email: '', phone: '', password: '' });
    const [createLoading, setCreateLoading] = useState(false);

    // Edit State
    const [isEditOpen, setEditOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                // Map data to handle missing fields and structure
                const formattedData = data.map((user: any) => ({
                    id: user.profile?.id, // Use Profile ID for actions
                    userId: user.id,
                    full_name: user.name || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown',
                    email: user.email,
                    phone: user.profile?.phone || user.phone || 'N/A',
                    role: user.profile?.role || 'staff',
                    created_at: user.profile?.createdAt || new Date().toISOString()
                })).filter((u: any) => u.id); // Filter out users without profiles if any
                setStaff(formattedData);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newStaff, role: 'staff' }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create staff');

            setCreateOpen(false);
            setNewStaff({ fullName: '', email: '', phone: '', password: '' });
            fetchStaff();
            alert('Staff member created successfully!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;

        try {
            const res = await fetch('/api/admin/delete-user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }), // Pass Profile ID
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete staff');

            fetchStaff();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openEditModal = (member: any) => {
        setEditingStaff(member);
        setEditForm({
            fullName: member.full_name,
            phone: member.phone === 'N/A' ? '' : member.phone
        });
        setEditOpen(true);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);

        try {
            const res = await fetch('/api/admin/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingStaff.id, // Profile ID
                    fullName: editForm.fullName,
                    phone: editForm.phone,
                    // Pass other fields as undefined/defaults if API requires them, 
                    // or ensure API handles partial updates. 
                    // The update-user API expects all fields but handles undefined. 
                    // We only edit name and phone for staff here.
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update staff');

            setEditOpen(false);
            setEditingStaff(null);
            fetchStaff();
            alert('Staff updated successfully!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage receptionists, nurses, and support staff.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Staff Member
                </button>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading staff...</td></tr>
                            ) : staff.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No staff members found.</td></tr>
                            ) : (
                                staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                                    {member.full_name?.[0] || 'U'}
                                                </div>
                                                <span className="font-medium text-slate-900">{member.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Mail className="w-3 h-3" /> {member.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Phone className="w-3 h-3" /> {member.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Add New Staff</h2>
                            <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={newStaff.fullName}
                                    onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={newStaff.email}
                                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                <input
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={newStaff.phone}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={newStaff.password}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    className="flex-1 h-10 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {createLoading ? 'Creating...' : <> <Plus className="w-4 h-4" /> Create Staff </>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Edit Staff Member</h2>
                            <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={editForm.fullName}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                <input
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditOpen(false)}
                                    className="flex-1 h-10 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {editLoading ? 'Saving...' : <> <Save className="w-4 h-4" /> Save Changes </>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
