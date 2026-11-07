import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Compass,
  BarChart2,
  Bell,
  AlertTriangle,
  Ban,
  CheckCircle,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AdminStats, User } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, reportsData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(roleFilter !== 'ALL' ? roleFilter : undefined, search || undefined),
        adminService.getReports()
      ]);
      if (statsData) setStats(statsData);
      setUsers(usersData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter, search]);

  const handleToggleBlock = async (userId: string) => {
    try {
      const updated = await adminService.toggleUserBlock(userId);
      if (updated) {
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isBlocked: updated.isBlocked } : u)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user block status');
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'TEACHER') {
    return (
      <Layout>
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1">
            This administration portal is restricted to Greenfield High School teachers and administrators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showRightSidebar={false}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                School Safety & Platform Administration
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <strong>{user?.profile?.fullName}</strong> ({user?.role})
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Students</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                {stats.totalStudents}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Social Posts</span>
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                {stats.totalPosts}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Clubs</span>
                <Compass className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                {stats.totalClubs}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pending Reports</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                {stats.pendingReports}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
            {activeTab === 'users' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Moderation Reports ({reports.length})</span>
            {activeTab === 'reports' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="TEACHER">Teachers Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Class & Section</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.profile?.avatarUrl}
                            name={u.profile?.fullName || u.email}
                            size="sm"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {u.profile?.fullName || 'N/A'}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <RoleBadge role={u.role} size="sm" />
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {u.profile?.grade || '-'} {u.profile?.section && `• ${u.profile.section}`}
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                            <Ban className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant={u.isBlocked ? 'outline' : 'danger'}
                            onClick={() => handleToggleBlock(u.id)}
                          >
                            {u.isBlocked ? 'Unblock User' : 'Block / Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Student Safety Reports Queue
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No active moderation flags. The school community is behaving safely!
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600">Target Type: {r.targetType}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Reason Reported:</strong> {r.reason}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Reported by: {r.reporter?.profile?.fullName || r.reporter?.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
