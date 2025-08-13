import React, { useState, useEffect, useMemo } from 'react';
import { Trip, GearItem, MasterGearItem } from '../types';
import { CheckSquareIcon, XIcon, PlusIcon, PackageIcon, WeightIcon } from './icons';

interface GearChecklistProps {
  trip: Trip;
  onUpdate: (updatedChecklist: GearItem[]) => void;
  masterGear: MasterGearItem[];
}

const AddFromLockerModal: React.FC<{
  masterGear: MasterGearItem[];
  tripChecklist: GearItem[];
  onAdd: (items: GearItem[]) => void;
  onClose: () => void;
}> = ({ masterGear, tripChecklist, onAdd, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const itemsToAdd = masterGear
      .filter(item => selectedIds.has(item.id))
      .map(masterItem => ({
        id: crypto.randomUUID(),
        name: masterItem.name,
        checked: false,
        weight: masterItem.weight,
      }));
    onAdd(itemsToAdd);
    onClose();
  };

  const availableGear = useMemo(() => {
    const tripItemNames = new Set(tripChecklist.map(i => i.name.toLowerCase()));
    return masterGear.filter(i => !tripItemNames.has(i.name.toLowerCase()));
  }, [masterGear, tripChecklist]);
  
  const groupedGear = useMemo(() => {
        return availableGear.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, MasterGearItem[]>);
    }, [availableGear]);

    const sortedCategories = Object.keys(groupedGear).sort();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-tertiary)] rounded-2xl shadow-2xl w-full max-w-2xl border border-[var(--color-border)] flex flex-col" style={{height: '80vh'}}>
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">Add from Gear Locker</h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white"><XIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {availableGear.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-center py-8">All locker items are already in your checklist.</p>
          ) : (
            sortedCategories.map(category => (
              <div key={category} className="mb-4">
                <h4 className="font-bold text-[var(--color-accent-text)] mb-2">{category}</h4>
                <div className="space-y-2">
                  {groupedGear[category].map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg transition-colors ${selectedIds.has(item.id) ? 'bg-[var(--color-accent)]/30' : 'bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-interactive)]/50'}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${selectedIds.has(item.id) ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'bg-[var(--color-bg-interactive)] border-[var(--color-border)]'}`}>
                          {selectedIds.has(item.id) && <CheckSquareIcon className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[var(--color-text-primary)] flex-grow">{item.name}</span>
                       <span className="text-sm text-[var(--color-text-secondary)]">{(item.weight / 1000).toFixed(2)} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 flex justify-end">
          <button onClick={handleAddSelected} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-2 px-6 rounded-lg">
            Add Selected ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};


const GearChecklist: React.FC<GearChecklistProps> = ({ trip, onUpdate, masterGear }) => {
  const [checklist, setChecklist] = useState<GearItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isLockerOpen, setIsLockerOpen] = useState(false);

  useEffect(() => {
    const initialChecklist: GearItem[] = [];
    const addedNames = new Set<string>();

    const addUniqueItem = (item: GearItem) => {
        const lowerName = item.name.toLowerCase();
        if(!addedNames.has(lowerName)) {
            initialChecklist.push(item);
            addedNames.add(lowerName);
        }
    };
    
    trip.gearChecklist.forEach(item => addUniqueItem(item));

    if (trip.riskAssessment?.recommendedGear) {
        trip.riskAssessment.recommendedGear.forEach(recItemName => {
            addUniqueItem({ id: crypto.randomUUID(), name: recItemName, checked: false });
        });
    }

    setChecklist(initialChecklist.sort((a,b) => a.name.localeCompare(b.name)));
  }, [trip]);

  const handleToggleCheck = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    onUpdate(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() === '') return;
    const newItem: GearItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      checked: false,
      weight: 0,
    };
    const updated = [...checklist, newItem].sort((a,b) => a.name.localeCompare(b.name));
    setChecklist(updated);
    onUpdate(updated);
    setNewItemName('');
  };

  const handleAddFromLocker = (items: GearItem[]) => {
      const updated = [...checklist, ...items].sort((a,b) => a.name.localeCompare(b.name));
      setChecklist(updated);
      onUpdate(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = checklist.filter(item => item.id !== id);
    setChecklist(updated);
    onUpdate(updated);
  };
  
  const checkedCount = checklist.filter(item => item.checked).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  
  const totalWeightKg = useMemo(() => {
      const weightInGrams = checklist.reduce((sum, item) => {
          return item.checked && item.weight ? sum + item.weight : sum;
      }, 0);
      return (weightInGrams / 1000).toFixed(2);
  }, [checklist]);

  return (
    <div>
        {isLockerOpen && <AddFromLockerModal masterGear={masterGear} tripChecklist={checklist} onAdd={handleAddFromLocker} onClose={() => setIsLockerOpen(false)} />}
        <div className="p-6 bg-[var(--color-bg-tertiary)]/50 rounded-xl border border-[var(--color-border)] mb-6">
            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                <CheckSquareIcon className="w-7 h-7 text-[var(--color-accent)]" />
                Gear Checklist
            </h3>
            <p className="text-[var(--color-text-secondary)] mt-2">Pack smart, travel safe. Check off items as you pack them.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        <span>Packing Progress</span>
                        <span>{checkedCount} / {totalCount} items</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-interactive)] rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                 <div>
                    <div className="flex justify-between items-center text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        <span className="flex items-center gap-1.5"><WeightIcon className="w-4 h-4"/>Total Pack Weight</span>
                        <span>{totalWeightKg} kg</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-interactive)] rounded-full h-2.5" title="Base weight of checked items. Does not include consumables like food/water/fuel.">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (parseFloat(totalWeightKg) / 15) * 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setIsLockerOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-[var(--color-bg-interactive)] hover:bg-[var(--color-bg-interactive-hover)] text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            <PackageIcon className="w-5 h-5" /> Add from Locker
        </button>
        <form onSubmit={handleAddItem} className="flex-grow flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Or add a custom item..."
              className="flex-grow bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-white placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
            />
            <button type="submit" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold p-2 rounded-lg transition-colors flex-shrink-0">
              <PlusIcon className="w-6 h-6"/>
            </button>
        </form>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
        {checklist.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-[var(--color-bg-tertiary)] p-3 rounded-lg hover:bg-[var(--color-bg-interactive)]/50 transition-colors group">
            <div
              className="flex items-center gap-4 cursor-pointer flex-grow"
              onClick={() => handleToggleCheck(item.id)}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-[var(--color-bg-interactive)] border-[var(--color-border)]'}`}>
                {item.checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-lg ${item.checked ? 'text-[var(--color-text-tertiary)] line-through' : 'text-[var(--color-text-primary)]'}`}>{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              {item.weight && item.weight > 0 && <span className="text-sm text-[var(--color-text-secondary)]">{(item.weight / 1000).toFixed(2)} kg</span>}
              <button onClick={() => handleRemoveItem(item.id)} className="text-[var(--color-text-tertiary)] hover:text-red-400 p-1 rounded-full transition-colors ml-4 opacity-0 group-hover:opacity-100">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GearChecklist;