import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { getComplaintById, getStoredComplaints } from '../../utils/storage';

interface TrackComplaintViewProps {
  initialComplaintId?: string;
  onNavigateReport: () => void;
}

const STATUS_STEPS: { id: ComplaintStatus; label: string; desc: string }[] = [
  { id: 'Submitted', label: 'Submitted', desc: 'Received & registered' },
  { id: 'Under Review', label: 'Under Review', desc: 'AI triage & verification' },
  { id: 'Assigned', label: 'Assigned', desc: 'Dispatched to department' },
  { id: 'In Progress', label: 'In Progress', desc: 'Field crew resolving' },
  { id: 'Resolved', label: 'Resolved', desc: 'Work inspected & completed' },
];

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  initialComplaintId = '',
  onNavigateReport,
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      doSearch(initialComplaintId);
    }
  }, [initialComplaintId]);

  const doSearch = (idToSearch: string) => {
    const found = getComplaintById(idToSearch);
    setComplaint(found || null);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      doSearch(searchId.trim());
    }
  };

  const allComplaints = getStoredComplaints();
  const sampleDemoIds = allComplaints.slice(0, 4).map((c) => c.id);

  // Determine active step index
  const getStepStatus = (stepId: ComplaintStatus, currentStatus: ComplaintStatus) => {
    if (currentStatus === 'Rejected') {
      return stepId === 'Submitted' || stepId === 'Under Review' ? 'completed' : 'inactive';
    }

    const order: ComplaintStatus[] = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
    ];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Your Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Check live municipal triage status, assigned field departments, and official updates in
          real time.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CIVIC-2026-1005)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            Track
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span>Click to test existing reports:</span>
          {sampleDemoIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                doSearch(id);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg font-mono font-medium transition-colors cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Result Section */}
      {hasSearched && !complaint && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Complaint Not Found</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            We couldn't locate a complaint with ID <strong>"{searchId}"</strong>. Please verify the
            ID number or submit a new report.
          </p>
          <button
            onClick={onNavigateReport}
            className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            <span>Report a New Problem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {complaint && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    {complaint.id}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500">{complaint.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  {complaint.title}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    complaint.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : complaint.status === 'Rejected'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : complaint.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {complaint.status === 'Resolved' && <CheckCircle2 className="w-4 h-4" />}
                  {complaint.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                  {complaint.status === 'In Progress' && <Clock className="w-4 h-4 animate-spin" />}
                  <span>Status: {complaint.status}</span>
                </span>
              </div>
            </div>

            {/* Stepper Timeline (if not rejected) */}
            {complaint.status !== 'Rejected' ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Progress Lifecycle
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const stepState = getStepStatus(step.id, complaint.status);
                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          stepState === 'completed'
                            ? 'bg-teal-50/80 border-teal-300 text-teal-900'
                            : stepState === 'current'
                            ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold">Step {idx + 1}</span>
                          {stepState === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          )}
                          {stepState === 'current' && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                          )}
                        </div>
                        <div className="font-bold text-xs">{step.label}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Rejection Notice */
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                <div className="font-bold text-sm flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Complaint Closed - Rejected by Authority</span>
                </div>
                <p className="text-xs text-red-800">
                  {complaint.rejectionReason || 'Closed after review by municipal administration.'}
                </p>
              </div>
            )}

            {/* Overview Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Location
                </span>
                <div className="text-xs font-bold text-slate-800 mt-1 flex items-start space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{complaint.address}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Assigned Department
                </span>
                <div className="text-xs font-bold text-slate-800 mt-1 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{complaint.assignedDepartment}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Submitted On
                </span>
                <div className="text-xs font-bold text-slate-800 mt-1 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* AI Executive Summary for Citizen */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-800 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Official Summary</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                "{complaint.aiSummary}"
              </p>
            </div>

            {/* Evidence Image (if present) */}
            {complaint.imageUrl && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Submitted Photo Evidence</span>
                <div className="rounded-2xl overflow-hidden max-h-56 bg-slate-100 border border-slate-200">
                  <img
                    src={complaint.imageUrl}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Complete Status History Log */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Audit & Activity Log</h3>
            <p className="text-xs text-slate-500">
              Complete chronological timeline of updates made by municipal staff
            </p>

            <div className="space-y-4 pt-2">
              {complaint.statusHistory.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3.5 relative">
                  {idx !== complaint.statusHistory.length - 1 && (
                    <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-200 -z-0" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-teal-500 flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.status}</span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Updated by: {item.updatedBy}</div>
                    {item.remarks && (
                      <p className="text-slate-700 font-medium pt-1 border-t border-slate-200/60 mt-1">
                        "{item.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Official Remarks Summary */}
            {complaint.officialRemarks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Official Field Remarks
                </span>
                <ul className="space-y-1.5">
                  {complaint.officialRemarks.map((rem, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-start space-x-2"
                    >
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
