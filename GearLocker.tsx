import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MasterGearItem } from '../types';
import { PackageIcon, PlusIcon, Trash2Icon, WeightIcon, ImageIcon, CameraIcon, UploadCloudIcon } from './icons';

const GearLocker: React.FC = () => {
    const [gear, setGear] = useState<MasterGearItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Uncategorized');
    const [newItemWeight, setNewItemWeight] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');
    const [newItemImage, setNewItemImage] = useState<string | undefined>(undefined);
    const [isAdding, setIsAdding] = useState(false);
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const storedGear = localStorage.getItem('pathfinder_gear_locker');
            if (storedGear) {
                setGear(JSON.parse(storedGear));
            }
        } catch (error) {
            console.error("Failed to load gear from localStorage:", error);
            localStorage.removeItem('pathfinder_gear_locker');
        }
    }, []);

    const updateAndStoreGear = (newGear: MasterGearItem[]) => {
        setGear(newGear);
        localStorage.setItem('pathfinder_gear_locker', JSON.stringify(newGear));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewItemImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
         if (e.target) e.target.value = '';
    };
    
    const resetForm = () => {
        setNewItemName('');
        setNewItemCategory('Uncategorized');
        setNewItemWeight('');
        setNewItemNotes('');
        setNewItemImage(undefined);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const newItem: MasterGearItem = {
            id: crypto.randomUUID(),
            name: newItemName.trim(),
            category: newItemCategory.trim() || 'Uncategorized',
            weight: parseInt(newItemWeight, 10) || 0,
            notes: newItemNotes.trim(),
            image: newItemImage,
        };
        updateAndStoreGear([...gear, newItem]);
        resetForm();
        setIsAdding(false);
    };

    const handleRemoveItem = (id: string) => {
        if (window.confirm('Are you sure you want to delete this gear item permanently?')) {
            const updatedGear = gear.filter(item => item.id !== id);
            updateAndStoreGear(updatedGear);
        }
    };

    const groupedGear = useMemo(() => {
        return gear.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            acc[category].sort((a, b) => a.name.localeCompare(b.name));
            return acc;
        }, {} as Record<string, MasterGearItem[]>);
    }, [gear]);

    const sortedCategories = Object.keys(groupedGear).sort();
    
    const totalWeightKg = useMemo(() => {
      return (gear.reduce((sum, item) => sum + (item.weight || 0), 0) / 1000).toFixed(2);
    }, [gear]);

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            <header className="p-6 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <PackageIcon className="w-8 h-8 text-[var(--color-accent)]" />
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Gear Locker</h2>
                            <p className="text-[var(--color-text-secondary)]">Manage your master equipment inventory.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm text-[var(--color-text-secondary)]">Total Items</p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">{gear.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-[var(--color-text-secondary)]">Total Weight</p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">{totalWeightKg} kg</p>
                        </div>
                        <button onClick={() => setIsAdding(prev => !prev)} className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            <PlusIcon className="w-5 h-5" /> {isAdding ? 'Cancel' : 'Add Item'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                {isAdding && (
                    <form onSubmit={handleAddItem} className="bg-[var(--color-bg-tertiary)]/50 p-4 rounded-lg border border-[var(--color-border)] mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-[var(--color-bg-tertiary)] rounded-md flex items-center justify-center border-2 border-dashed border-[var(--color-border)] overflow-hidden">
                                {newItemImage ? <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-[var(--color-text-tertiary)]" />}
                            </div>
                            <div className="flex-grow space-y-4">
                                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name" required className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition" />
                                <div className="flex gap-2">
                                     <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-sm bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-3 rounded-md transition-colors">
                                        <CameraIcon className="w-4 h-4"/> Take Photo
                                    </button>
                                     <button type="button" onClick={() => imageUploadRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 text-sm bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-3 rounded-md transition-colors">
                                        <UploadCloudIcon className="w-4 h-4"/> Upload Image
                                    </button>
                                    <input type="file" accept="image/*" onChange={handleImageChange} ref={imageUploadRef} className="hidden" />
                                    <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} ref={cameraInputRef} className="hidden" />
                                </div>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category (e.g., Cooking)" className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition" />
                             <input type="number" value={newItemWeight} onChange={(e) => setNewItemWeight(e.target.value)} placeholder="Weight (grams)" className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition" />
                        </div>
                        <textarea value={newItemNotes} onChange={(e) => setNewItemNotes(e.target.value)} placeholder="Notes (e.g., model, purchase date, condition)" className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition" rows={2} />
                        <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg">Save Item</button>
                        </div>
                    </form>
                )}

                {gear.length === 0 && !isAdding ? (
                    <div className="text-center py-16">
                        <p className="text-[var(--color-text-tertiary)]">Your gear locker is empty.</p>
                        <p className="text-[var(--color-text-secondary)] mt-1">Click "Add Item" to start building your inventory.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedCategories.map(category => (
                            <div key={category}>
                                <h3 className="text-xl font-bold text-[var(--color-accent-text)] border-b-2 border-[var(--color-border)] pb-2 mb-3">{category}</h3>
                                <div className="space-y-2">
                                    {groupedGear[category].map(item => (
                                        <details key={item.id} className="group bg-[var(--color-bg-tertiary)] rounded-md hover:bg-[var(--color-bg-interactive)]/30 transition-colors">
                                            <summary className="p-3 flex items-center justify-between cursor-pointer list-none">
                                                <div className="flex items-center gap-4">
                                                    {item.image ? 
                                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md bg-[var(--color-bg-interactive)]" /> :
                                                        <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-bg-interactive)] rounded-md"><ImageIcon className="w-5 h-5 text-[var(--color-text-secondary)]" /></div>
                                                    }
                                                    <span className="text-[var(--color-text-primary)] font-semibold">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-[var(--color-text-secondary)]">{item.weight > 0 ? `${(item.weight / 1000).toFixed(2)} kg` : ''}</span>
                                                    <button onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }} className="text-[var(--color-text-tertiary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1">
                                                        <Trash2Icon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </summary>
                                            {(item.notes || item.image) && (
                                                <div className="px-4 pb-3 -mt-2 border-t border-[var(--color-border)]/50 pt-3 flex gap-4">
                                                    {item.image && <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md bg-[var(--color-bg-interactive)] hidden sm:block" />}
                                                    {item.notes && <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap flex-grow">{item.notes}</p>}
                                                </div>
                                            )}
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GearLocker;