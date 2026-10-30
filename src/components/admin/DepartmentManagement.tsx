import React from 'react';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Phone,
} from 'lucide-react';
import { Complaint, Department } from '../../types';

interface DepartmentManagementProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateComplaints: () => void;
}

const DEPARTMENTS_DATA: {
  name: Department;
  head: string;
  phone: string;
  crewCount: number;
  slaTargetHours: number;
}[] = [
  {
    name: 'Public Works Department',
    head: 'Chief Engineer Marcus Drake',
    phone: 'Ext. 401',
    crewCount: 8,
    slaTargetHours: 48,
  },
  {
    name: 'Sanitation & Solid Waste',
    head: 'Director Elena Rostova',
    phone: 'Ext. 402',
    crewCount: 14,
    slaTargetHours: 24,
  },
  {
    name: 'Traffic & Road Safety',
    head: 'Capt. Sarah Patel',
    phone: 'Ext. 403',
    crewCount: 6,
    slaTargetHours: 12,
  },
  {
    name: 'Water & Drainage Board',
    head: 'Superintendent Liam Thorne',
    phone: 'Ext. 404',
    crewCount: 10,
    slaTargetHours: 24,
  },
  {
    name: 'Electricity & Lighting',
    head: 'Lead Electrician David Wu',
    phone: 'Ext. 405',
    crewCount: 5,
    slaTargetHours: 36,
  },
  {
    name: 'Public Health & Safety',
    head: 'Officer Raymond Vance',
    phone: 'Ext. 406',
    crewCount: 4,
    slaTargetHours: 6,
  },
  {
    name: 'Civic Administration',
    head: 'City Registrar Amanda Cole',
    phone: 'Ext. 407',
    crewCount: 3,
    slaTargetHours: 72,
  },
];

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateComplaints,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Department Operations & Resource Allocation
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor service level agreement (SLA) targets, crew deployments, and active workload across
          all 7 municipal divisions
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS_DATA.map((dept) => {
          const deptComplaints = complaints.filter(
            (c) => c.assignedDepartment === dept.name
          );
          const activeCount = deptComplaints.filter(
            (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
          ).length;
          const resolvedCount = deptComplaints.filter((c) => c.status === 'Resolved').length;
          const criticalCount = deptComplaints.filter((c) => c.priority === 'Critical').length;
          const resolutionRate = Math.round(
            (resolvedCount / (deptComplaints.length || 1)) * 100
          );

          return (
            <div
              key={dept.name}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">{dept.name}</span>
                  </div>

                  {criticalCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 animate-pulse">
                      {criticalCount} Critical
                    </span>
                  )}
                </div>

                {/* Supervisor info */}
                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Lead: <strong className="text-slate-800">{dept.head}</strong>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{dept.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{dept.crewCount} Field Crews</span>
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Active
                    </span>
                    <span className="font-bold text-blue-600 text-base mt-0.5 block">
                      {activeCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Resolved
                    </span>
                    <span className="font-bold text-emerald-600 text-base mt-0.5 block">
                      {resolvedCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      SLA Target
                    </span>
                    <span className="font-bold text-slate-800 text-base mt-0.5 block">
                      {dept.slaTargetHours}h
                    </span>
                  </div>
                </div>

                {/* Resolution Progress Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Resolution Compliance</span>
                    <span className="font-bold text-slate-800">{resolutionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${resolutionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{deptComplaints.length} Total Assigned</span>
                <button
                  onClick={onNavigateComplaints}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Filter Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
