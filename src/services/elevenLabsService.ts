export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  baseUrl: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private baseUrl: string;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(apiKey: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB') {
    this.apiKey = apiKey;
    this.voiceId = voiceId; // Default to Adam voice
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  async synthesizeSpeech(
    text: string,
    voiceSettings?: Partial<VoiceSettings>
  ): Promise<string> {
    const defaultSettings: VoiceSettings = {
      stability: 0.75,
      similarity_boost: 0.8,
      style: 0.5,
      use_speaker_boost: true,
      ...voiceSettings
    };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: defaultSettings
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      this.stopCurrentAudio();

      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        resolve();
      };
      
      this.currentAudio.onerror = (error) => {
        reject(new Error('Audio playback failed'));
      };

      this.currentAudio.play().catch(reject);
    });
  }

  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  async speakText(text: string, voiceSettings?: Partial<VoiceSettings>): Promise<void> {
    try {
      const audioUrl = await this.synthesizeSpeech(text, voiceSettings);
      await this.playAudio(audioUrl);
      // Clean up the blob URL
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('Error speaking text:', error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}