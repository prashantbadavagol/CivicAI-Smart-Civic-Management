import { PriorityLevel, Department, ComplaintCategory } from '../types';

export interface PriorityEvaluation {
  priority: PriorityLevel;
  score: number; // 0 to 100
  isPublicSafetyRisk: boolean;
  explanation: string;
  suggestedDepartment: Department;
}

const CRITICAL_KEYWORDS = [
  'live wire',
  'electrocution',
  'sparking',
  'open manhole',
  'sinkhole',
  'cave-in',
  'collapsed',
  'gas leak',
  'explosion',
  'hospital',
  'ambulance',
  'death',
  'deadly',
  'casualty',
  'severed',
  'flooded hospital',
  'trapped',
  'danger to life',
  'poisonous',
  'toxic',
];

const HIGH_KEYWORDS = [
  'severe',
  'major',
  'accident',
  'injur',
  'broken glass',
  'school',
  'blocked lane',
  'heavy traffic',
  'overflowing sewage',
  'water main burst',
  'pitch dark',
  'dark junction',
  'stray dogs',
  'contamination',
  'foul smell',
  'elderly',
  'urgent',
];

const MEDIUM_KEYWORDS = [
  'pothole',
  'garbage',
  'trash',
  'dump',
  'drain',
  'clogged',
  'flickering',
  'leak',
  'standing water',
  'low pressure',
  'speed breaker',
  'footpath',
];

export function mapCategoryToDepartment(category: ComplaintCategory | string): Department {
  switch (category) {
    case 'Road Damage':
      return 'Public Works Department';
    case 'Waterlogging':
    case 'Drainage':
      return 'Water & Drainage Board';
    case 'Garbage':
      return 'Sanitation & Solid Waste';
    case 'Streetlight':
      return 'Electricity & Lighting';
    case 'Water Supply':
      return 'Water & Drainage Board';
    case 'Public Safety':
      return 'Public Health & Safety';
    case 'Traffic & Road Safety':
      return 'Traffic & Road Safety';
    default:
      return 'Civic Administration';
  }
}

/**
 * Evaluates priority score, level, explainability and safety flags
 */
export function calculatePriorityHeuristic(
  title: string,
  description: string,
  category: ComplaintCategory | string
): PriorityEvaluation {
  const combined = `${title} ${description}`.toLowerCase();

  let baseScore = 30; // Default baseline
  const factorExplanations: string[] = [];

  // 1. Check for immediate critical public safety risk
  const criticalFound = CRITICAL_KEYWORDS.filter((kw) => combined.includes(kw));
  const isPublicSafetyRisk =
    criticalFound.length > 0 ||
    category === 'Public Safety' ||
    combined.includes('danger') ||
    combined.includes('hazard');

  if (criticalFound.length > 0) {
    baseScore += 50;
    factorExplanations.push(
      `Detected high-danger safety keywords (${criticalFound.slice(0, 2).join(', ')}) posing imminent risk to citizen safety.`
    );
  }

  // 2. High severity keywords
  const highFound = HIGH_KEYWORDS.filter((kw) => combined.includes(kw));
  if (highFound.length > 0) {
    baseScore += Math.min(25, highFound.length * 10);
    factorExplanations.push(
      `Mentions elevated impact factors (${highFound.slice(0, 2).join(', ')}) affecting public commute or health.`
    );
  }

  // 3. Medium severity keywords
  const medFound = MEDIUM_KEYWORDS.filter((kw) => combined.includes(kw));
  if (medFound.length > 0 && criticalFound.length === 0 && highFound.length === 0) {
    baseScore += Math.min(15, medFound.length * 5);
  }

  // 4. Category weighting
  if (category === 'Public Safety') {
    baseScore += 20;
    factorExplanations.push('Classified directly under Public Safety jurisdiction.');
  } else if (category === 'Waterlogging' || category === 'Drainage') {
    baseScore += 10;
  } else if (category === 'Road Damage') {
    baseScore += 8;
  }

  // 5. Impact scale cues
  if (
    combined.includes('entire street') ||
    combined.includes('whole neighborhood') ||
    combined.includes('hundreds') ||
    combined.includes('main road') ||
    combined.includes('arterial')
  ) {
    baseScore += 12;
    factorExplanations.push('Impacting high-density traffic corridor or multiple residential blocks.');
  }

  // 6. Duration cues
  if (
    combined.includes('weeks') ||
    combined.includes('month') ||
    combined.includes('repeatedly') ||
    combined.includes('over 3 days')
  ) {
    baseScore += 8;
    factorExplanations.push('Extended unresolved duration reported by residents.');
  }

  // Final score clamping
  const score = Math.min(98, Math.max(15, baseScore));

  let priority: PriorityLevel = 'Low';
  if (score >= 80 || isPublicSafetyRisk) {
    priority = 'Critical';
  } else if (score >= 60) {
    priority = 'High';
  } else if (score >= 40) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  // Formulate concise human-readable explanation
  let explanation = '';
  if (priority === 'Critical') {
    explanation = `Assigned Critical (${score}/100) due to acute safety hazards. ${factorExplanations.join(' ')} Immediate official inspection and cordon recommended.`;
  } else if (priority === 'High') {
    explanation = `Assigned High (${score}/100). ${factorExplanations.join(' ')} Disrupts local community flow; scheduled resolution prioritized within 24-48 hours.`;
  } else if (priority === 'Medium') {
    explanation = `Assigned Medium (${score}/100). Standard municipal infrastructure issue without immediate hazard to life. Standard queue routing applies.`;
  } else {
    explanation = `Assigned Low (${score}/100). Minor aesthetic or localized inconvenience; routed to regular maintenance cycle.`;
  }

  return {
    priority,
    score,
    isPublicSafetyRisk: priority === 'Critical' || isPublicSafetyRisk,
    explanation,
    suggestedDepartment: mapCategoryToDepartment(category),
  };
}
