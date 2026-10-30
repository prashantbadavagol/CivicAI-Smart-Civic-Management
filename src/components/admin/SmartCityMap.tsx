import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Flame,
  Layers,
  Filter,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';
import { Complaint, ComplaintCategory, PriorityLevel, HotspotCluster } from '../../types';
import { CivicMap } from '../common/CivicMap';
import { detectHotspots } from '../../utils/geo';

interface SmartCityMapProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateHotspots: () => void;
}

export const SmartCityMap: React.FC<SmartCityMapProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateHotspots,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState(true);

  // Compute hotspots from active complaints
  const hotspots = useMemo(() => {
    return detectHotspots(complaints, 800, 2);
  }, [complaints]);

  // Filter complaints for map view
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
      return true;
    });
  }, [complaints, categoryFilter, priorityFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart City Spatial Map & Triage
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Displaying {filteredComplaints.length} geographic coordinates across metropolitan districts
          </p>
        </div>

        <button
          onClick={onNavigateHotspots}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Flame className="w-4 h-4 text-slate-950" />
          <span>View Hotspot Clusters ({hotspots.length})</span>
        </button>
      </div>

      {/* Map Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Priority Legend */}
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-500 uppercase text-[11px]">Priority Legend:</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span>Critical</span>
            </span>
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
              <span>High</span>
            </span>
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>Medium</span>
            </span>
            <span className="flex items-center space-x-1 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Low</span>
            </span>
          </div>
        </div>

        {/* Filters and Hotspot Toggle */}
        <div className="flex items-center space-x-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Drainage">Drainage</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Public Safety">Public Safety</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label className="flex items-center space-x-1.5 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded text-amber-600 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Hotspot Rings</span>
            </span>
          </label>
        </div>
      </div>

      {/* Main Interactive Leaflet Map */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-md">
        <CivicMap
          mode="display"
          complaints={filteredComplaints}
          onSelectComplaint={onSelectComplaint}
          hotspots={hotspots}
          showHotspots={showHotspots}
          className="h-[600px] w-full"
          center={[37.7780, -122.4150]}
          zoom={13}
        />
      </div>

      {/* Quick Hotspots Summary Bar below map */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Identified Spatial Density Clusters ({hotspots.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Calculated via Haversine Spatial Proximity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotspots.slice(0, 3).map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{h.name}</span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                    {h.complaintCount} reports
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {h.calculatedPattern}
                </p>
              </div>

              <div className="pt-2 border-t border-amber-200/60 text-[11px] flex items-center justify-between">
                <span className="text-amber-900 font-semibold">
                  Dominant: {h.dominantCategory}
                </span>
                <button
                  onClick={onNavigateHotspots}
                  className="text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  Analyze →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
