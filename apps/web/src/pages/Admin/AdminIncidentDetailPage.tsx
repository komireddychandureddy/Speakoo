import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getIncidentById,
  triageIncident,
  type AdminIncident,
  type IncidentPriority,
  type IncidentStatus,
} from '../../core/network/adminApi';

const pretty = (value: string) => value.replace(/_/g, ' ');

export default function AdminIncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<AdminIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<IncidentStatus>('investigating');
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (!id) return;
    getIncidentById(id)
      .then((data) => {
        setIncident(data);
        setStatus(data.status);
        setPriority(data.priority);
        setAdminNote(data.adminNote ?? '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await triageIncident(id, {
        status,
        priority,
        ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
      });
      setIncident(updated);
      navigate('/admin/incidents');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-[#616161] text-sm">Loading incident...</p>;
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <p className="text-[#616161]">Incident not found.</p>
        <Link to="/admin/incidents" className="text-[#43A047] text-sm mt-2 inline-block">
          Back to incident queue
        </Link>
      </div>
    );
  }

  const reporterName = incident.reporter.profile?.displayName ?? incident.reporter.email;
  const reportedName =
    incident.reportedUser?.profile?.displayName ?? incident.reportedUser?.email ?? 'N/A';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/incidents"
          className="flex items-center gap-2 text-sm text-[#616161] hover:text-[#212121] transition-colors"
        >
          <ArrowLeft size={16} /> Incident Queue
        </Link>
      </div>

      <div className="card p-6 space-y-4">
        <h1 className="text-2xl font-bold text-[#212121]">Incident Detail</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#616161]">Reporter</p>
            <p className="text-[#212121] font-medium">{reporterName}</p>
          </div>
          <div>
            <p className="text-[#616161]">Reported User</p>
            <p className="text-[#212121] font-medium">{reportedName}</p>
          </div>
          <div>
            <p className="text-[#616161]">Category</p>
            <p className="text-[#212121] capitalize">{pretty(incident.category)}</p>
          </div>
          <div>
            <p className="text-[#616161]">Booking ID</p>
            <p className="text-[#212121]">{incident.bookingId ?? 'N/A'}</p>
          </div>
        </div>

        <div>
          <p className="text-[#616161] text-sm mb-1">Description</p>
          <p className="text-[#212121] bg-[#F8FBF0] rounded-lg p-3 leading-6">{incident.description}</p>
        </div>

        {incident.evidenceUrls.length > 0 && (
          <div>
            <p className="text-[#616161] text-sm mb-1">Evidence URLs</p>
            <ul className="space-y-1">
              {incident.evidenceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2E7D32] underline text-sm break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-[#212121]">Triage</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#616161] block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#616161] block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-[#616161] block mb-1">Admin Note</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={5}
            placeholder="Add investigation summary and action taken..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/incidents')}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-[#616161] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#43A047] text-white hover:bg-[#2E7D32] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Triage'}
          </button>
        </div>
      </div>
    </div>
  );
}
