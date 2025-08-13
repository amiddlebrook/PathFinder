import React, { useState } from 'react';
import { Trip, EmergencyContact } from '../types';
import { AlertTriangleIcon, PlusIcon, XIcon } from './icons';

interface EmergencyProtocolProps {
  trip: Trip;
  onUpdate: (updatedContacts: EmergencyContact[]) => void;
}

const EmergencyProtocol: React.FC<EmergencyProtocolProps> = ({ trip, onUpdate }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(trip.emergencyContacts);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && newContact.relation) {
      const newContactList = [...contacts, { ...newContact, id: crypto.randomUUID() }];
      setContacts(newContactList);
      onUpdate(newContactList);
      setNewContact({ name: '', phone: '', relation: '' });
      setIsAdding(false);
    }
  };
  
  const handleRemoveContact = (id: string) => {
    const newContactList = contacts.filter(c => c.id !== id);
    setContacts(newContactList);
    onUpdate(newContactList);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-red-900/30 rounded-xl border border-red-500/30">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <AlertTriangleIcon className="w-7 h-7 text-red-400" />
          Emergency Protocols
        </h3>
        <p className="text-red-200 mt-2">In an emergency, stay calm and follow S.T.O.P: Stop, Think, Observe, Plan.</p>
      </div>

      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
        <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-3">Key Safety Actions</h4>
        <ul className="space-y-3 text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-3"><span className="text-red-400 font-bold mt-1">1.</span><span>Assess the situation and any injuries. Ensure the scene is safe.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-400 font-bold mt-1">2.</span><span>Administer first aid if trained. Protect from the elements.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-400 font-bold mt-1">3.</span><span>If you have a signal, call for help. Provide your exact location.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-400 font-bold mt-1">4.</span><span>If you cannot call, activate your personal locator beacon (PLB) or SOS device.</span></li>
          <li className="flex items-start gap-3"><span className="text-red-400 font-bold mt-1">5.</span><span>Stay put unless moving is essential for safety. Make yourself visible.</span></li>
        </ul>
      </div>

      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Emergency Contacts</h4>
            {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm bg-[var(--color-accent-hover)] hover:bg-[var(--color-accent)] text-white font-semibold py-1 px-3 rounded-md transition-colors">
                    <PlusIcon className="w-4 h-4"/> Add Contact
                </button>
            )}
        </div>

        <div className="space-y-3">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-[var(--color-bg-secondary)] p-3 rounded-md flex justify-between items-center group">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{contact.name} <span className="text-sm text-[var(--color-text-secondary)]">({contact.relation})</span></p>
                <p className="text-[var(--color-accent-text)]">{contact.phone}</p>
              </div>
              <button onClick={() => handleRemoveContact(contact.id)} className="text-[var(--color-text-tertiary)] hover:text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-4 h-4"/></button>
            </div>
          ))}

          {isAdding && (
            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-md space-y-3">
                <input type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-[var(--color-bg-interactive)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]" />
                <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full bg-[var(--color-bg-interactive)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]" />
                <input type="text" placeholder="Relation" value={newContact.relation} onChange={e => setNewContact({...newContact, relation: e.target.value})} className="w-full bg-[var(--color-bg-interactive)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]" />
                <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setIsAdding(false)} className="text-sm bg-[var(--color-bg-interactive-hover)] hover:bg-[var(--color-bg-interactive)] text-white font-semibold py-1.5 px-3 rounded-md">Cancel</button>
                    <button onClick={handleAddContact} className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-3 rounded-md">Save</button>
                </div>
            </div>
          )}

          {contacts.length === 0 && !isAdding && (
            <p className="text-[var(--color-text-tertiary)] text-center py-4">No emergency contacts added.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyProtocol;