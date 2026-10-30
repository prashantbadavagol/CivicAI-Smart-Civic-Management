import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Clock,
  Building2,
  Flame,
  AlertTriangle,
  Loader2,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { Complaint, ComplaintCategory, MunicipalInsightReport } from '../../types';
import { detectHotspots } from '../../utils/geo';

interface AnalyticsDashboardProps {
  complaints: Complaint[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ complaints }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightReport, setInsightReport] = useState<MunicipalInsightReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const pending = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Assigned'
  ).length;

  // Compute hotspots
  const hotspots = detectHotspots(complaints, 800, 2);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Priority counts
  const priorityCounts = {
    Critical: complaints.filter((c) => c.priority === 'Critical').length,
    High: complaints.filter((c) => c.priority === 'High').length,
    Medium: complaints.filter((c) => c.priority === 'Medium').length,
    Low: complaints.filter((c) => c.priority === 'Low').length,
  };

  // Department counts
  const deptMap: Record<string, { total: number; resolved: number }> = {};
  complaints.forEach((c) => {
    const dept = c.assignedDepartment || 'Unassigned';
    if (!deptMap[dept]) deptMap[dept] = { total: 0, resolved: 0 };
    deptMap[dept].total += 1;
    if (c.status === 'Resolved') deptMap[dept].resolved += 1;
  });
  const sortedDepts = Object.entries(deptMap).sort((a, b) => b[1].total - a[1].total);

  // Generate AI Insights via server endpoint
  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaints: complaints.map((c) => ({
            id: c.id,
            category: c.category,
            priority: c.priority,
            status: c.status,
            address: c.address,
          })),
          hotspots: hotspots.map((h) => ({
            name: h.name,
            complaintCount: h.complaintCount,
            dominantCategory: h.dominantCategory,
            calculatedPattern: h.calculatedPattern,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report (Status ${response.status})`);
      }

      const data = await response.json();
      setInsightReport(data.report);
    } catch (err) {
      console.error('Error generating AI report:', err);
      setErrorMsg('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Civic Analytics & Insights
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Data-driven trends, department capacity analysis, and automated municipal intelligence
          </p>
        </div>

        <button
          onClick={handleGenerateAIReport}
          disabled={isGenerating}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Gemini Insights...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Municipal AI Insights Report</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* AI Generated Municipal Report Banner (if generated) */}
      {insightReport && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                  Gemini 3.8 Flash Municipal Intelligence Report
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  {insightReport.headline}
                </h3>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {new Date(insightReport.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Executive Brief
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
              {insightReport.executiveSummary}
            </p>
          </div>

          {/* Key Findings & Hotspot Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-teal-300 font-bold block uppercase text-[11px]">
                Key Empirical Patterns
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                {insightReport.keyFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-amber-300 font-bold block uppercase text-[11px]">
                Geographic Cluster Observations
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                {insightReport.hotspotObservations.map((obs, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Department Interventions */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Recommended Administrative Interventions
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insightReport.recommendedInterventions.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-teal-300">{rec.department}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.urgency === 'Immediate'
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-slate-200 mt-1 leading-relaxed">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Categories Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Complaints by Category</h3>
            <span className="text-xs text-slate-400">Total: {total}</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {sortedCategories.map(([cat, count]) => {
              const pct = Math.round((count / (total || 1)) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{cat}</span>
                    <span className="font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Priority Spread */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Complaints by Priority</h3>
            <span className="text-xs text-slate-400">AI Triage</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                label: 'Critical Priority',
                count: priorityCounts.Critical,
                color: 'bg-red-500',
                text: 'text-red-700',
              },
              {
                label: 'High Priority',
                count: priorityCounts.High,
                color: 'bg-amber-500',
                text: 'text-amber-700',
              },
              {
                label: 'Medium Priority',
                count: priorityCounts.Medium,
                color: 'bg-yellow-400',
                text: 'text-yellow-700',
              },
              {
                label: 'Low Priority',
                count: priorityCounts.Low,
                color: 'bg-emerald-500',
                text: 'text-emerald-700',
              },
            ].map((p) => {
              const pct = Math.round((p.count / (total || 1)) * 100);
              return (
                <div key={p.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{p.label}</span>
                    <span className={p.text}>
                      {p.count} issues ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Resolution Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Resolution Status</h3>
            <span className="text-xs text-slate-400">Lifecycle</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center">
            <span className="text-3xl font-extrabold text-emerald-600">
              {Math.round((resolved / (total || 1)) * 100)}%
            </span>
            <span className="text-xs font-bold text-slate-700">Overall Clearance Rate</span>
            <span className="text-[11px] text-slate-400">
              {resolved} completed • {inProgress} in progress • {pending} pending
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Resolved</span>
              <span className="font-bold text-emerald-600">{resolved}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>In Progress (Field Crews)</span>
              <span className="font-bold text-blue-600">{inProgress}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Pending Intake / Review</span>
              <span className="font-bold text-amber-600">{pending}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium pt-2 border-t border-slate-100">
              <span>Avg. Resolution Time</span>
              <span className="font-bold text-slate-900">2.4 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department-Wise Workload Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg">
          Department Capacity & Workload Distribution
        </h3>
        <p className="text-xs text-slate-500">
          Work volume and clearance velocity across 7 specialized municipal operational wings
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Municipal Department</th>
                <th className="py-3 px-4">Active & Logged</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Resolution Rate</th>
                <th className="py-3 px-4">Load Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDepts.map(([dept, data]) => {
                const rate = Math.round((data.resolved / (data.total || 1)) * 100);
                const shareOfTotal = Math.round((data.total / (total || 1)) * 100);
                return (
                  <tr key={dept} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{data.total}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{data.resolved}</td>
                    <td className="py-3 px-4 font-bold">{rate}%</td>
                    <td className="py-3 px-4 w-44">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${shareOfTotal * 2}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
