import { Complaint, DuplicateCandidate } from '../types';
import { calculateHaversineDistanceMeters } from './geo';

/**
 * Tokenizes text into a set of normalized keywords, removing common stopwords
 */
function tokenize(text: string): Set<string> {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'are', 'was', 'were', 'it', 'this', 'that', 'there', 'from', 'by',
    'has', 'have', 'had', 'been', 'near', 'beside', 'front', 'behind', 'very',
    'please', 'help', 'our', 'road', 'street', 'area'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w))
  );
}

/**
 * Calculates Jaccard similarity coefficient between two token sets (0.0 to 1.0)
 */
function jaccardSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection++;
  });
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Evaluates duplicate probability between a target report and existing complaints
 */
export function findDuplicateComplaints(
  target: {
    id?: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string;
  },
  existingComplaints: Complaint[],
  thresholdScore: number = 55
): DuplicateCandidate[] {
  const targetTokens = tokenize(`${target.title} ${target.description}`);
  const candidates: DuplicateCandidate[] = [];

  for (const existing of existingComplaints) {
    if (target.id && existing.id === target.id) continue;
    if (existing.status === 'Rejected') continue;

    // Geographic distance
    const distMeters = calculateHaversineDistanceMeters(
      target.latitude,
      target.longitude,
      existing.latitude,
      existing.longitude
    );

    // Text similarity
    const existingTokens = tokenize(`${existing.title} ${existing.description}`);
    const textSim = jaccardSimilarity(targetTokens, existingTokens);

    // Category matching
    const sameCategory =
      target.category.toLowerCase().trim() ===
      existing.category.toLowerCase().trim();

    // Scoring computation
    // Distance factor (0 to 45 pts)
    let distScore = 0;
    if (distMeters <= 50) distScore = 45;
    else if (distMeters <= 150) distScore = 40;
    else if (distMeters <= 300) distScore = 32;
    else if (distMeters <= 600) distScore = 20;
    else if (distMeters <= 1200) distScore = 10;
    else distScore = 0;

    // Text semantic factor (0 to 40 pts)
    const textScore = Math.min(40, Math.round(textSim * 55));

    // Category factor (0 or 15 pts)
    const catScore = sameCategory ? 15 : 0;

    const totalScore = Math.min(100, Math.round(distScore + textScore + catScore));

    if (totalScore >= thresholdScore) {
      // Build human-explainable reason
      let reason = '';
      if (distMeters <= 100 && sameCategory && textSim >= 0.25) {
        reason = `Identical category (${existing.category}) reported just ${distMeters}m away with strongly matching keywords describing the same incident.`;
      } else if (distMeters <= 200 && sameCategory) {
        reason = `Same category issue reported within ${distMeters}m of this location with overlapping problem descriptions.`;
      } else if (textSim >= 0.45) {
        reason = `High textual similarity (${Math.round(textSim * 100)}% content overlap) within ${distMeters < 1000 ? distMeters + 'm' : (distMeters / 1000).toFixed(1) + 'km'}.`;
      } else {
        reason = `Proximity of ${distMeters}m with overlapping civic category and related keywords.`;
      }

      candidates.push({
        complaintId: existing.id,
        title: existing.title,
        similarityScore: totalScore,
        distanceMeters: distMeters,
        reason,
        status: 'pending_review',
      });
    }
  }

  // Sort descending by similarity score
  return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
}
