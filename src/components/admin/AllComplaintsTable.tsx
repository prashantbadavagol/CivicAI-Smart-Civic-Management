import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  RotateCcw,
  Eye,
  CheckCircle2,
  MapPin,
  Building2,
  Calendar,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel, Department } from '../../types';

interface AllComplaintsTableProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Road Damage',
  'Waterlogging',
  'Garbage',
  'Streetlight',
  'Drainage',
  'Water Supply',
  'Public Safety',
  'Other',
];

const PRIORITIES: PriorityLevel[] = ['Critical', 'High', 'Medium', 'Low'];

const STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const AllComplaintsTable: React.FC<AllComplaintsTableProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'priority' | 'id'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Extract distinct locations/districts
  const distinctLocations = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      const parts = c.address.split(',');
      if (parts.length > 1) {
        set.add(parts[parts.length - 1].trim());
      }
    });
    return Array.from(set);
  }, [complaints]);

  // Filter complaints
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      // Search query in title, id, description, address
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.assignedDepartment.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (locationFilter !== 'All' && !c.address.includes(locationFilter)) return false;

      return true;
    });
  }, [complaints, searchQuery, categoryFilter, priorityFilter, statusFilter, locationFilter]);

  // Sort complaints
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'priority') {
        comparison = a.priorityScore - b.priorityScore;
      } else if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filtered, sortField, sortAsc]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setLocationFilter('All');
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sorted, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `civicai_complaints_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Civic Complaints Repository
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Displaying {sorted.length} of {complaints.length} registered municipal records
          </p>
        </div>

        <button
          onClick={exportJSON}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Records (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, keyword in title/description, address, or assigned department..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">District / Locality</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Districts</option>
              {distinctLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort field */}
          <div className="flex items-end space-x-1.5">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
              >
                <option value="date">Submission Date</option>
                <option value="priority">Priority Score</option>
                <option value="id">Complaint ID</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              title="Toggle sort direction"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Complaint Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No complaints match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectComplaint(c)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate">{c.title}</span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {c.aiSummary || c.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-slate-600">
                      📍 {c.address}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : c.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : c.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.priority} ({c.priorityScore})
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {c.assignedDepartment}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : c.status === 'Rejected'
                            ? 'bg-red-50 text-red-700'
                            : c.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
