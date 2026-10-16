import React, { useState, useRef } from 'react';
import { LogEntry, Trip } from '../types';
import { BookHeartIcon, PlusIcon, XIcon, CameraIcon, UploadCloudIcon } from './icons';

interface LogbookProps {
    trips: Trip[];
    logEntries: LogEntry[];
    onUpdate: (entries: LogEntry[]) => void;
}

const LogEditor: React.FC<{
    entry?: LogEntry;
    trips: Trip[];
    onSave: (entry: LogEntry) => void;
    onClose: () => void;
}> = ({ entry, trips, onSave, onClose }) => {
    const [title, setTitle] = useState(entry?.title || '');
    const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);
    const [tripId, setTripId] = useState(entry?.tripId || '');
    const [content, setContent] = useState(entry?.content || '');
    const [images, setImages] = useState<string[]>(entry?.images || []);
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert("Title and content are required.");
            return;
        }
        const selectedTrip = trips.find(t => t.id === tripId);
        onSave({
            id: entry?.id || crypto.randomUUID(),
            title,
            date,
            tripId,
            tripName: selectedTrip?.name,
            content,
            images,
        });
        onClose();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImages(prev => [...prev, event.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        if (e.target) e.target.value = '';
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl shadow-2xl w-full max-w-4xl border border-[var(--color-border)] flex flex-col" style={{ height: '90vh' }}>
                <header className="p-4 border-b border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{entry ? 'Edit' : 'Create'} Log Entry</h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-[var(--color-text-secondary)] hover:text-white" /></button>
                </header>
                <main className="p-6 space-y-4 flex-grow overflow-y-auto">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry Title" className="w-full text-3xl font-bold bg-transparent text-[var(--color-text-primary)] focus:outline-none" />
                    <div className="flex gap-4 items-center">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-[var(--color-bg-interactive)] p-2 rounded-md text-white date-input-fix" />
                        <select value={tripId} onChange={e => setTripId(e.target.value)} className="bg-[var(--color-bg-interactive)] p-2 rounded-md text-white">
                            <option value="">Link to a trip (optional)</option>
                            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your story..." className="w-full h-full min-h-[200px] bg-transparent text-[var(--color-text-secondary)] focus:outline-none resize-none text-lg" />
                    
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Photo Gallery</h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-sm bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-3 rounded-md transition-colors">
                                    <CameraIcon className="w-4 h-4"/> Take Photo
                                </button>
                                <button type="button" onClick={() => imageUploadRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-sm bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-3 rounded-md transition-colors">
                                    <UploadCloudIcon className="w-4 h-4"/> Upload Images
                                </button>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} ref={imageUploadRef} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} ref={cameraInputRef} className="hidden" />
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative group aspect-square">
                                        <img src={img} alt={`Log entry ${i+1}`} className="w-full h-full object-cover rounded-md" />
                                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-[var(--color-border)] flex justify-end flex-shrink-0">
                    <button onClick={handleSave} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-2 px-6 rounded-lg">Save Entry</button>
                </footer>
            </div>
        </div>
    );
};

const Logbook: React.FC<LogbookProps> = ({ trips, logEntries, onUpdate }) => {
    const [editingEntry, setEditingEntry] = useState<LogEntry | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    const handleSave = (entry: LogEntry) => {
        const index = logEntries.findIndex(e => e.id === entry.id);
        let updatedEntries;
        if (index > -1) {
            updatedEntries = [...logEntries];
            updatedEntries[index] = entry;
        } else {
            updatedEntries = [...logEntries, entry];
        }
        onUpdate(updatedEntries.sort((a,b) => b.date.localeCompare(a.date)));
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this log entry?")) {
            onUpdate(logEntries.filter(e => e.id !== id));
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            {(isCreating || editingEntry) && <LogEditor entry={editingEntry} trips={trips} onSave={handleSave} onClose={() => { setIsCreating(false); setEditingEntry(undefined); }} />}
            <header className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookHeartIcon className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Adventure Logbook</h2>
                        <p className="text-[var(--color-text-secondary)]">Document your journeys and lessons learned.</p>
                    </div>
                </div>
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-2 px-4 rounded-lg">
                    <PlusIcon className="w-5 h-5" /> New Entry
                </button>
            </header>
            <main className="flex-grow overflow-y-auto p-6">
                {logEntries.length === 0 ? (
                     <div className="text-center py-16">
                        <p className="text-[var(--color-text-tertiary)]">Your logbook is empty.</p>
                        <p className="text-[var(--color-text-secondary)] mt-1">Click "New Entry" to start documenting your adventures.</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {logEntries.map(entry => (
                            <div key={entry.id} className="bg-[var(--color-bg-tertiary)] p-6 rounded-lg border border-[var(--color-border-subtle)] group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{entry.title}</h3>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            {entry.tripName && <span className="text-[var(--color-accent-text)]"> • {entry.tripName}</span>}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button onClick={() => setEditingEntry(entry)} className="text-sm bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] px-3 py-1 rounded">Edit</button>
                                        <button onClick={() => handleDelete(entry.id)} className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                                    </div>
                                </div>
                                <p className="text-[var(--color-text-secondary)] mt-4 whitespace-pre-wrap line-clamp-3">{entry.content}</p>
                                {entry.images && entry.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                        {entry.images.map((img, i) => (
                                            <div key={i} className="aspect-square">
                                                <img src={img} alt={`Log entry ${i+1}`} className="w-full h-full object-cover rounded-md" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Logbook;