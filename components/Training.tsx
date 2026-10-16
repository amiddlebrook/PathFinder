import React, { useState, useMemo, useRef } from 'react';
import { TrainingActivity } from '../types';
import { TrendingUpIcon, PlusIcon, ImageIcon, CameraIcon, UploadCloudIcon } from './icons';

interface TrainingProps {
    activities: TrainingActivity[];
    onUpdate: (activities: TrainingActivity[]) => void;
}

const TrainingChart: React.FC<{ activities: TrainingActivity[] }> = ({ activities }) => {
    const weeklyData = useMemo(() => {
        const data: number[] = Array(7).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dayOfWeek = today.getDay();
        const sevenDaysAgo = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);

        activities.forEach(act => {
            const actDate = new Date(act.date);
            actDate.setHours(0, 0, 0, 0);
             if (actDate >= sevenDaysAgo && actDate <= today) {
                const dayIndex = actDate.getDay();
                data[dayIndex] += act.duration;
            }
        });
        return data;
    }, [activities]);

    const maxDuration = Math.max(...weeklyData, 60);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-[var(--color-bg-tertiary)] p-6 rounded-lg border border-[var(--color-border-subtle)]">
            <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Activity This Week (minutes)</h4>
            <div className="flex justify-between items-end h-40 gap-2">
                {weeklyData.map((duration, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 text-center">
                        <div title={`${duration} min on ${dayLabels[i]}`} className="w-full bg-[var(--color-bg-interactive)]/50 rounded-t-md flex items-end" style={{height: '100%'}}>
                            <div className="w-full bg-[var(--color-accent)] rounded-t-md transition-all" style={{ height: `${(duration / maxDuration) * 100}%` }}></div>
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)]">{dayLabels[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Training: React.FC<TrainingProps> = ({ activities, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newActivity, setNewActivity] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Hike' as TrainingActivity['type'],
        duration: '',
        distance: '',
        notes: '',
        image: undefined as string | undefined
    });
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewActivity(prev => ({ ...prev, image: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        if(e.target) e.target.value = '';
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: TrainingActivity = {
            id: crypto.randomUUID(),
            date: newActivity.date,
            type: newActivity.type,
            duration: parseInt(newActivity.duration) || 0,
            distance: parseFloat(newActivity.distance) || 0,
            notes: newActivity.notes,
            image: newActivity.image,
        };
        onUpdate([...activities, newEntry].sort((a,b) => b.date.localeCompare(a.date)));
        setIsAdding(false);
        setNewActivity({ date: new Date().toISOString().split('T')[0], type: 'Hike', duration: '', distance: '', notes: '', image: undefined });
    };

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            <header className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <TrendingUpIcon className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Training Hub</h2>
                        <p className="text-[var(--color-text-secondary)]">Log activities to prepare for your adventures.</p>
                    </div>
                </div>
                <button onClick={() => setIsAdding(prev => !prev)} className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-2 px-4 rounded-lg">
                    <PlusIcon className="w-5 h-5" /> {isAdding ? 'Cancel' : 'Log Activity'}
                </button>
            </header>
            <main className="flex-grow overflow-y-auto p-6 space-y-6">
                <TrainingChart activities={activities} />

                 {isAdding && (
                    <form onSubmit={handleAdd} className="bg-[var(--color-bg-tertiary)]/50 p-4 rounded-lg border border-[var(--color-border)] space-y-4">
                         <h3 className="font-semibold text-lg text-white">Log New Activity</h3>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="date" value={newActivity.date} onChange={e => setNewActivity({...newActivity, date: e.target.value})} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-white date-input-fix" />
                             <select value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value as any})} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-white">
                                <option>Hike</option>
                                <option>Run</option>
                                <option>Workout</option>
                                <option>Other</option>
                             </select>
                             <input type="number" value={newActivity.duration} onChange={e => setNewActivity({...newActivity, duration: e.target.value})} placeholder="Duration (min)" className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-white" />
                             <input type="number" step="0.1" value={newActivity.distance} onChange={e => setNewActivity({...newActivity, distance: e.target.value})} placeholder="Distance (mi)" className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-white" />
                         </div>
                         <div className="flex gap-4">
                            <textarea value={newActivity.notes} onChange={e => setNewActivity({...newActivity, notes: e.target.value})} placeholder="Notes..." className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-2 text-white" rows={3}/>
                            <div className="flex-shrink-0 flex flex-col gap-2">
                                <label className="w-28 h-28 border-2 border-dashed border-[var(--color-border)] rounded-md flex flex-col items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-interactive)]/50 hover:text-[var(--color-text-primary)] cursor-pointer transition-colors overflow-hidden">
                                    {newActivity.image ? <img src={newActivity.image} className="w-full h-full object-cover" /> : <><ImageIcon className="w-8 h-8"/> <span className="text-xs mt-1">Add Photo</span></>}
                                </label>
                                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-xs bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                    <CameraIcon className="w-4 h-4"/> Take
                                </button>
                                <button type="button" onClick={() => imageUploadRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-xs bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                    <UploadCloudIcon className="w-4 h-4"/> Upload
                                </button>
                                <input type="file" accept="image/*" onChange={handleImageChange} ref={imageUploadRef} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} ref={cameraInputRef} className="hidden" />
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg">Save Activity</button>
                        </div>
                    </form>
                )}

                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                        {activities.length === 0 ? (
                            <p className="text-[var(--color-text-tertiary)] text-center py-8">No activities logged yet.</p>
                        ) : (
                            activities.map(act => (
                                <div key={act.id} className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        {act.image ? <img src={act.image} alt={act.type} className="w-12 h-12 object-cover rounded-md bg-[var(--color-bg-interactive)]" /> :
                                        <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-bg-interactive)] rounded-md"><TrendingUpIcon className="w-6 h-6 text-[var(--color-accent-text)]" /></div>}
                                        <div>
                                            <p className="font-bold text-white">{act.type}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">{new Date(act.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 text-right">
                                        <div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Duration</p>
                                            <p className="font-semibold text-white">{act.duration} min</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Distance</p>
                                            <p className="font-semibold text-white">{act.distance.toFixed(1)} mi</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Training;