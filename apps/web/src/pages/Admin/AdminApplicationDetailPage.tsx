import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { toApplicationReference } from '../../core/utils/applicationReference';
import {
  listAdminKycSubmissions,
  reviewKycSubmission,
  type AdminKycSubmission,
} from '../../core/network/adminApi';

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
  const [submission, setSubmission] = useState<AdminKycSubmission | null>(null);

  useEffect(() => {
    listAdminKycSubmissions({ page: 1, limit: 200 })
      .then((res) => {
        const found = res.items.find((u) => u.id === id) ?? null;
        setSubmission(found);
      })
      .catch(() => {});
  }, [id]);

  if (!submission) {
    return (
      <div className="text-center py-20">
        <p className="text-[#616161]">Application not found.</p>
        <Link to="/admin/applications" className="text-[#43A047] text-sm mt-2 inline-block">
          ← Back to list
        </Link>
      </div>
    );
  }

  const displayName = submission.tutor.profile?.displayName ?? submission.tutor.email;
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isPending = submission.status === 'pending';
  const reference = submission.applicationRef ?? toApplicationReference(submission.id);

  const handleApprove = async () => {
    await reviewKycSubmission(submission.id, { status: 'approved' });
    navigate('/admin/applications');
  };

  const handleReject = async () => {
    await reviewKycSubmission(submission.id, { status: 'rejected' });
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
        <span
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${
            submission.status === 'approved'
              ? 'bg-[#E8F5E9] text-[#2E7D32]'
              : submission.status === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
          }`}
        >
          {submission.status === 'approved' ? <CheckCircle size={13} /> : <Clock size={13} />}
          {submission.status === 'approved'
            ? 'Approved'
            : submission.status === 'rejected'
              ? 'Rejected'
              : 'Pending Review'}
        </span>
      </div>

      {/* Identity card */}
      <div className="card p-6 flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-lg font-bold shrink-0">
          {initials}
        </span>
        <div>
          <p className="text-xl font-bold text-[#212121]">{displayName}</p>
          <p className="text-sm text-[#616161]">{submission.tutor.email}</p>
          <p className="text-xs text-[#616161] mt-0.5">Submission #{reference}</p>
          <p className="text-xs text-[#616161] mt-0.5">
            Submitted {new Date(submission.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tutor Profile */}
      {submission.tutor.tutorProfile && (
        <div className="card p-6">
          <h2 className="font-semibold text-[#212121] mb-4">Teaching Profile</h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <InfoRow
              label="Languages Taught"
              value={submission.tutor.tutorProfile.languagesTaught?.join(', ') ?? '—'}
            />
            <InfoRow label="Document Type" value={submission.documentType} />
            <InfoRow label="Country" value={submission.tutor.profile?.countryCode ?? '—'} />
            <InfoRow label="Reviewer Note" value={submission.note ?? '—'} />
          </div>
        </div>
      )}

      {/* Review Panel */}
      {isPending && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-[#212121]">Admin Review</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#43A047] hover:bg-[#2E7D32] text-white transition-colors"
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={handleReject}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
