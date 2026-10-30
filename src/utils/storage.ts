import { Complaint, ComplaintStatus, Department, DuplicateCandidate, StatusHistoryItem } from '../types';
import { INITIAL_COMPLAINTS } from '../data/syntheticComplaints';

const STORAGE_KEY = 'civicai_complaints_v1';

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') {
    return INITIAL_COMPLAINTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read complaints from storage:', err);
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save complaints to storage:', err);
  }
}

export function getComplaintById(id: string): Complaint | undefined {
  const complaints = getStoredComplaints();
  const cleanId = id.trim().toUpperCase();
  return complaints.find(
    (c) => c.id.toUpperCase() === cleanId || c.id.toUpperCase().endsWith(cleanId)
  );
}

export function generateComplaintId(): string {
  const existing = getStoredComplaints();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const candidateId = `CIVIC-2026-${randomSuffix}`;
  if (existing.some((c) => c.id === candidateId)) {
    return generateComplaintId();
  }
  return candidateId;
}

export function addComplaint(complaint: Complaint): Complaint[] {
  const current = getStoredComplaints();
  const updated = [complaint, ...current];
  saveComplaints(updated);
  return updated;
}

export function updateComplaintStatus(
  id: string,
  newStatus: ComplaintStatus,
  updatedBy: string,
  remarks?: string,
  rejectionReason?: string
): { success: boolean; updatedComplaint?: Complaint } {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) return { success: false };

  const current = complaints[index];
  const now = new Date().toISOString();

  const newHistoryItem: StatusHistoryItem = {
    status: newStatus,
    timestamp: now,
    updatedBy: updatedBy || 'Municipal Official',
    remarks: remarks || (rejectionReason ? `Reason: ${rejectionReason}` : undefined),
  };

  const remarksList = [...current.officialRemarks];
  if (remarks) {
    remarksList.push(remarks);
  }
  if (rejectionReason) {
    remarksList.push(`Rejection reason: ${rejectionReason}`);
  }

  const updatedComplaint: Complaint = {
    ...current,
    status: newStatus,
    updatedAt: now,
    officialRemarks: remarksList,
    rejectionReason: rejectionReason || current.rejectionReason,
    statusHistory: [...current.statusHistory, newHistoryItem],
  };

  complaints[index] = updatedComplaint;
  saveComplaints(complaints);
  return { success: true, updatedComplaint };
}

export function assignComplaintDepartment(
  id: string,
  department: Department,
  updatedBy: string
): { success: boolean; updatedComplaint?: Complaint } {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) return { success: false };

  const current = complaints[index];
  const now = new Date().toISOString();

  // If status is currently 'Submitted' or 'Under Review', assigning automatically transitions to 'Assigned'
  let newStatus = current.status;
  const historyUpdates = [...current.statusHistory];

  if (current.status === 'Submitted' || current.status === 'Under Review') {
    newStatus = 'Assigned';
    historyUpdates.push({
      status: 'Assigned',
      timestamp: now,
      updatedBy: updatedBy || 'Admin Dispatcher',
      remarks: `Assigned to ${department}`,
    });
  }

  const updatedRemarks = [
    ...current.officialRemarks,
    `Assigned to ${department} by ${updatedBy}`,
  ];

  const updatedComplaint: Complaint = {
    ...current,
    assignedDepartment: department,
    status: newStatus,
    updatedAt: now,
    officialRemarks: updatedRemarks,
    statusHistory: historyUpdates,
  };

  complaints[index] = updatedComplaint;
  saveComplaints(complaints);
  return { success: true, updatedComplaint };
}

export function updateDuplicateStatus(
  complaintId: string,
  targetDuplicateId: string,
  action: 'confirmed_duplicate' | 'rejected_unique',
  updatedBy: string
): { success: boolean } {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return { success: false };

  const current = complaints[index];
  const now = new Date().toISOString();

  const updatedSuggestions = current.duplicateSuggestions.map((ds) => {
    if (ds.complaintId === targetDuplicateId) {
      return { ...ds, status: action };
    }
    return ds;
  });

  const remark =
    action === 'confirmed_duplicate'
      ? `Duplicate confirmed with ${targetDuplicateId} by ${updatedBy}.`
      : `Duplicate suggestion for ${targetDuplicateId} rejected as distinct incident by ${updatedBy}.`;

  const updatedComplaint: Complaint = {
    ...current,
    duplicateSuggestions: updatedSuggestions,
    updatedAt: now,
    officialRemarks: [...current.officialRemarks, remark],
  };

  complaints[index] = updatedComplaint;
  saveComplaints(complaints);
  return { success: true };
}

export function resetComplaintsToDemo(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
}
