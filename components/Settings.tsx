import React, { useRef } from 'react';
import { SettingsIcon, Trash2Icon, ArchiveIcon, UploadCloudIcon } from './icons';
import { Theme } from '../App';

interface SettingsProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to delete ALL data? This includes all trips, gear, logs, and settings. This action cannot be undone.')) {
            localStorage.clear();
            alert('All data has been cleared. The application will now reload.');
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const dataToExport: { [key: string]: any } = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('pathfinder_')) {
                const value = localStorage.getItem(key);
                 if (value) dataToExport[key] = JSON.parse(value);
            }
        }
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pathfinder_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable.");
                const data = JSON.parse(text);
                if (window.confirm('Importing this file will overwrite all current data. Are you sure you want to proceed?')) {
                    localStorage.clear();
                    Object.keys(data).forEach(key => {
                        if (key.startsWith('pathfinder_')) {
                            localStorage.setItem(key, JSON.stringify(data[key]));
                        }
                    });
                    alert('Data imported successfully. The application will now reload.');
                    window.location.reload();
                }
            } catch (error) {
                alert(`Error importing file: ${error instanceof Error ? error.message : 'Invalid file format.'}`);
            }
        };
        reader.readAsText(file);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const themes: { id: Theme, name: string }[] = [
        { id: 'dark', name: 'Dark' },
        { id: 'light', name: 'Light' },
        { id: 'forest', name: 'Forest' },
        { id: 'ocean', name: 'Ocean' },
    ];

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            <header className="p-6 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Settings</h2>
                        <p className="text-[var(--color-text-secondary)]">Configure your PathFinder experience.</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-[var(--color-bg-tertiary)] p-6 rounded-lg border border-[var(--color-border-subtle)]">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Theme</h3>
                        <div className="grid grid-cols-2 gap-4">
                           {themes.map(theme => (
                               <button 
                                key={theme.id}
                                onClick={() => onThemeChange(theme.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${currentTheme === theme.id ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/50' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'}`}
                               >
                                    <span className="font-semibold text-lg text-[var(--color-text-primary)]">{theme.name}</span>
                                </button>
                           ))}
                        </div>
                    </div>

                    <div className="bg-[var(--color-bg-tertiary)] p-6 rounded-lg border border-[var(--color-border-subtle)]">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Data Management</h3>
                        <p className="text-[var(--color-text-secondary)] mb-4">Save your data to a file or load a previous backup.</p>
                        <div className="flex gap-4">
                            <button onClick={handleImportClick} className="inline-flex items-center gap-2 bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-[var(--color-text-primary)] font-bold py-2 px-4 rounded-lg transition-colors">
                                <UploadCloudIcon className="w-5 h-5"/> Import Data
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                             <button onClick={handleExportData} className="inline-flex items-center gap-2 bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-[var(--color-text-primary)] font-bold py-2 px-4 rounded-lg transition-colors">
                                <ArchiveIcon className="w-5 h-5"/> Export All Data
                            </button>
                        </div>
                    </div>

                    <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/30">
                        <h3 className="text-xl font-bold text-red-300 mb-2">Danger Zone</h3>
                         <p className="text-red-200/80 mb-4">
                            This will permanently delete all your saved trips, gear, logs, and other data. This action cannot be undone.
                        </p>
                        <button 
                            onClick={handleClearData}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <Trash2Icon className="w-5 h-5" />
                            Clear All Local Data
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;