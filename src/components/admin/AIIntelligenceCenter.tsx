import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Building2,
  FileCheck,
  Flame,
  Info,
} from 'lucide-react';
import { Complaint, DuplicateCandidate } from '../../types';
import { updateDuplicateStatus } from '../../utils/storage';

interface AIIntelligenceCenterProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onRefreshData: () => void;
}

export const AIIntelligenceCenter: React.FC<AIIntelligenceCenterProps> = ({
  complaints,
  onSelectComplaint,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'duplicates' | 'priority' | 'briefs'>('duplicates');

  // Find all complaints with duplicate suggestions
  const complaintsWithDuplicates = complaints.filter(
    (c) => c.duplicateSuggestions && c.duplicateSuggestions.length > 0
  );

  // Critical public safety complaints
  const criticalComplaints = complaints.filter((c) => c.priority === 'Critical');

  const handleResolveDuplicate = (
    complaintId: string,
    targetDupId: string,
    action: 'confirmed_duplicate' | 'rejected_unique'
  ) => {
    updateDuplicateStatus(complaintId, targetDupId, action, 'AI Intelligence Supervisor');
    onRefreshData();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Gemini AI Intelligence Engine • Civic Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Triage & Deduplication Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explainable priority scoring, geospatial duplicate reconciliation, and human-in-the-loop validation
          </p>
        </div>

        {/* Tab selection */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'duplicates'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Duplicate Queue ({complaintsWithDuplicates.length})
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'priority'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safety Triage ({criticalComplaints.length})
          </button>
          <button
            onClick={() => setActiveTab('briefs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'briefs'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action Briefs
          </button>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">CivicAI Advisory Governance Rule:</strong>
          All AI recommendations (priority level, category detection, duplicate grouping) are
          advisory. In accordance with government safety guidelines, municipal officers retain full
          authority to confirm, override, or reject AI decisions.
        </div>
      </div>

      {/* TAB 1: DUPLICATE RESOLUTION QUEUE */}
      {activeTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Geospatial & Semantic Duplicate Detection
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complaints submitted within 1.2km exhibiting overlapping keywords or categories. Officials
              can confirm duplicates to prevent duplicate field crew dispatch.
            </p>

            <div className="mt-6 space-y-6">
              {complaintsWithDuplicates.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No active complaints currently have unreviewed duplicate candidates.
                </div>
              ) : (
                complaintsWithDuplicates.map((primary) => (
                  <div
                    key={primary.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                  >
                    {/* Primary Complaint Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                            {primary.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {primary.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{primary.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">📍 {primary.address}</p>
                      </div>

                      <button
                        onClick={() => onSelectComplaint(primary)}
                        className="self-start sm:self-auto text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Inspect Primary Report →
                      </button>
                    </div>

                    {/* Candidate Matches */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Flagged Matching Reports:
                      </span>

                      {primary.duplicateSuggestions.map((dup) => {
                        const targetItem = complaints.find((c) => c.id === dup.complaintId);
                        return (
                          <div
                            key={dup.complaintId}
                            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                          >
                            <div className="space-y-1 max-w-xl">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-slate-800 text-xs">
                                  {dup.complaintId}
                                </span>
                                <span className="text-xs text-slate-700 font-semibold">
                                  {dup.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium">
                                <strong>AI Rationale:</strong> {dup.reason}
                              </p>
                              <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-0.5">
                                <span>Distance: <strong>{dup.distanceMeters}m</strong></span>
                                <span>•</span>
                                <span>Similarity Score: <strong>{dup.similarityScore}%</strong></span>
                                <span>•</span>
                                <span>
                                  Status:{' '}
                                  <strong
                                    className={
                                      dup.status === 'confirmed_duplicate'
                                        ? 'text-purple-600 font-bold'
                                        : dup.status === 'rejected_unique'
                                        ? 'text-emerald-600 font-bold'
                                        : 'text-amber-600 font-bold'
                                    }
                                  >
                                    {dup.status.replace('_', ' ').toUpperCase()}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            {/* Human Action Controls */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                onClick={() =>
                                  handleResolveDuplicate(
                                    primary.id,
                                    dup.complaintId,
                                    'confirmed_duplicate'
                                  )
                                }
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  dup.status === 'confirmed_duplicate'
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                                }`}
                              >
                                Confirm Duplicate
                              </button>
                              <button
                                onClick={() =>
                                  handleResolveDuplicate(
                                    primary.id,
                                    dup.complaintId,
                                    'rejected_unique'
                                  )
                                }
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  dup.status === 'rejected_unique'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                Mark Unique
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CRITICAL SAFETY AUDIT */}
      {activeTab === 'priority' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Critical Public Safety Escalation Queue
            </h3>
            <p className="text-xs text-slate-500">
              Complaints scored at or above 80/100 or flagged with hazardous life-safety conditions requiring
              immediate human review.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {criticalComplaints.map((crit) => (
                <div
                  key={crit.id}
                  className="bg-red-50/50 border border-red-200 rounded-2xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-red-900">{crit.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">
                        SCORE: {crit.priorityScore}/100
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-2">{crit.title}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{crit.description}</p>

                    <div className="mt-3 p-3 rounded-xl bg-white border border-red-200 text-xs text-red-900">
                      <strong>AI Safety Explanation:</strong> {crit.priorityExplanation}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">📍 {crit.address.split(',')[0]}</span>
                    <button
                      onClick={() => onSelectComplaint(crit)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Open Urgent Triage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTION BRIEFS */}
      {activeTab === 'briefs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">
              AI Action Briefs for Municipal Field Teams
            </h3>
            <p className="text-xs text-slate-500">
              Concise operational digests generated by Gemini 3.8 Flash, recommending specific
              actions and departments for fast crew deployment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {complaints.slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-700">{c.id}</span>
                    <span className="font-bold text-teal-700">{c.category}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div>
                      <strong className="text-slate-500 block text-[10px] uppercase">
                        Problem Identified
                      </strong>
                      <span className="text-slate-800 font-medium">
                        {c.actionBrief?.problemIdentified || c.title}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-500 block text-[10px] uppercase">
                        Recommended Next Action
                      </strong>
                      <span className="text-teal-900 font-medium">
                        {c.actionBrief?.recommendedNextAction || 'Dispatch field crew'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-500 block text-[10px] uppercase">
                        Department Responsible
                      </strong>
                      <span className="text-blue-700 font-bold">
                        {c.actionBrief?.suggestedDepartment || c.assignedDepartment}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View Full Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
