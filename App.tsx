import React, { useState, useEffect, useCallback } from 'react';
import { Trip, GearItem, MasterGearItem, LogEntry, TrainingActivity } from './types';
import TripPlanner from './components/TripPlanner';
import TripDetails from './components/TripDetails';
import ExploreView from './components/ExploreView';
import WelcomePlaceholder from './components/WelcomePlaceholder';
import GearLocker from './components/GearLocker';
import Guides from './components/Guides';
import Settings from './components/Settings';
import Weather from './components/Weather';
import Logbook from './components/Logbook';
import Training from './components/Training';
import { CompassIcon, PlusIcon, MapPinIcon, CalendarIcon, MapIcon, LayoutGridIcon, SettingsIcon, PackageIcon, BookOpenIcon, ClipboardListIcon, CloudSunIcon, BookHeartIcon, TrendingUpIcon } from './components/icons';

type ActiveView = 'explore' | 'trips' | 'gear' | 'guides' | 'weather' | 'logbook' | 'training' | 'settings';
export type Theme = 'dark' | 'light' | 'forest' | 'ocean';

const tripTemplates: Array<{ name: string, gear: GearItem[] }> = [
    { name: 'Weekend Backpacking', gear: [
        { id: 't1', name: 'Backpack (50-70L)', checked: false, weight: 1500 },
        { id: 't2', name: 'Tent', checked: false, weight: 1200 },
        { id: 't3', name: 'Sleeping Bag', checked: false, weight: 900 },
        { id: 't4', name: 'Sleeping Pad', checked: false, weight: 450 },
    ]},
    { name: 'Day Hike', gear: [
        { id: 't9', name: 'Daypack (15-25L)', checked: false, weight: 600 },
        { id: 't12', name: 'Rain Jacket', checked: false, weight: 300 },
    ]},
    { name: 'Overland Expedition', gear: [
        { id: 't15', name: 'Rooftop Tent / Shelter', checked: false, weight: 50000 },
        { id: 't17', name: 'Recovery Kit', checked: false, weight: 15000 },
    ]},
];

const App: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [masterGear, setMasterGear] = useState<MasterGearItem[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [trainingActivities, setTrainingActivities] = useState<TrainingActivity[]>([]);

  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('explore');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningTemplate, setPlanningTemplate] = useState<Partial<Pick<Trip, 'name' | 'initialGear'>> | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>('dark');

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('pathfinder_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  const loadDataFromStorage = useCallback(() => {
    try {
        const storedTheme = localStorage.getItem('pathfinder_theme') as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
             document.documentElement.setAttribute('data-theme', 'dark');
        }

        const storedTrips = localStorage.getItem('pathfinder_trips');
        if (storedTrips) setTrips(JSON.parse(storedTrips));

        const storedGear = localStorage.getItem('pathfinder_gear_locker');
        if (storedGear) setMasterGear(JSON.parse(storedGear));
        
        const storedLogs = localStorage.getItem('pathfinder_logbook');
        if (storedLogs) setLogEntries(JSON.parse(storedLogs));

        const storedTraining = localStorage.getItem('pathfinder_training');
        if (storedTraining) setTrainingActivities(JSON.parse(storedTraining));

        const storedActiveView = localStorage.getItem('pathfinder_active_view') as ActiveView;
        if (storedActiveView) setActiveView(storedActiveView);

        const storedActiveId = localStorage.getItem('pathfinder_active_trip');
        if (storedActiveId) {
            const tripExists = JSON.parse(storedTrips || '[]').some((trip: Trip) => trip.id === storedActiveId);
            if (tripExists) {
                setActiveTripId(storedActiveId);
                if (!storedActiveView || storedActiveView === 'explore') {
                    setActiveView('trips');
                }
            } else {
                setActiveTripId(null);
                localStorage.removeItem('pathfinder_active_trip');
            }
        }
    } catch (error) {
        console.error("Failed to load data from localStorage:", error);
    }
  }, []);
  
  useEffect(() => {
    loadDataFromStorage();
    window.addEventListener('storage', loadDataFromStorage);
    return () => window.removeEventListener('storage', loadDataFromStorage);
  }, [loadDataFromStorage]);
  
  const updateAndStore = useCallback(<T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
      setter(data);
      localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const handleSetView = (view: ActiveView) => {
    setActiveView(view);
    localStorage.setItem('pathfinder_active_view', view);
    if (view !== 'trips') {
        setActiveTripId(null);
        localStorage.removeItem('pathfinder_active_trip');
    }
  };

  const selectTrip = useCallback((id: string | null) => {
    setActiveTripId(id);
    if (id) {
        localStorage.setItem('pathfinder_active_trip', id);
    } else {
        localStorage.removeItem('pathfinder_active_trip');
    }
  }, []);
  
  const handleOpenPlanner = (template?: { name: string, gear: GearItem[] }) => {
    setPlanningTemplate(template ? { name: template.name, initialGear: template.gear } : undefined);
    setIsPlanning(true);
  };

  const handleSaveTrip = (newTripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = { ...newTripData, id: crypto.randomUUID() };
    const updatedTrips = [...trips, newTrip];
    updateAndStore('pathfinder_trips', updatedTrips, setTrips);
    selectTrip(newTrip.id);
    setIsPlanning(false);
  };
  
  const handleUpdateTrip = (updatedTrip: Trip) => {
    const tripIndex = trips.findIndex(t => t.id === updatedTrip.id);
    if (tripIndex > -1) {
      const newTrips = [...trips];
      newTrips[tripIndex] = updatedTrip;
      updateAndStore('pathfinder_trips', newTrips, setTrips);
    }
  };

  const NavButton: React.FC<{ view: ActiveView, title: string, children: React.ReactNode }> = ({ view, title, children }) => (
    <button
        onClick={() => handleSetView(view)}
        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${activeView === view ? 'bg-[var(--color-accent-hover)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-white'}`}
        title={title}
    >
        {children}
    </button>
  );

  const activeTrip = trips.find(trip => trip.id === activeTripId);

  const renderActiveView = () => {
    switch (activeView) {
      case 'explore': return <ExploreView />;
      case 'trips': return activeTrip ? <TripDetails trip={activeTrip} onUpdateTrip={handleUpdateTrip} onBack={() => selectTrip(null)} masterGear={masterGear} /> : <WelcomePlaceholder />;
      case 'gear': return <GearLocker />;
      case 'guides': return <Guides />;
      case 'weather': return <Weather />;
      case 'logbook': return <Logbook trips={trips} logEntries={logEntries} onUpdate={(d) => updateAndStore('pathfinder_logbook', d, setLogEntries)} />;
      case 'training': return <Training activities={trainingActivities} onUpdate={(d) => updateAndStore('pathfinder_training', d, setTrainingActivities)} />;
      case 'settings': return <Settings currentTheme={theme} onThemeChange={handleSetTheme} />;
      default: return <ExploreView />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {isPlanning && <TripPlanner onSave={handleSaveTrip} onClose={() => setIsPlanning(false)} initialData={planningTemplate} />}
      
      <nav className="w-20 bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] flex flex-col items-center justify-between py-6 z-30 flex-shrink-0">
        <div>
            <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-accent)]/10 rounded-full border border-[var(--color-accent)]/20 mb-10">
                <CompassIcon className="w-7 h-7 text-[var(--color-accent)]" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <NavButton view="explore" title="Explore"><MapIcon className="w-6 h-6" /></NavButton>
                <NavButton view="trips" title="My Trips"><LayoutGridIcon className="w-6 h-6" /></NavButton>
                 <hr className="w-8 border-[var(--color-border)] my-2" />
                <NavButton view="gear" title="Gear Locker"><PackageIcon className="w-6 h-6" /></NavButton>
                <NavButton view="weather" title="Weather"><CloudSunIcon className="w-6 h-6" /></NavButton>
                <NavButton view="guides" title="Guides"><BookOpenIcon className="w-6 h-6" /></NavButton>
                <NavButton view="logbook" title="Logbook"><BookHeartIcon className="w-6 h-6" /></NavButton>
                <NavButton view="training" title="Training"><TrendingUpIcon className="w-6 h-6" /></NavButton>
            </div>
        </div>
        <NavButton view="settings" title="Settings"><SettingsIcon className="w-6 h-6" /></NavButton>
      </nav>

      {/* Responsive layout container */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'trips' && (
          <aside className={`w-full md:w-80 flex-shrink-0 bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] ${activeTripId ? 'hidden md:flex' : 'flex'} flex-col`}>
             <div className="p-4 border-b border-[var(--color-border)]">
                <h2 className="text-2xl font-bold text-white px-2">My Trips</h2>
            </div>
            <div className="p-4 space-y-4">
                <button onClick={() => handleOpenPlanner()} className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-hover)] hover:bg-[var(--color-accent)] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/50">
                    <PlusIcon className="w-5 h-5" />
                    Plan New Trip
                </button>
                <div>
                    <p className="text-sm font-semibold text-[var(--color-text-secondary)] px-2 mb-2">Or Use a Template</p>
                    <div className="space-y-2">
                        {tripTemplates.map(template => (
                            <button key={template.name} onClick={() => handleOpenPlanner(template)} className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-[var(--color-bg-interactive)]/50 hover:bg-[var(--color-bg-interactive)] transition-colors">
                                <ClipboardListIcon className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />
                                <span className="text-white font-medium">{template.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-[var(--color-border)] flex-grow overflow-y-auto">
                <nav className="p-4 space-y-2">
                {trips.length === 0 && <p className="text-center text-[var(--color-text-tertiary)] py-8">No trips planned yet.</p>}
                {trips.map(trip => (
                    <button
                    key={trip.id}
                    onClick={() => selectTrip(trip.id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors border-l-4 ${
                        activeTripId === trip.id ? 'bg-[var(--color-bg-tertiary)]/50 border-[var(--color-accent)]' : 'bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-tertiary)]/50 border-transparent'
                    }`}
                    >
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white flex-grow mr-2">{trip.name}</h3>
                        
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mt-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mt-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{trip.startDate}</span>
                    </div>
                    </button>
                ))}
                </nav>
            </div>
          </aside>
        )}
        
        <main className={`flex-1 flex-col ${activeView === 'trips' && !activeTripId ? 'hidden md:flex' : 'flex'} bg-[var(--color-bg-secondary)]`}>
            {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;