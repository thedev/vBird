import { useState } from 'react';
import { updateObservation, deleteObservation } from './db';

/**
 * Individual checklist row with inline edit support.
 */
function ObservationRow({ obs, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [editCount, setEditCount] = useState(obs.count);
  const [editSpecies, setEditSpecies] = useState(obs.species);

  const saveEdit = async () => {
    const count = parseInt(editCount, 10);
    if (!editSpecies.trim() || isNaN(count) || count < 1) return;
    await updateObservation(obs.id, { count, species: editSpecies.trim() });
    setEditing(false);
    onChanged();
  };

  const cancelEdit = () => {
    setEditCount(obs.count);
    setEditSpecies(obs.species);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove "${obs.species}" from the list?`)) {
      await deleteObservation(obs.id);
      onChanged();
    }
  };

  if (editing) {
    return (
      <li className="obs-row obs-row--editing">
        <div className="obs-edit-fields">
          <input
            type="number"
            className="obs-edit-count"
            value={editCount}
            min="1"
            onChange={(e) => setEditCount(e.target.value)}
            aria-label="Count"
          />
          <input
            type="text"
            className="obs-edit-species"
            value={editSpecies}
            onChange={(e) => setEditSpecies(e.target.value)}
            aria-label="Species"
          />
        </div>
        <div className="obs-edit-actions">
          <button className="btn-save" onClick={saveEdit} aria-label="Save">
            ✔ Save
          </button>
          <button className="btn-cancel" onClick={cancelEdit} aria-label="Cancel">
            ✖ Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="obs-row" onClick={() => setEditing(true)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditing(true); }}
      aria-label={`${obs.count} ${obs.species} – tap to edit`}
    >
      <span className="obs-count">{obs.count}</span>
      <span className="obs-species">{obs.species}</span>
      <button
        className="btn-delete"
        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
        aria-label={`Delete ${obs.species}`}
      >
        🗑
      </button>
    </li>
  );
}

/**
 * ChecklistView – shows the full list of observations with edit/delete.
 */
export default function ChecklistView({ observations, onChanged }) {
  if (!observations || observations.length === 0) {
    return (
      <div className="checklist-empty">
        <p>No observations yet. Use the mic to add some!</p>
      </div>
    );
  }

  return (
    <ul className="checklist" aria-label="Bird observations">
      {observations.map((obs) => (
        <ObservationRow key={obs.id} obs={obs} onChanged={onChanged} />
      ))}
    </ul>
  );
}
