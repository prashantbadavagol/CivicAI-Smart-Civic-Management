import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistanceMeters, detectHotspots } from './geo';
import { findDuplicateComplaints } from './duplicateDetector';
import { calculatePriorityHeuristic, mapCategoryToDepartment } from './priorityScorer';
import { Complaint } from '../types';

test('calculateHaversineDistanceMeters computes accurate distances', () => {
  // Distance between two points in central metro area ~ approx 111 meters per 0.001 deg lat
  const d = calculateHaversineDistanceMeters(40.7128, -74.0060, 40.7138, -74.0060);
  assert.ok(d >= 105 && d <= 120, `Expected ~111m, got ${d}`);

  // Same coordinates should have 0 distance
  const dZero = calculateHaversineDistanceMeters(40.7128, -74.0060, 40.7128, -74.0060);
  assert.equal(dZero, 0);
});

test('calculatePriorityHeuristic flags life-threatening issues as Critical', () => {
  const result = calculatePriorityHeuristic(
    'Live sparking wire dangling over walkway',
    'High voltage live wire fell down outside children school after rain, sparks flying near pedestrians',
    'Public Safety'
  );

  assert.equal(result.priority, 'Critical');
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
  assert.equal(result.isPublicSafetyRisk, true);
  assert.ok(result.explanation.includes('Immediate official inspection'));
  assert.equal(result.suggestedDepartment, 'Public Health & Safety');
});

test('calculatePriorityHeuristic assigns standard Medium to minor potholes', () => {
  const result = calculatePriorityHeuristic(
    'Small pothole on residential corner',
    'Minor road surface depression near curb, slows down vehicles slightly',
    'Road Damage'
  );

  assert.ok(result.priority === 'Medium' || result.priority === 'Low');
  assert.equal(result.isPublicSafetyRisk, false);
  assert.equal(result.suggestedDepartment, 'Public Works Department');
});

test('mapCategoryToDepartment routes categories correctly', () => {
  assert.equal(mapCategoryToDepartment('Garbage'), 'Sanitation & Solid Waste');
  assert.equal(mapCategoryToDepartment('Streetlight'), 'Electricity & Lighting');
  assert.equal(mapCategoryToDepartment('Waterlogging'), 'Water & Drainage Board');
});

test('findDuplicateComplaints detects close geographic and textual matches', () => {
  const mockExisting: Complaint[] = [
    {
      id: 'CIVIC-101',
      title: 'Massive open pothole outside Central School gate',
      description: 'Dangerous crater on 5th avenue road right in front of school entrance causing bike accidents',
      category: 'Road Damage',
      address: '5th Avenue, Central School District',
      latitude: 40.7128,
      longitude: -74.0060,
      priority: 'High',
      priorityScore: 75,
      priorityExplanation: 'School zone traffic hazard',
      isPublicSafetyRisk: false,
      aiSummary: 'Dangerous pothole outside school gate',
      actionBrief: {
        problemIdentified: 'Road crater',
        location: '5th Avenue',
        severity: 'High',
        possiblePublicImpact: 'Accidents',
        recommendedNextAction: 'Patch road',
        suggestedDepartment: 'Public Works Department',
      },
      duplicateSuggestions: [],
      assignedDepartment: 'Public Works Department',
      status: 'Submitted',
      officialRemarks: [],
      createdAt: '2026-10-28T10:00:00Z',
      updatedAt: '2026-10-28T10:00:00Z',
      statusHistory: [],
    },
    {
      id: 'CIVIC-102',
      title: 'Streetlight pole dark on 9th street',
      description: 'Street lights not working near church',
      category: 'Streetlight',
      address: '9th Street and Pine',
      latitude: 40.7500,
      longitude: -73.9900,
      priority: 'Low',
      priorityScore: 35,
      priorityExplanation: 'Dark corner',
      isPublicSafetyRisk: false,
      aiSummary: 'Dark street',
      actionBrief: {
        problemIdentified: 'Light failure',
        location: '9th Street',
        severity: 'Low',
        possiblePublicImpact: 'Low visibility',
        recommendedNextAction: 'Replace bulb',
        suggestedDepartment: 'Electricity & Lighting',
      },
      duplicateSuggestions: [],
      assignedDepartment: 'Electricity & Lighting',
      status: 'In Progress',
      officialRemarks: [],
      createdAt: '2026-10-28T11:00:00Z',
      updatedAt: '2026-10-28T11:00:00Z',
      statusHistory: [],
    },
  ];

  // Report that is nearly identical to CIVIC-101 in location (~40m away) and description
  const newReport = {
    title: 'Huge pothole and broken road near school entrance',
    description: 'Deep crater on 5th avenue outside central school, dangerous for students',
    category: 'Road Damage',
    latitude: 40.7131,
    longitude: -74.0062,
    address: '5th Ave & School Lane',
  };

  const duplicates = findDuplicateComplaints(newReport, mockExisting);
  assert.ok(duplicates.length >= 1, 'Should find at least 1 duplicate');
  assert.equal(duplicates[0].complaintId, 'CIVIC-101');
  assert.ok(duplicates[0].similarityScore >= 60, `Score should be >= 60, got ${duplicates[0].similarityScore}`);
  assert.ok(duplicates[0].distanceMeters <= 100, `Distance should be <= 100m, got ${duplicates[0].distanceMeters}`);
});

test('detectHotspots identifies concentrated clusters of complaints', () => {
  const clusteredComplaints: Complaint[] = [
    {
      id: 'C1',
      title: 'Overflowing dumpster at Market Square',
      description: 'Trash spilling everywhere',
      category: 'Garbage',
      address: 'Market Square Block 1',
      latitude: 40.7200,
      longitude: -74.0000,
      priority: 'High',
      priorityScore: 70,
      priorityExplanation: 'Waste pile',
      isPublicSafetyRisk: false,
      aiSummary: 'Garbage issue',
      actionBrief: {
        problemIdentified: 'Trash overflow',
        location: 'Market Square',
        severity: 'High',
        possiblePublicImpact: 'Health hazard',
        recommendedNextAction: 'Collect waste',
        suggestedDepartment: 'Sanitation & Solid Waste',
      },
      duplicateSuggestions: [],
      assignedDepartment: 'Sanitation & Solid Waste',
      status: 'Submitted',
      officialRemarks: [],
      createdAt: '2026-10-28T10:00:00Z',
      updatedAt: '2026-10-28T10:00:00Z',
      statusHistory: [],
    },
    {
      id: 'C2',
      title: 'Rotting garbage attracting stray dogs',
      description: 'Behind Market Square grocery store',
      category: 'Garbage',
      address: 'Market Square Block 2',
      latitude: 40.7205,
      longitude: -74.0005,
      priority: 'Medium',
      priorityScore: 50,
      priorityExplanation: 'Waste pile',
      isPublicSafetyRisk: false,
      aiSummary: 'Garbage issue',
      actionBrief: {
        problemIdentified: 'Trash overflow',
        location: 'Market Square',
        severity: 'Medium',
        possiblePublicImpact: 'Health hazard',
        recommendedNextAction: 'Collect waste',
        suggestedDepartment: 'Sanitation & Solid Waste',
      },
      duplicateSuggestions: [],
      assignedDepartment: 'Sanitation & Solid Waste',
      status: 'Submitted',
      officialRemarks: [],
      createdAt: '2026-10-28T10:30:00Z',
      updatedAt: '2026-10-28T10:30:00Z',
      statusHistory: [],
    },
    {
      id: 'C3',
      title: 'Commercial waste bin broken and spilling',
      description: 'Corner of Market Square and 3rd St',
      category: 'Garbage',
      address: 'Market Square Block 3',
      latitude: 40.7210,
      longitude: -74.0002,
      priority: 'Critical',
      priorityScore: 85,
      priorityExplanation: 'Hazardous waste spill',
      isPublicSafetyRisk: true,
      aiSummary: 'Garbage issue',
      actionBrief: {
        problemIdentified: 'Trash spill',
        location: 'Market Square',
        severity: 'Critical',
        possiblePublicImpact: 'Contamination',
        recommendedNextAction: 'Collect waste',
        suggestedDepartment: 'Sanitation & Solid Waste',
      },
      duplicateSuggestions: [],
      assignedDepartment: 'Sanitation & Solid Waste',
      status: 'Submitted',
      officialRemarks: [],
      createdAt: '2026-10-28T11:00:00Z',
      updatedAt: '2026-10-28T11:00:00Z',
      statusHistory: [],
    },
  ];

  const hotspots = detectHotspots(clusteredComplaints, 600, 2);
  assert.ok(hotspots.length >= 1, 'Should detect at least 1 cluster');
  assert.equal(hotspots[0].complaintCount, 3);
  assert.equal(hotspots[0].dominantCategory, 'Garbage');
  assert.equal(hotspots[0].criticalCount, 1);
  assert.ok(hotspots[0].calculatedPattern.includes('Multiple garbage disposal failures'));
});
