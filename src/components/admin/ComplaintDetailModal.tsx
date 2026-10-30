import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  ArrowRight,
  Send,
  Link,
  Split,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  Department,
  PriorityLevel,
} from '../../types';
import {
  assignComplaintDepartment,
  updateComplaintStatus,
  updateDuplicateStatus,
} from '../../utils/storage';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onComplaintUpdated: () => void;
}

const DEPARTMENTS: Department[] = [
  'Public Works Department',
  'Sanitation & Solid Waste',
  'Traffic & Road Safety',
  'Water & Drainage Board',
  'Public Health & Safety',
  'Electricity & Lighting',
  'Civic Administration',
];

const STATUS_OPTIONS: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onComplaintUpdated,
}) => {
  if (!complaint) return null;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'Unassigned'>(
    complaint.assignedDepartment
  );
  const [remarkInput, setRemarkInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState(
    complaint.rejectionReason || ''
  );
  const [officialName, setOfficialName] = useState('Officer J. Martinez (Triage Lead)');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    setSelectedStatus(newStatus);
  };

  const handleSaveStatusAndDept = () => {
    if (selectedStatus === 'Rejected' && !rejectionReasonInput.trim()) {
      alert('Please specify a rejection reason before marking as Rejected.');
      return;
    }

    // Update status if changed
    if (selectedStatus !== complaint.status || remarkInput.trim() || rejectionReasonInput) {
      updateComplaintStatus(
        complaint.id,
        selectedStatus,
        officialName,
        remarkInput.trim() || undefined,
        selectedStatus === 'Rejected' ? rejectionReasonInput.trim() : undefined
      );
    }

    // Update department if changed
    if (
      selectedDepartment !== 'Unassigned' &&
      selectedDepartment !== complaint.assignedDepartment
    ) {
      assignComplaintDepartment(complaint.id, selectedDepartment, officialName);
    }

    setNotificationMsg('Complaint changes saved successfully.');
    setTimeout(() => {
      setNotificationMsg(null);
      onComplaintUpdated();
      onClose();
    }, 900);
  };

  const handleDuplicateAction = (
    targetDupId: string,
    action: 'confirmed_duplicate' | 'rejected_unique'
  ) => {
    updateDuplicateStatus(complaint.id, targetDupId, action, officialName);
    onComplaintUpdated();
  };

  const priorityBadgeStyle: Record<PriorityLevel, string> = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-amber-100 text-amber-800 border-amber-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {complaint.id}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                priorityBadgeStyle[complaint.priority]
              }`}
            >
              {complaint.priority} Priority ({complaint.priorityScore}/100)
            </span>
            {complaint.isPublicSafetyRisk && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                Safety Risk
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notificationMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
        )}

        <div className="p-5 sm:p-8 space-y-6">
          {/* Main Title & Address */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {complaint.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{complaint.address}</span>
              </span>
              <span>•</span>
              <span>Category: <strong>{complaint.category}</strong></span>
              <span>•</span>
              <span>Logged: {new Date(complaint.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Citizen Description & Photo Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Citizen Problem Description
              </span>
              <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Photo Evidence
              </span>
              {complaint.imageUrl ? (
                <div className="rounded-2xl overflow-hidden h-40 bg-slate-100 border border-slate-200 shadow-sm">
                  <img
                    src={complaint.imageUrl}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl h-40 bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                  <span>No photo attached</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Intelligence Engine Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-400 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">AI Intelligence Engine Triage</h3>
                  <p className="text-[11px] text-teal-300">
                    CivicAI Advisory Briefing (Not final binding order)
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Score: {complaint.priorityScore}/100
              </span>
            </div>

            {/* Explainable Priority Reasoning */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                Priority Assessment & Explainability:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                {complaint.priorityExplanation}
              </p>
            </div>

            {/* AI Action Brief Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block text-[11px]">Identified Core Problem:</span>
                <span className="text-white font-medium">
                  {complaint.actionBrief?.problemIdentified || complaint.title}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block text-[11px]">Recommended Department:</span>
                <span className="text-teal-300 font-bold">
                  {complaint.actionBrief?.suggestedDepartment || complaint.assignedDepartment}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Recommended Next Action:</span>
                <span className="text-white font-medium">
                  {complaint.actionBrief?.recommendedNextAction || 'Dispatch field inspection unit'}
                </span>
              </div>
            </div>
          </div>

          {/* Duplicate Detection Suggestions Panel */}
          {complaint.duplicateSuggestions && complaint.duplicateSuggestions.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    Duplicate Candidates Detected ({complaint.duplicateSuggestions.length})
                  </span>
                </div>
                <span className="text-[11px] text-amber-700">
                  Human verification required
                </span>
              </div>

              <div className="space-y-2">
                {complaint.duplicateSuggestions.map((dup) => (
                  <div
                    key={dup.complaintId}
                    className="p-3.5 rounded-2xl bg-white border border-amber-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">
                          {dup.complaintId}
                        </span>
                        <span className="text-slate-600 font-medium">• {dup.title}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        <strong>Proximity:</strong> {dup.distanceMeters}m away •{' '}
                        <strong>Match:</strong> {dup.similarityScore}% • {dup.reason}
                      </div>
                      <div className="text-[11px]">
                        Current Status:{' '}
                        <strong
                          className={
                            dup.status === 'confirmed_duplicate'
                              ? 'text-purple-600'
                              : dup.status === 'rejected_unique'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }
                        >
                          {dup.status.replace('_', ' ').toUpperCase()}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleDuplicateAction(dup.complaintId, 'confirmed_duplicate')
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Confirm Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDuplicateAction(dup.complaintId, 'rejected_unique')
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Mark Unique
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Administrative Action Form */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Update Complaint Workflow & Department Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lifecycle Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Department:
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) =>
                    setSelectedDepartment(e.target.value as Department | 'Unassigned')
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Unassigned">Unassigned</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rejection reason if Rejected */}
            {selectedStatus === 'Rejected' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-red-700">
                  Rejection Reason (Required) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Private property boundary dispute; outside municipal right-of-way jurisdiction."
                  className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {/* Official Remark Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Official Remark / Work Order Update:
              </label>
              <textarea
                rows={2}
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Add official progress update, crew dispatch notes, or resolution confirmation..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500">
                Logged by: <strong className="text-slate-700">{officialName}</strong>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatusAndDept}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Status & Updates
                </button>
              </div>
            </div>
          </div>

          {/* History Log Timeline */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Complaint History & Timestamped Audit Trail
            </span>
            <div className="space-y-2">
              {complaint.statusHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.status}</span>
                    <span className="text-slate-500 text-[11px] ml-2">
                      by {item.updatedBy}
                    </span>
                    {item.remarks && (
                      <p className="text-slate-600 mt-0.5">{item.remarks}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
