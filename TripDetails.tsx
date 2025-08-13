import React, { useState } from 'react';
import { Trip, GearItem, RiskAssessmentData, EmergencyContact, MasterGearItem } from '../types';
import { ShieldAlertIcon, CheckSquareIcon, AlertTriangleIcon, MapIcon, ChevronLeftIcon } from './icons';
import RiskAssessment from './RiskAssessment';
import GearChecklist from './GearChecklist';
import EmergencyProtocol from './EmergencyProtocol';
import MapComponent from './MapComponent';

interface TripDetailsProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onBack: () => void;
  masterGear: MasterGearItem[];
}

type ActiveTab = 'risk' | 'gear' | 'map' | 'emergency';

const TripDetails: React.FC<TripDetailsProps> = ({ trip, onUpdateTrip, onBack, masterGear }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('risk');

  const handleAssessmentUpdate = (assessment: RiskAssessmentData) => {
    onUpdateTrip({ 
      ...trip, 
      riskAssessment: assessment,
      mapLocation: assessment.location,
     });
  };
  
  const handleChecklistUpdate = (updatedChecklist: GearItem[]) => {
    onUpdateTrip({ ...trip, gearChecklist: updatedChecklist });
  };

  const handleContactsUpdate = (updatedContacts: EmergencyContact[]) => {
    onUpdateTrip({ ...trip, emergencyContacts: updatedContacts });
  };
  
  const handleMapUpdate = (updatedTrip: Trip) => {
    onUpdateTrip(updatedTrip);
  }

  const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`w-full flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200
        ${activeTab === tabName 
          ? 'text-[var(--color-accent-text)] bg-[var(--color-bg-interactive)]/50 shadow-inner' 
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-interactive)]/30 hover:text-[var(--color-text-primary)]'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex-grow flex flex-col h-full bg-[var(--color-bg-secondary)]">
       <div className="p-6">
        <header className="pb-6 border-b border-[var(--color-border)]">
            <button onClick={onBack} className="md:hidden flex items-center gap-1 text-sm text-[var(--color-accent)] font-semibold mb-3">
                <ChevronLeftIcon className="w-4 h-4" />
                Back to Trips
            </button>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">{trip.name}</h2>
            <p className="text-[var(--color-text-secondary)] text-lg mt-1">{trip.destination}</p>
            <p className="text-[var(--color-accent)] font-medium mt-2 text-sm">{trip.startDate} to {trip.endDate}</p>
        </header>
        <div className="flex-grow flex mt-6 gap-6">
            <nav className="w-56 flex-shrink-0 flex flex-col gap-2">
            <TabButton tabName="risk" label="Risk" icon={<ShieldAlertIcon className="w-6 h-6"/>} />
            <TabButton tabName="gear" label="Gear" icon={<CheckSquareIcon className="w-6 h-6"/>} />
            <TabButton tabName="map" label="Map" icon={<MapIcon className="w-6 h-6"/>} />
            <TabButton tabName="emergency" label="Emergency" icon={<AlertTriangleIcon className="w-6 h-6"/>} />
            </nav>
            <main className="flex-grow overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 220px)'}}>
                {activeTab === 'risk' && <RiskAssessment trip={trip} onAssessmentUpdate={handleAssessmentUpdate} />}
                {activeTab === 'gear' && <GearChecklist trip={trip} onUpdate={handleChecklistUpdate} masterGear={masterGear} />}
                {activeTab === 'map' && <MapComponent trip={trip} onUpdateTrip={handleMapUpdate} />}
                {activeTab === 'emergency' && <EmergencyProtocol trip={trip} onUpdate={handleContactsUpdate}/>}
            </main>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;