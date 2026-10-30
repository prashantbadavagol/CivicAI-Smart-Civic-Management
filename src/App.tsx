/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { AdminSidebar, AdminPage } from './components/layout/AdminSidebar';
import { CitizenHome } from './components/citizen/CitizenHome';
import { ReportProblemForm } from './components/citizen/ReportProblemForm';
import { TrackComplaintView } from './components/citizen/TrackComplaintView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AllComplaintsTable } from './components/admin/AllComplaintsTable';
import { AIIntelligenceCenter } from './components/admin/AIIntelligenceCenter';
import { SmartCityMap } from './components/admin/SmartCityMap';
import { HotspotDetectionView } from './components/admin/HotspotDetectionView';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { DepartmentManagement } from './components/admin/DepartmentManagement';
import { ComplaintDetailModal } from './components/admin/ComplaintDetailModal';
import { Complaint } from './types';
import { getStoredComplaints } from './utils/storage';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [portal, setPortal] = useState<'citizen' | 'admin'>('citizen');
  const [citizenPage, setCitizenPage] = useState<'home' | 'report' | 'track'>('home');
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [activeTrackingId, setActiveTrackingId] = useState<string>('');
  const [inspectedComplaint, setInspectedComplaint] = useState<Complaint | null>(null);

  // Load complaints from persistent local storage
  const reloadComplaints = () => {
    const list = getStoredComplaints();
    setComplaints(list);
  };

  useEffect(() => {
    reloadComplaints();
  }, []);

  const handleSelectComplaint = (complaint: Complaint) => {
    setInspectedComplaint(complaint);
  };

  const handleNavigateTrack = (complaintId?: string) => {
    if (complaintId) setActiveTrackingId(complaintId);
    setCitizenPage('track');
    setPortal('citizen');
  };

  const handleNavigateReport = () => {
    setCitizenPage('report');
    setPortal('citizen');
  };

  const criticalCount = complaints.filter((c) => c.priority === 'Critical').length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Global Header */}
      <Header
        currentPortal={portal}
        onPortalChange={(p) => setPortal(p)}
        activeCitizenPage={citizenPage}
        onCitizenNavigate={(cp) => setCitizenPage(cp)}
        onRefreshData={reloadComplaints}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {portal === 'admin' ? (
          <>
            {/* Admin Sidebar Navigation */}
            <AdminSidebar
              currentPage={adminPage}
              onPageChange={(page) => setAdminPage(page)}
              criticalCount={criticalCount}
              pendingCount={pendingCount}
            />

            {/* Admin Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {adminPage === 'dashboard' && (
                <AdminDashboard
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                  onNavigatePage={(p) => setAdminPage(p as AdminPage)}
                />
              )}
              {adminPage === 'complaints' && (
                <AllComplaintsTable
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                />
              )}
              {adminPage === 'ai-analysis' && (
                <AIIntelligenceCenter
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                  onRefreshData={reloadComplaints}
                />
              )}
              {adminPage === 'smart-map' && (
                <SmartCityMap
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                  onNavigateHotspots={() => setAdminPage('hotspots')}
                />
              )}
              {adminPage === 'hotspots' && (
                <HotspotDetectionView
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                />
              )}
              {adminPage === 'analytics' && (
                <AnalyticsDashboard complaints={complaints} />
              )}
              {adminPage === 'departments' && (
                <DepartmentManagement
                  complaints={complaints}
                  onSelectComplaint={handleSelectComplaint}
                  onNavigateComplaints={() => setAdminPage('complaints')}
                />
              )}
            </main>
          </>
        ) : (
          /* Citizen Portal Main Content */
          <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
            {citizenPage === 'home' && (
              <CitizenHome
                complaints={complaints}
                onNavigateReport={handleNavigateReport}
                onNavigateTrack={handleNavigateTrack}
              />
            )}
            {citizenPage === 'report' && (
              <ReportProblemForm
                onSuccess={(newC) => {
                  reloadComplaints();
                }}
                onNavigateTrack={handleNavigateTrack}
              />
            )}
            {citizenPage === 'track' && (
              <TrackComplaintView
                initialComplaintId={activeTrackingId}
                onNavigateReport={handleNavigateReport}
              />
            )}
          </main>
        )}
      </div>

      {/* Global Complaint Details Inspection Modal */}
      {inspectedComplaint && (
        <ComplaintDetailModal
          complaint={inspectedComplaint}
          onClose={() => setInspectedComplaint(null)}
          onComplaintUpdated={() => {
            reloadComplaints();
            // Refresh inspected item
            const refreshed = getStoredComplaints().find((c) => c.id === inspectedComplaint.id);
            setInspectedComplaint(refreshed || null);
          }}
        />
      )}
    </div>
  );
}
