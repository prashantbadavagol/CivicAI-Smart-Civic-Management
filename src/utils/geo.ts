import { Complaint, HotspotCluster, ComplaintCategory } from '../types';

/**
 * Calculates the great-circle distance between two coordinates in meters
 * using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats a distance in meters to a readable string (e.g. "120 m" or "1.4 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Detects geographic hotspots and spatial clusters of complaints.
 * Clusters complaints that are within proximityRadiusMeters (default 800m).
 * Clusters with minimumSize or more complaints are returned as hotspots.
 */
export function detectHotspots(
  complaints: Complaint[],
  proximityRadiusMeters: number = 800,
  minimumSize: number = 2
): HotspotCluster[] {
  // Only consider active/open or unresolved/recent complaints, or all active complaints
  const validComplaints = complaints.filter(
    (c) =>
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !isNaN(c.latitude) &&
      !isNaN(c.longitude) &&
      c.status !== 'Rejected'
  );

  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (let i = 0; i < validComplaints.length; i++) {
    const root = validComplaints[i];
    if (visited.has(root.id)) continue;

    const group: Complaint[] = [root];
    visited.add(root.id);

    for (let j = 0; j < validComplaints.length; j++) {
      if (i === j) continue;
      const candidate = validComplaints[j];
      if (visited.has(candidate.id)) continue;

      const dist = calculateHaversineDistanceMeters(
        root.latitude,
        root.longitude,
        candidate.latitude,
        candidate.longitude
      );

      if (dist <= proximityRadiusMeters) {
        group.push(candidate);
        visited.add(candidate.id);
      }
    }

    if (group.length >= minimumSize) {
      // Calculate cluster centroid
      const avgLat =
        group.reduce((sum, c) => sum + c.latitude, 0) / group.length;
      const avgLng =
        group.reduce((sum, c) => sum + c.longitude, 0) / group.length;

      // Determine dominant category
      const categoryCounts: Record<string, number> = {};
      group.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });

      let dominantCategory: ComplaintCategory = 'Other';
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantCategory = cat as ComplaintCategory;
        }
      }

      const criticalCount = group.filter((c) => c.priority === 'Critical').length;
      const highCount = group.filter((c) => c.priority === 'High').length;

      // Extract representative location name
      const addressSample =
        group[0]?.address.split(',')[0]?.trim() || 'Civic Corridor';
      const clusterName = `${addressSample} Vicinity`;

      // Formulate calculated pattern
      let patternDesc = `Cluster of ${group.length} civic reports detected within ${formatDistance(proximityRadiusMeters)}.`;
      if (dominantCategory === 'Garbage') {
        patternDesc = `Multiple garbage disposal failures (${maxCount} reports) concentrated in this vicinity, indicating missed municipal collection or dumping.`;
      } else if (dominantCategory === 'Waterlogging' || dominantCategory === 'Drainage') {
        patternDesc = `Repeated waterlogging and storm drainage overflow (${maxCount} reports) indicating localized pipe choke or low-elevation drainage deficit.`;
      } else if (dominantCategory === 'Road Damage') {
        patternDesc = `High concentration of road surface damage (${maxCount} potholes/craters) creating vehicle congestion and transit hazards.`;
      } else if (dominantCategory === 'Streetlight') {
        patternDesc = `Multiple dark spots and streetlight power failures (${maxCount} reports) spanning this roadway, impacting nighttime pedestrian safety.`;
      }

      // Suggested action
      let suggestedAction = `Dispatch integrated inspection team from ${dominantCategory} response division to conduct perimeter assessment.`;
      if (criticalCount > 0) {
        suggestedAction = `PRIORITY INTERVENTION: ${criticalCount} critical safety hazard(s) present. Deploy emergency road/drainage crews immediately.`;
      } else if (dominantCategory === 'Garbage') {
        suggestedAction = `Schedule dedicated compactor truck sweep and audit commercial waste disposal bins in this zone.`;
      } else if (dominantCategory === 'Drainage' || dominantCategory === 'Waterlogging') {
        suggestedAction = `Deploy high-capacity suction dewatering pumps and clear arterial stormwater channels before next precipitation.`;
      }

      clusters.push({
        id: `HOTSPOT-${clusters.length + 1}`,
        name: clusterName,
        centerLat: Number(avgLat.toFixed(5)),
        centerLng: Number(avgLng.toFixed(5)),
        radiusMeters: Math.min(proximityRadiusMeters, 1000),
        complaintCount: group.length,
        dominantCategory,
        criticalCount,
        highCount,
        complaintIds: group.map((c) => c.id),
        calculatedPattern: patternDesc,
        suggestedMunicipalAction: suggestedAction,
        isAlgorithmic: true,
      });
    }
  }

  // Sort clusters by urgency: critical counts first, then total counts
  return clusters.sort(
    (a, b) =>
      b.criticalCount * 3 + b.highCount * 2 + b.complaintCount -
      (a.criticalCount * 3 + a.highCount * 2 + a.complaintCount)
  );
}
