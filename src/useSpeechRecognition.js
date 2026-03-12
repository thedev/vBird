import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that wraps the Web Speech API (webkitSpeechRecognition).
 *
 * @param {Object} options
 * @param {boolean}  options.listening   - Whether to listen
 * @param {Function} options.onResult    - Called with final transcript string
 * @param {Function} options.onInterim   - Called with interim transcript string
 * @param {Function} options.onError     - Called with error
 */
export function useSpeechRecognition({ listening, onResult, onInterim, onError }) {
  const recognitionRef = useRef(null);
  const listeningRef = useRef(listening);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript && onInterim) onInterim(interimTranscript);
      if (finalTranscript && onResult) onResult(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are benign – ignore them
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      // Auto-restart if still in listening mode
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    if (listening) {
      try {
        recognition.start();
      } catch {
        // Already started
      }
    }

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only setup once

  // Toggle listening on/off
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      try {
        recognition.start();
      } catch {
        // Already running
      }
    } else {
      recognition.stop();
    }
  }, [listening]);

  return { stopRecognition };
}
