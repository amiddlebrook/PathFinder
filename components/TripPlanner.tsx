import React, { useState, useEffect } from 'react';
import { Trip, GearItem } from '../types';
import { MapPinIcon, CalendarIcon, XIcon, MountainSnowIcon } from './icons';

interface TripPlannerProps {
  onSave: (newTrip: Omit<Trip, 'id'>) => void;
  onClose: () => void;
  initialData?: Partial<Pick<Trip, 'name' | 'initialGear'>>;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ onSave, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) {
      alert('Please fill out all fields.');
      return;
    }
    if (endDate < startDate) {
      alert('End date must not be earlier than start date.');
      return;
    }
    onSave({
      name,
      destination,
      startDate,
      endDate,
      gearChecklist: initialData?.initialGear || [],
      emergencyContacts: [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-[var(--color-bg-tertiary)] rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-[var(--color-border)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[var(--color-accent)]/10 p-3 rounded-full mb-3 border border-[var(--color-accent)]/20">
            <MountainSnowIcon className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Plan New Adventure</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Chart your next journey into the wild.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="trip-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Trip Name</label>
            <input
              id="trip-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sierra High Route"
              className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-white placeholder-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Destination / Trail</label>
            <div className="relative">
              <MapPinIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Ansel Adams Wilderness, CA"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label htmlFor="start-date" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Start Date</label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition date-input-fix"
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="end-date" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">End Date</label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition date-input-fix"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/50 shadow-lg shadow-[var(--color-accent)]/20">
            Create Trip Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripPlanner;