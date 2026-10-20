'use client';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface VoiceSelectionResult {
  voice: SpeechSynthesisVoice | null;
  isNativeVietnamese: boolean;
  warningMessage?: string;
}

export class SpeechService {
  private static recognitionInstance: SpeechRecognitionInstance | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isVoicesInitialized = false;
  private static voiceWarningListeners: Array<(msg: string) => void> = [];

  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public static isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Register a listener for Vietnamese voice fallback warnings.
   */
  public static onVoiceWarning(listener: (msg: string) => void): () => void {
    this.voiceWarningListeners.push(listener);
    return () => {
      this.voiceWarningListeners = this.voiceWarningListeners.filter(l => l !== listener);
    };
  }

  private static emitVoiceWarning(msg: string) {
    this.voiceWarningListeners.forEach(listener => {
      try {
        listener(msg);
      } catch {
        // ignore
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lopminh:tts-warning', { detail: msg }));
    }
  }

  /**
   * Initializes and listens for window.speechSynthesis.onvoiceschanged event to capture loaded voices.
   */
  public static initializeVoices(): void {
    if (typeof window === 'undefined' || !this.isSynthesisSupported()) return;
    if (this.isVoicesInitialized) return;

    this.isVoicesInitialized = true;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
      }
    };

    updateVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  /**
   * Asynchronously retrieves the full list of available voices.
   */
  public static async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !this.isSynthesisSupported()) return [];

    this.initializeVoices();

    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
      return voices;
    }

    return new Promise((resolve) => {
      const handleVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices();
        this.cachedVoices = voices;
        resolve(voices);
      };

      if ('onvoiceschanged' in window.speechSynthesis) {
        const prevHandler = window.speechSynthesis.onvoiceschanged;
        window.speechSynthesis.onvoiceschanged = (ev) => {
          if (prevHandler) prevHandler.call(window.speechSynthesis, ev);
          handleVoicesChanged();
        };
      }

      // Timeout fallback if voiceschanged already fired or never fires
      setTimeout(() => {
        const fallback = window.speechSynthesis.getVoices() || [];
        this.cachedVoices = fallback;
        resolve(fallback);
      }, 500);
    });
  }

  /**
   * Algorithm to select the best natural Vietnamese voice:
   * - Priority 1: Name contains "Google Tiếng Việt" (Google Chrome, Cốc Cốc)
   * - Priority 2: Name contains "Microsoft HoaiMy" or "Microsoft NamMinh" (Microsoft Edge, Windows Vietnamese Speech Package)
   * - Priority 3: Any voice where voice.lang includes 'vi' or starts with 'vi'
   */
  public static async getBestVietnameseVoice(): Promise<VoiceSelectionResult> {
    const voices = await this.getAvailableVoices();

    const viVoices = voices.filter(v => {
      const langLower = (v.lang || '').toLowerCase();
      const nameLower = (v.name || '').toLowerCase();
      return (
        langLower.includes('vi') ||
        langLower.startsWith('vi') ||
        nameLower.includes('tiếng việt') ||
        nameLower.includes('vietnamese')
      );
    });

    if (viVoices.length === 0) {
      return {
        voice: null,
        isNativeVietnamese: false,
        warningMessage: 'Trình duyệt của thầy/cô chưa có giọng tiếng Việt. Khuyên dùng Google Chrome hoặc Microsoft Edge để có giọng đọc tự nhiên nhất.'
      };
    }

    // Priority 1: Google Tiếng Việt (Chrome / Cốc Cốc)
    const googleVoice = viVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return nameLower.includes('google') && (nameLower.includes('tiếng việt') || nameLower.includes('tieng viet') || nameLower.includes('vietnamese'));
    });
    if (googleVoice) {
      return { voice: googleVoice, isNativeVietnamese: true };
    }

    // Priority 2: Microsoft HoaiMy or Microsoft NamMinh (Edge / Windows)
    const msVoice = viVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return (
        nameLower.includes('hoaimy') ||
        nameLower.includes('namminh') ||
        nameLower.includes('hoài my') ||
        nameLower.includes('nam minh')
      );
    });
    if (msVoice) {
      return { voice: msVoice, isNativeVietnamese: true };
    }

    // Priority 3: Any voice with lang containing 'vi'
    return { voice: viVoices[0], isNativeVietnamese: true };
  }

  /**
   * Finds the best available English voice for bilingual pronunciation.
   */
  public static async getBestEnglishVoice(): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getAvailableVoices();
    const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
    if (enVoices.length === 0) return null;

    const preferred = enVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('natural') || n.includes('google us') || n.includes('online');
    });

    return preferred || enVoices[0];
  }

  /**
   * Calibrated speech synthesis:
   * - rate = 0.95 (tốc độ đọc vừa phải, không quá nhanh để thầy cô nghe rõ)
   * - pitch = 1.0 (cao độ tự nhiên, ấm áp)
   * - voice = vietnameseVoice
   * - lang = 'vi-VN'
   */
  public static async speakText(
    text: string,
    lang: 'vi-VN' | 'en-US' = 'vi-VN',
    rate: number = 0.95
  ): Promise<VoiceSelectionResult> {
    if (!this.isSynthesisSupported()) {
      throw new Error('Trình duyệt không hỗ trợ tổng hợp giọng nói (SpeechSynthesis)');
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
    utterance.rate = rate; // 0.95 for natural Vietnamese pacing

    let result: VoiceSelectionResult = { voice: null, isNativeVietnamese: true };

    if (lang === 'vi-VN') {
      utterance.lang = 'vi-VN';
      result = await this.getBestVietnameseVoice();

      if (result.voice) {
        utterance.voice = result.voice;
      } else {
        // Fallback warning: no native Vietnamese voice installed
        if (result.warningMessage) {
          this.emitVoiceWarning(result.warningMessage);
        }
      }
    } else {
      utterance.lang = 'en-US';
      const enVoice = await this.getBestEnglishVoice();
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    return new Promise((resolve) => {
      utterance.onend = () => resolve(result);
      utterance.onerror = (e) => {
        // Resolve on cancel/interrupt so UI state resets cleanly
        resolve(result);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Start native Web Speech recognition in Vietnamese (vi-VN).
   */
  public static startVoiceRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): { stop: () => void } {
    if (!this.isRecognitionSupported()) {
      onError('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói Web Speech API.');
      return { stop: () => {} };
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        throw new Error('Speech Recognition not found');
      }

      if (this.recognitionInstance) {
        try {
          this.recognitionInstance.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        if (finalTranscript.trim()) {
          onResult(finalTranscript.trim(), true);
        } else if (interimTranscript.trim()) {
          onResult(interimTranscript.trim(), false);
        }
      };

      recognition.onerror = (event: Event) => {
        const errorDetail = (event as unknown as { error?: string }).error || 'Lỗi nhận diện âm thanh';
        onError(errorDetail);
      };

      recognition.onend = () => {
        onEnd();
      };

      recognition.start();
      this.recognitionInstance = recognition;

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        }
      };
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Không thể khởi động micro.');
      return { stop: () => {} };
    }
  }
}
