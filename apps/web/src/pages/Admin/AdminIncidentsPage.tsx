import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search } from 'lucide-react';
import {
  listIncidents,
  type AdminIncident,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
} from '../../core/network/adminApi';

const statusBadge: Record<IncidentStatus, string> = {
  open: 'bg-red-100 text-red-700',
  investigating: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

const priorityBadge: Record<IncidentPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const pretty = (value: string) => value.replace(/_/g, ' ');

export default function AdminIncidentsPage() {
  const [items, setItems] = useState<AdminIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IncidentStatus | ''>('');
  const [priority, setPriority] = useState<IncidentPriority | ''>('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await listIncidents({
        page: 1,
        limit: 100,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(category ? { category } : {}),
      });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status, priority, category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((incident) => {
      const reporterName = incident.reporter.profile?.displayName ?? incident.reporter.email;
      const reportedName =
        incident.reportedUser?.profile?.displayName ?? incident.reportedUser?.email ?? '';
      return (
        incident.description.toLowerCase().includes(q) ||
        reporterName.toLowerCase().includes(q) ||
        reportedName.toLowerCase().includes(q) ||
        incident.category.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const openCount = items.filter((i) => i.status === 'open').length;
  const criticalCount = items.filter((i) => i.priority === 'critical').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Incident Queue</h1>
        <p className="text-[#616161] text-sm mt-1">
          {items.length} incidents · {openCount} open · {criticalCount} critical
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 border-l-4 border-red-500 bg-red-50 text-red-800">
          <p className="text-2xl font-bold">{openCount}</p>
          <p className="text-sm mt-0.5">Open Incidents</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500 bg-amber-50 text-amber-800">
          <p className="text-2xl font-bold">{criticalCount}</p>
          <p className="text-sm mt-0.5">Critical Priority</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]/30"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as IncidentStatus | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as IncidentPriority | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IncidentCategory | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All categories</option>
          <option value="abuse">Abuse</option>
          <option value="harassment">Harassment</option>
          <option value="no_show">No Show</option>
          <option value="payment_dispute">Payment Dispute</option>
          <option value="technical_issue">Technical Issue</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-[#616161] text-sm">Loading incidents...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FBF0]">
              <tr>
                {['Incident', 'Reporter', 'Reported User', 'Category', 'Priority', 'Status', 'Created', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[#616161] font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((incident) => {
                const reporterName =
                  incident.reporter.profile?.displayName ?? incident.reporter.email;
                const reportedName =
                  incident.reportedUser?.profile?.displayName ??
                  incident.reportedUser?.email ??
                  'N/A';
                return (
                  <tr key={incident.id} className="hover:bg-[#F8FBF0] transition-colors">
                    <td className="px-5 py-3 max-w-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={15} className="text-red-500 mt-0.5" />
                        <p className="text-[#212121] line-clamp-2">{incident.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#616161]">{reporterName}</td>
                    <td className="px-5 py-3 text-[#616161]">{reportedName}</td>
                    <td className="px-5 py-3 text-[#616161] capitalize">{pretty(incident.category)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityBadge[incident.priority]}`}>
                        {incident.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[incident.status]}`}>
                        {pretty(incident.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#616161]">
                      {new Date(incident.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/admin/incidents/${incident.id}`}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#E8F5E9] text-[#2E7D32] hover:bg-green-100 transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[#616161]">
                    No incidents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
