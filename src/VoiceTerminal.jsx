import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { parseObservation, loadSpecies } from './parser';
import { addObservation } from './db';

/**
 * MicIcon – pulsing when active
 */
function MicIcon({ active }) {
  return (
    <span
      className={`mic-icon${active ? ' mic-icon--active' : ''}`}
      aria-hidden="true"
    >
      🎤
    </span>
  );
}

/**
 * VoiceTerminal – handles microphone toggle, real-time transcript, and
 * dispatches successfully parsed observations.
 */
export default function VoiceTerminal({ onObservationAdded }) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [lastFinal, setLastFinal] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [speciesList, setSpeciesList] = useState(null);
  const [browserSupported, setBrowserSupported] = useState(true);

  // Load species list once on mount
  useEffect(() => {
    loadSpecies()
      .then(setSpeciesList)
      .catch(() => setStatusMsg('Could not load species list.'));
  }, []);

  const handleFinal = useCallback(
    async (transcript) => {
      setLastFinal(transcript);
      setInterimText('');

      if (!speciesList) {
        setStatusMsg('Species list still loading…');
        return;
      }

      const result = parseObservation(transcript, speciesList);
      if (result) {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([80]);

        await addObservation({
          species: result.species,
          count: result.count,
          rawText: result.rawText,
          date: new Date().toISOString().split('T')[0],
        });
        setStatusMsg(`✅ Caught: ${result.count} × ${result.species}`);
        if (onObservationAdded) onObservationAdded();
      } else {
        setStatusMsg(`❓ Not recognised: "${transcript}"`);
      }
    },
    [speciesList, onObservationAdded]
  );

  const handleError = useCallback((err) => {
    if (err === 'not-allowed') {
      setBrowserSupported(false);
      setStatusMsg('Microphone access denied. Please allow mic access and reload.');
    } else {
      setBrowserSupported(false);
      setStatusMsg(`Speech recognition error: ${err}`);
    }
    setListening(false);
  }, []);

  useSpeechRecognition({
    listening,
    onResult: handleFinal,
    onInterim: setInterimText,
    onError: handleError,
  });

  const toggle = () => {
    if (!browserSupported && !listening) return;
    setListening((prev) => !prev);
    setStatusMsg('');
    setInterimText('');
  };

  return (
    <div className="voice-terminal">
      <button
        className={`btn-record${listening ? ' btn-record--active' : ''}`}
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? 'Stop recording' : 'Start recording'}
      >
        <MicIcon active={listening} />
        <span>{listening ? 'Listening…' : 'Record Observation'}</span>
      </button>

      {/* Real-time transcript display */}
      <div className="transcript-box" aria-live="polite" aria-atomic="false">
        {interimText && (
          <p className="transcript-interim">{interimText}</p>
        )}
        {lastFinal && !interimText && (
          <p className="transcript-final">{lastFinal}</p>
        )}
        {!interimText && !lastFinal && (
          <p className="transcript-placeholder">
            {listening
              ? 'Say something like "Three Blue Jays"…'
              : 'Tap the button to start recording.'}
          </p>
        )}
      </div>

      {statusMsg && (
        <p className="status-msg" role="status">
          {statusMsg}
        </p>
      )}
    </div>
  );
}
