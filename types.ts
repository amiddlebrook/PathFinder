export interface GearItem {
  id: string;
  name: string;
  checked: boolean;
  weight?: number; // in grams
}

export interface RiskAssessmentData {
  trailDifficulty: {
    rating: string;
    analysis: string;
  };
  weatherAnalysis: {
    summary: string;
    recommendation: string;
  };
  potentialHazards: Array<{
    hazard: string;
    mitigation: string;
  }>;
  recommendedGear: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  gearChecklist: GearItem[];
  riskAssessment?: RiskAssessmentData;
  emergencyContacts: EmergencyContact[];
  mapLocation?: {
    lat: number;
    lng: number;
  };
  offlineMap?: {
    size: 'small' | 'medium' | 'large';
    area: string;
  };
  initialGear?: GearItem[];
}

export interface MasterGearItem {
    id: string;
    name: string;
    category: string;
    weight: number; // in grams
    notes: string;
    image?: string; // Base64 encoded image
}

export interface GuideArticle {
    id: string;
    category: 'Safety' | 'Skills' | 'Environment' | 'Gear';
    title: string;
    summary: string;
    content: string;
}

export interface LogEntry {
    id: string;
    tripId?: string; // Optional: link to a trip
    tripName?: string;
    title: string;
    date: string;
    content: string;
    images?: string[]; // Array of Base64 encoded images
}

export interface TrainingActivity {
    id: string;
    date: string;
    type: 'Hike' | 'Run' | 'Workout' | 'Other';
    duration: number; // in minutes
    distance: number; // in miles
    notes: string;
    image?: string; // Base64 encoded image
}