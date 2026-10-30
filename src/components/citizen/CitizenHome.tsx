import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Camera,
  MapPin,
  Sparkles,
  ShieldCheck,
  Search,
  Building,
  TrendingUp,
} from 'lucide-react';
import { Complaint } from '../../types';

interface CitizenHomeProps {
  complaints: Complaint[];
  onNavigateReport: () => void;
  onNavigateTrack: (complaintId?: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  complaints,
  onNavigateReport,
  onNavigateTrack,
}) => {
  const [trackingInput, setTrackingInput] = useState('');

  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');
  const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress');
  const recentResolved = resolvedComplaints.slice(0, 3);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      onNavigateTrack(trackingInput.trim());
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemini AI Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            From Civic Complaints <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              To Prioritized Public Action
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Report road damage, waterlogging, waste, or public hazards in seconds.
            Our Smart City AI analyzes severity, detects duplicate reports, and
            routes direct action briefs to municipal field teams.
          </p>

          {/* Action CTAs & Quick Search */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onNavigateReport}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Report a Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Track Input Bar */}
            <form onSubmit={handleTrackSubmit} className="flex-1 max-w-md flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. CIVIC-2026-1005)..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-24 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Track
                </button>
              </div>
            </form>
          </div>

          {/* Example tags for fast exploration */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span>Try sample complaints:</span>
            {['CIVIC-2026-1005', 'CIVIC-2026-1001', 'CIVIC-2026-1015'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigateTrack(id)}
                className="text-teal-400 hover:text-teal-300 underline font-mono cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live City Resolution Pulse Metrics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">City Resolution Pulse</h2>
            <p className="text-sm text-slate-500">Live operational transparency across metropolitan wards</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Reports Handled
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{complaints.length}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Logged across all districts</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Successfully Resolved
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                {resolvedComplaints.length}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({Math.round((resolvedComplaints.length / (complaints.length || 1)) * 100)}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Inspected & cleared by field crews</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Crew Actions
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-blue-600">
                {inProgressComplaints.length}
              </span>
              <span className="text-xs font-medium text-slate-500">In Progress</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Crews on-site resolving issues</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Resolution Speed
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">2.4</span>
              <span className="text-xs font-medium text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">From submission to completion</p>
          </div>
        </div>
      </section>

      {/* How CivicAI Works (Transparent 4-step explainer) */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How CivicAI Accelerates Action</h2>
          <p className="text-sm text-slate-600 mt-2">
            No endless bureaucratic queues. Advanced AI models triage, deduplicate, and prioritize
            your reports directly to municipal decision-makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">Citizen Reports</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed flex-1">
              Provide location pin, photo evidence, and brief problem description on your mobile or
              desktop browser.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">Gemini AI Triage</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed flex-1">
              AI detects categories, scores priority (0-100), flags public safety risks, and converts
              reports into concise briefs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">Duplicate Merging</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed flex-1">
              Geospatial algorithms cross-check existing neighborhood reports to group duplicates
              without dropping citizen voices.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">Action & Tracking</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed flex-1">
              Department crews dispatch to the site. Citizens track real-time progress, notes, and
              resolution proof online.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Public Resolutions Feed */}
      {recentResolved.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recently Resolved in Your City</h2>
              <p className="text-sm text-slate-500">
                Verified work completed by municipal response divisions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentResolved.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all"
              >
                {item.imageUrl && (
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </div>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-mono">{item.id}</span>
                      <span>{item.category}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.aiSummary}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[170px]">{item.address.split(',')[0]}</span>
                    </div>
                    <button
                      onClick={() => onNavigateTrack(item.id)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                    >
                      View Report →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
