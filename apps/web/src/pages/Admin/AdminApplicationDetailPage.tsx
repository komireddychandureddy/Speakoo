import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { approveTutor, type AdminUser, listAdminUsers } from '../../core/network/adminApi';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#616161] font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-[#212121]">{value || '—'}</p>
    </div>
  );
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    listAdminUsers(1, 200, 'tutor').then((res) => {
      const found = res.data.find((u) => u.id === id) ?? null;
      setUser(found);
      if (found) setApproved(found.tutorProfile?.isApproved === true);
    }).catch(() => {});
  }, [id]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#616161]">Application not found.</p>
        <Link to="/admin/applications" className="text-[#43A047] text-sm mt-2 inline-block">
          ← Back to list
        </Link>
      </div>
    );
  }

  const displayName = user.profile?.displayName ?? user.email;
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleApprove = async () => {
    await approveTutor(user.id);
    setApproved(true);
    navigate('/admin/applications');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + status */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/applications"
          className="flex items-center gap-2 text-sm text-[#616161] hover:text-[#212121] transition-colors"
        >
          <ArrowLeft size={16} /> All Applications
        </Link>
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${approved ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-amber-100 text-amber-700'}`}>
          {approved ? <CheckCircle size={13} /> : <Clock size={13} />}
          {approved ? 'Approved' : 'Pending Review'}
        </span>
      </div>

      {/* Identity card */}
      <div className="card p-6 flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-lg font-bold shrink-0">
          {initials}
        </span>
        <div>
          <p className="text-xl font-bold text-[#212121]">{displayName}</p>
          <p className="text-sm text-[#616161]">{user.email}</p>
          <p className="text-xs text-[#616161] mt-0.5">
            Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tutor Profile */}
      {user.tutorProfile && (
        <div className="card p-6">
          <h2 className="font-semibold text-[#212121] mb-4">Teaching Profile</h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <InfoRow label="Languages Taught" value={user.tutorProfile.languagesTaught?.join(', ') ?? '—'} />
            <InfoRow
              label="Hourly Rate"
              value={user.tutorProfile.hourlyRateCents != null
                ? `₹${Math.round(user.tutorProfile.hourlyRateCents / 100)}`
                : '—'}
            />
            <InfoRow label="Country" value={user.profile?.countryCode ?? '—'} />
            <InfoRow label="Bio" value={user.profile?.bio ?? '—'} />
          </div>
        </div>
      )}

      {/* Review Panel */}
      {!approved && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-[#212121]">Admin Review</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#43A047] hover:bg-[#2E7D32] text-white transition-colors"
            >
              <CheckCircle size={16} /> Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
