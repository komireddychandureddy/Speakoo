import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { TUTOR_APPLICATIONS, TutorApplication, ApplicationStatus } from '../../data/mockData';

const STORAGE_KEY = 'speakoo_applications';

function getApps(): TutorApplication[] {
  return (JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as TutorApplication[] | null) ?? TUTOR_APPLICATIONS;
}

function saveApps(apps: TutorApplication[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

const STATUS_META: Record<ApplicationStatus, { label: string; badge: string }> = {
  pending: { label: 'Pending Review', badge: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badge: 'bg-[#E8F5E9] text-[#2E7D32]' },
  amendment_requested: { label: 'Amendments Requested', badge: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
};

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
  const [apps, setAppsState] = useState<TutorApplication[]>(getApps);
  const [feedback, setFeedback] = useState('');

  const app = apps.find((a) => a.id === id);

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-[#616161]">Application not found.</p>
        <Link to="/admin/applications" className="text-[#43A047] text-sm mt-2 inline-block">
          ← Back to list
        </Link>
      </div>
    );
  }

  const isReviewed = app.status !== 'pending';

  const take = (newStatus: ApplicationStatus) => {
    if (newStatus !== 'approved' && !feedback.trim() && !isReviewed) {
      alert('Please enter feedback before requesting amendments or rejecting.');
      return;
    }
    const updated = apps.map((a) =>
      a.id === id
        ? {
            ...a,
            status: newStatus,
            adminFeedback: feedback.trim() || a.adminFeedback,
            reviewedAt: new Date().toISOString(),
          }
        : a,
    );
    saveApps(updated);
    setAppsState(updated);
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
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${STATUS_META[app.status].badge}`}>
          {app.status === 'pending' && <Clock size={13} />}
          {app.status === 'approved' && <CheckCircle size={13} />}
          {app.status === 'amendment_requested' && <AlertCircle size={13} />}
          {app.status === 'rejected' && <XCircle size={13} />}
          {STATUS_META[app.status].label}
        </span>
      </div>

      {/* Identity card */}
      <div className="card p-6 flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-lg font-bold shrink-0">
          {app.firstName[0]}{app.lastName[0]}
        </span>
        <div>
          <p className="text-xl font-bold text-[#212121]">{app.firstName} {app.lastName}</p>
          <p className="text-sm text-[#616161]">{app.email}</p>
          <p className="text-xs text-[#616161] mt-0.5">
            Ref: <code className="bg-[#F8FBF0] px-1.5 py-0.5 rounded font-mono">{app.refNumber}</code>
            {' · '}Submitted {new Date(app.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card p-6">
        <h2 className="font-semibold text-[#212121] mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <InfoRow label="Phone" value={app.phone} />
          <InfoRow label="Country" value={app.country} />
          <InfoRow label="City" value={app.city} />
        </div>
      </div>

      {/* Language & Skills */}
      <div className="card p-6">
        <h2 className="font-semibold text-[#212121] mb-4">Language &amp; Skills</h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <InfoRow label="Languages Taught" value={app.languages.join(', ')} />
          <InfoRow label="Proficiency Level" value={app.proficiency} />
          <InfoRow label="Years of Experience" value={`${app.yearsExp} years`} />
          <InfoRow label="Certifications" value={app.certifications.join(', ')} />
        </div>
      </div>

      {/* Teaching Profile */}
      <div className="card p-6">
        <h2 className="font-semibold text-[#212121] mb-4">Teaching Profile</h2>
        <div className="space-y-3">
          <InfoRow label="Bio" value={app.bio} />
          <InfoRow label="Teaching Style" value={app.teachingStyle} />
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <InfoRow label="Max Sessions / Month" value={app.maxSessions} />
            <InfoRow label="Availability" value={app.availability.join(', ')} />
          </div>
        </div>
      </div>

      {/* Review Panel */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-[#212121]">Admin Review</h2>

        {isReviewed && app.adminFeedback && (
          <div className="bg-[#F8FBF0] rounded-lg p-4 space-y-1 border border-gray-100">
            <p className="text-xs text-[#616161] font-medium uppercase tracking-wide">Previous Feedback</p>
            <p className="text-sm text-[#212121]">{app.adminFeedback}</p>
            {app.reviewedAt && (
              <p className="text-xs text-[#616161]">
                Reviewed on {new Date(app.reviewedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wide mb-2">
            {isReviewed ? 'Update Feedback / Notes (optional)' : 'Feedback for Applicant'}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder={
              isReviewed
                ? 'Add updated notes or revised feedback…'
                : 'Approval notes, amendment requests, or rejection reason — sent to the applicant via email.'
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30 resize-none"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => take('approved')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#43A047] hover:bg-[#2E7D32] text-white transition-colors"
          >
            <CheckCircle size={16} /> Approve
          </button>
          <button
            onClick={() => take('amendment_requested')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <AlertCircle size={16} /> Request Amendments
          </button>
          <button
            onClick={() => take('rejected')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <XCircle size={16} /> Reject
          </button>
        </div>

        <p className="text-xs text-[#616161]">
          Feedback is required when requesting amendments or rejecting. All decisions are communicated
          to the applicant via email.
        </p>
      </div>
    </div>
  );
}
