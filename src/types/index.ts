export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ComplaintCategory =
  | 'Road Damage'
  | 'Waterlogging'
  | 'Garbage'
  | 'Streetlight'
  | 'Drainage'
  | 'Water Supply'
  | 'Public Safety'
  | 'Other';

export type Department =
  | 'Public Works Department'
  | 'Sanitation & Solid Waste'
  | 'Traffic & Road Safety'
  | 'Water & Drainage Board'
  | 'Public Health & Safety'
  | 'Electricity & Lighting'
  | 'Civic Administration';

export interface StatusHistoryItem {
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  remarks?: string;
}

export interface DuplicateCandidate {
  complaintId: string;
  title: string;
  similarityScore: number; // 0 - 100
  distanceMeters: number;
  reason: string;
  status: 'pending_review' | 'confirmed_duplicate' | 'rejected_unique';
}

export interface AIActionBrief {
  problemIdentified: string;
  location: string;
  severity: string;
  possiblePublicImpact: string;
  recommendedNextAction: string;
  suggestedDepartment: Department;
}

export interface AIAnalysisResult {
  detectedCategory: ComplaintCategory;
  summary: string;
  priorityLevel: PriorityLevel;
  priorityScore: number; // 0 - 100
  priorityExplanation: string;
  isPublicSafetyRisk: boolean;
  actionBrief: AIActionBrief;
  duplicateCandidates: DuplicateCandidate[];
}

export interface Complaint {
  id: string; // e.g. CIVIC-2026-1042
  title: string;
  description: string;
  category: ComplaintCategory;
  imageUrl?: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  priorityScore: number;
  priorityExplanation: string;
  isPublicSafetyRisk: boolean;
  aiSummary: string;
  actionBrief: AIActionBrief;
  duplicateSuggestions: DuplicateCandidate[];
  assignedDepartment: Department | 'Unassigned';
  status: ComplaintStatus;
  officialRemarks: string[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
  reporterName?: string; // Stored for admin review, omitted in citizen tracking
  reporterPhone?: string;
}

export interface HotspotCluster {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  complaintCount: number;
  dominantCategory: ComplaintCategory;
  criticalCount: number;
  highCount: number;
  complaintIds: string[];
  calculatedPattern: string;
  suggestedMunicipalAction: string;
  isAlgorithmic: true;
}

export interface MunicipalInsightReport {
  generatedAt: string;
  headline: string;
  executiveSummary: string;
  keyFindings: string[];
  hotspotObservations: string[];
  recommendedInterventions: {
    department: Department;
    action: string;
    urgency: 'Immediate' | 'Within 48h' | 'Planned Work';
  }[];
}
