import React, { useMemo } from 'react';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, HotspotCluster } from '../../types';
import { detectHotspots } from '../../utils/geo';

interface HotspotDetectionViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const HotspotDetectionView: React.FC<HotspotDetectionViewProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  // Compute hotspots from complaints
  const hotspots: HotspotCluster[] = useMemo(() => {
    return detectHotspots(complaints, 800, 2);
  }, [complaints]);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-2">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>Spatial Density Clustering & Chronic Problem Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Civic Hotspot Detection & Pattern Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Identifies concentrated geographical clusters where multiple citizen reports indicate an
          underlying infrastructure failure or operational bottleneck.
        </p>
      </div>

      {/* Methodology Badge: Distinguish Algorithmic Clustering from AI Interpretation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
          <Cpu className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-blue-950 font-bold block">
              1. Algorithmic Geospatial Clustering (Deterministic Math)
            </strong>
            <p className="text-blue-800 leading-relaxed">
              Spatial boundary grouping uses the <strong>Haversine Great-Circle formula</strong> with a
              fixed 800-meter radius threshold. It objectively groups nearby complaints without AI
              hallucination.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
          <Sparkles className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-teal-950 font-bold block">
              2. AI Interpretation & Municipal Interventions
            </strong>
            <p className="text-teal-800 leading-relaxed">
              The AI Intelligence Engine evaluates cluster patterns to suggest targeted engineering
              actions (e.g., suction dewatering pumps vs road resurfacing vs compactor sweeps).
            </p>
          </div>
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Active Geographic Hotspots Detected ({hotspots.length})
          </h2>
          <span className="text-xs text-slate-500">Sorted by critical severity and volume</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotspots.map((h, idx) => {
            const hasCritical = h.criticalCount > 0;
            const clusterComplaints = complaints.filter((c) =>
              h.complaintIds.includes(c.id)
            );

            return (
              <div
                key={h.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-sm flex flex-col justify-between space-y-5 transition-all ${
                  hasCritical
                    ? 'border-red-200 ring-1 ring-red-300/40 bg-red-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          hasCritical
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{h.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Center: {h.centerLat.toFixed(4)}, {h.centerLng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {h.complaintCount} Reports
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Dominant Category
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block truncate">
                        {h.dominantCategory}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Critical Issues
                      </span>
                      <span
                        className={`font-bold mt-0.5 block ${
                          h.criticalCount > 0 ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {h.criticalCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        High Priority
                      </span>
                      <span className="font-bold text-amber-600 mt-0.5 block">
                        {h.highCount}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Pattern (Deterministic) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>Calculated Geographic Pattern:</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {h.calculatedPattern}
                    </p>
                  </div>

                  {/* AI Suggested Municipal Intervention */}
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Operational Recommendation:</span>
                    </div>
                    <p className="text-teal-950 font-medium leading-relaxed">
                      {h.suggestedMunicipalAction}
                    </p>
                  </div>

                  {/* Complaint List inside this Hotspot */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Associated Complaints ({clusterComplaints.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {clusterComplaints.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectComplaint(c)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-2 truncate max-w-[280px]">
                            <span className="font-mono font-bold text-slate-700 text-[11px]">
                              {c.id}
                            </span>
                            <span className="text-slate-800 font-medium truncate">{c.title}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                              c.priority === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : c.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Radius: ~{h.radiusMeters}m</span>
                  <button
                    onClick={() => onSelectComplaint(clusterComplaints[0])}
                    className="font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Inspect Lead Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
