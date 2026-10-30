import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Upload,
  ArrowRight,
  Info,
  ShieldAlert,
  Loader2,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { Complaint, ComplaintCategory, AIAnalysisResult } from '../../types';
import { CivicMap } from '../common/CivicMap';
import { addComplaint, generateComplaintId, getStoredComplaints } from '../../utils/storage';

interface ReportProblemFormProps {
  onSuccess: (complaint: Complaint) => void;
  onNavigateTrack: (complaintId: string) => void;
}

const CATEGORIES: { id: ComplaintCategory; label: string; icon: string; desc: string }[] = [
  { id: 'Road Damage', label: 'Road Damage', icon: '🚧', desc: 'Potholes, cracks, broken curbs, sunken trenches' },
  { id: 'Waterlogging', label: 'Waterlogging', icon: '🌊', desc: 'Street flooding, submerged pathways, puddles' },
  { id: 'Garbage', label: 'Garbage', icon: '🗑️', desc: 'Overflowing bins, uncollected waste, illegal dumping' },
  { id: 'Streetlight', label: 'Streetlight', icon: '💡', desc: 'Dark poles, flickering lamps, broken fixtures' },
  { id: 'Drainage', label: 'Drainage', icon: '🚰', desc: 'Choked storm drains, sewage overflow, broken grates' },
  { id: 'Water Supply', label: 'Water Supply', icon: '💧', desc: 'Burst mains, dirty tap water, severe low pressure' },
  { id: 'Public Safety', label: 'Public Safety', icon: '⚠️', desc: 'Live wires, open manholes, missing stop signs' },
  { id: 'Other', label: 'Other', icon: '📋', desc: 'General civic inquiries or non-standard infrastructure' },
];

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Pothole Crater',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Overflowing Waste',
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Street Flooding',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Exposed Cable Hazard',
    url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
  },
];

const DISTRICT_PRESETS = [
  { name: 'Downtown Market Square', lat: 37.7812, lng: -122.4082, address: '420 Market Square, Downtown' },
  { name: 'Northridge Boulevard', lat: 37.7925, lng: -122.4215, address: '810 Northridge Blvd, Northridge' },
  { name: 'Oakwood Residential', lat: 37.7652, lng: -122.4325, address: '1250 Oakwood Avenue, Oakwood' },
  { name: 'Civic Center Plaza', lat: 37.7765, lng: -122.4175, address: '350 Civic Center Plaza' },
];

export const ReportProblemForm: React.FC<ReportProblemFormProps> = ({
  onSuccess,
  onNavigateTrack,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Road Damage');
  const [address, setAddress] = useState('420 Market Square, Downtown');
  const [latitude, setLatitude] = useState(37.7812);
  const [longitude, setLongitude] = useState(-122.4082);
  const [imageUrl, setImageUrl] = useState('');
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCustomFilePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetDistrict = (preset: typeof DISTRICT_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setAddress(preset.address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both a title and a detailed description of the problem.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setSubmitStep('Initiating Gemini AI Intelligence Engine...');

    try {
      const existingComplaints = getStoredComplaints();

      setSubmitStep('Analyzing problem description and categorizing...');

      // Call server endpoint
      const response = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          address,
          latitude,
          longitude,
          existingComplaints,
        }),
      });

      setSubmitStep('Cross-referencing neighborhood reports for duplicates & scoring priority...');

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      const analysis: AIAnalysisResult = data.analysis;

      setSubmitStep('Generating municipal action brief & saving complaint...');

      const newId = generateComplaintId();
      const now = new Date().toISOString();

      const newComplaint: Complaint = {
        id: newId,
        title: title.trim(),
        description: description.trim(),
        category: analysis.detectedCategory || category,
        imageUrl: imageUrl || undefined,
        address: address.trim(),
        latitude,
        longitude,
        priority: analysis.priorityLevel,
        priorityScore: analysis.priorityScore,
        priorityExplanation: analysis.priorityExplanation,
        isPublicSafetyRisk: analysis.isPublicSafetyRisk,
        aiSummary: analysis.summary,
        actionBrief: analysis.actionBrief,
        duplicateSuggestions: analysis.duplicateCandidates || [],
        assignedDepartment: analysis.actionBrief?.suggestedDepartment || 'Unassigned',
        status: 'Submitted',
        officialRemarks: ['Complaint logged into municipal intake queue.'],
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: 'Submitted',
            timestamp: now,
            updatedBy: 'Citizen Reporter',
            remarks: 'Submitted via Citizen Portal',
          },
          {
            status: 'Under Review',
            timestamp: now,
            updatedBy: 'CivicAI Automated Triage',
            remarks: `AI scored priority as ${analysis.priorityLevel} (${analysis.priorityScore}/100)`,
          },
        ],
      };

      // If assigned department suggested, automatically mark Assigned
      if (analysis.actionBrief?.suggestedDepartment) {
        newComplaint.status = 'Assigned';
        newComplaint.statusHistory.push({
          status: 'Assigned',
          timestamp: now,
          updatedBy: 'Automated Dispatch',
          remarks: `Routed to ${analysis.actionBrief.suggestedDepartment}`,
        });
      }

      // Persist in storage
      addComplaint(newComplaint);
      setCreatedComplaint(newComplaint);
      onSuccess(newComplaint);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg('Failed to process complaint. Please try again or check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Road Damage');
    setImageUrl('');
    setCustomFilePreview(null);
    setCreatedComplaint(null);
    setErrorMsg(null);
  };

  // If successfully submitted, display confirmation & AI breakdown
  if (createdComplaint) {
    const isCritical = createdComplaint.priority === 'Critical';
    const hasDuplicates = createdComplaint.duplicateSuggestions.length > 0;

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-6">
        {/* Success Confirmation Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Complaint Successfully Registered
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
              {createdComplaint.id}
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your civic report has been analyzed by our AI intelligence engine and routed to municipal
              authorities.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTrack(createdComplaint.id)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Track Complaint Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetForm}
              className="inline-flex items-center space-x-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Submit Another Report</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Results Breakdown */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">CivicAI Analysis Results</h3>
                <p className="text-xs text-slate-500">Automated triage generated for municipal officials</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  createdComplaint.priority === 'Critical'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : createdComplaint.priority === 'High'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : createdComplaint.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {createdComplaint.priority} Priority ({createdComplaint.priorityScore}/100)
              </span>
            </div>
          </div>

          {/* Public Safety Warning if Critical */}
          {createdComplaint.isPublicSafetyRisk && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-3">
              <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-sm block text-red-950">
                  Critical Public Safety Alert Triggered
                </span>
                This complaint contains urgent safety indicators. It has been marked for immediate
                human official review and priority dispatch.
              </div>
            </div>
          )}

          {/* Category & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Detected Category
              </span>
              <div className="text-base font-bold text-slate-800 mt-1 flex items-center space-x-2">
                <span>{createdComplaint.category}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assigned to: <strong className="text-slate-700">{createdComplaint.assignedDepartment}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Priority Explainability
              </span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {createdComplaint.priorityExplanation}
              </p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
              AI Action Brief
            </span>
            <p className="text-sm text-slate-800 font-medium">"{createdComplaint.aiSummary}"</p>
            <p className="text-xs text-slate-600 mt-2">
              <strong>Recommended Action:</strong>{' '}
              {createdComplaint.actionBrief?.recommendedNextAction || 'Field inspection'}
            </p>
          </div>

          {/* Duplicate Detection Alert if Candidates Found */}
          {hasDuplicates && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Existing Nearby Reports Detected ({createdComplaint.duplicateSuggestions.length})</span>
              </div>
              <p className="text-xs text-amber-800">
                Our spatial engine detected an active report describing a similar issue in this immediate
                vicinity. Your complaint is linked so officials can track aggregate impact without losing your submission.
              </p>
              <div className="pt-1">
                {createdComplaint.duplicateSuggestions.slice(0, 2).map((dup) => (
                  <div
                    key={dup.complaintId}
                    className="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 text-xs text-slate-800 flex items-center justify-between mt-1.5"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{dup.complaintId}</span>:{' '}
                      {dup.title}
                      <span className="text-slate-500 block text-[11px] mt-0.5">{dup.reason}</span>
                    </div>
                    <span className="text-amber-800 font-bold ml-2 text-xs">
                      {dup.similarityScore}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Problem
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit details and photos of damaged roads, broken streetlights, waterlogging, or hazards.
          CivicAI automatically prioritizes and routes your report.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Complaint Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Complaint Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep pothole breaking tires on 5th Ave near Metro entrance"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Step 2: Problem Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400">{description.length} chars</span>
          </div>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, exact landmarks, how many days the issue has persisted, and if there is danger to children or vehicles..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Step 3: Category Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800">
              Select Category
            </label>
            <span className="text-xs text-teal-600 font-medium flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              AI will verify on submission
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg">{cat.icon}</div>
                  <div className="font-bold text-xs text-slate-800 mt-1">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Photo Evidence Upload or Preset */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Photo Evidence (Optional but recommended)
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* File Upload Box */}
            <label className="w-full sm:w-1/2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-teal-50/30 transition-all text-center">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Upload Photo from Device</span>
              <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Quick Preset Civic Photos */}
            <div className="w-full sm:w-1/2 space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Or select sample civic photo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLE_PHOTOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setCustomFilePreview(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left truncate transition-colors cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Preview */}
          {(customFilePreview || imageUrl) && (
            <div className="relative mt-2 rounded-xl overflow-hidden h-40 bg-slate-100 border border-slate-200 max-w-sm">
              <img
                src={customFilePreview || imageUrl}
                alt="Complaint evidence"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setCustomFilePreview(null);
                }}
                className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white text-[11px] font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Step 5: Location Picker & Map */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label className="block text-sm font-bold text-slate-800">
              Location & Map Pin <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 self-center">Quick district preset:</span>
            {DISTRICT_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPresetDistrict(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address or landmark (e.g. 420 Market Square, Downtown)"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />

          {/* Interactive Leaflet Location Picker */}
          <CivicMap
            mode="picker"
            pickerLat={latitude}
            pickerLng={longitude}
            onLocationPick={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            className="h-64 w-full"
            center={[latitude, longitude]}
          />
        </div>

        {/* Submit Button & Real-time Progress */}
        <div className="pt-4 border-t border-slate-100">
          {isSubmitting ? (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span>Processing with CivicAI Engine...</span>
              </div>
              <p className="text-xs text-teal-700 animate-pulse">{submitStep}</p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-teal-200" />
              <span>Submit Complaint for AI Triage</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
