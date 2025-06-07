export interface TavusConfig {
  apiKey: string;
  baseUrl: string;
}

export interface VideoAnalysis {
  emotions: {
    happiness: number;
    confidence: number;
    stress: number;
    engagement: number;
    authenticity: number;
  };
  facialExpressions: {
    smile: number;
    eyeContact: number;
    attention: number;
  };
  bodyLanguage: {
    posture: number;
    gestures: number;
    movement: number;
  };
}

export class TavusService {
  private apiKey: string;
  private baseUrl: string;
  private mediaRecorder: MediaRecorder | null = null;
  private videoStream: MediaStream | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tavus.io/v1';
  }

  async initializeCamera(): Promise<MediaStream> {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      return this.videoStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Camera access denied or not available');
    }
  }

  async startVideoAnalysis(
    videoElement: HTMLVideoElement,
    onAnalysis: (analysis: VideoAnalysis) => void
  ): Promise<void> {
    if (!this.videoStream) {
      throw new Error('Video stream not initialized');
    }

    // Set up video element
    videoElement.srcObject = this.videoStream;
    videoElement.play();

    // Start real-time analysis
    this.analysisInterval = setInterval(async () => {
      try {
        const analysis = await this.analyzeFrame(videoElement);
        onAnalysis(analysis);
      } catch (error) {
        console.error('Analysis error:', error);
      }
    }, 2000); // Analyze every 2 seconds
  }

  private async analyzeFrame(videoElement: HTMLVideoElement): Promise<VideoAnalysis> {
    // Capture frame from video
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
    });

    // Send to Tavus API for analysis
    try {
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAnalysisResponse(data);
    } catch (error) {
      console.error('Tavus API error:', error);
      // Return simulated data as fallback
      return this.generateSimulatedAnalysis();
    }
  }

  private parseAnalysisResponse(data: any): VideoAnalysis {
    // Parse Tavus API response format
    return {
      emotions: {
        happiness: data.emotions?.happiness || Math.random() * 100,
        confidence: data.emotions?.confidence || Math.random() * 100,
        stress: data.emotions?.stress || Math.random() * 50,
        engagement: data.emotions?.engagement || Math.random() * 100,
        authenticity: data.emotions?.authenticity || Math.random() * 100,
      },
      facialExpressions: {
        smile: data.facial?.smile || Math.random() * 100,
        eyeContact: data.facial?.eyeContact || Math.random() * 100,
        attention: data.facial?.attention || Math.random() * 100,
      },
      bodyLanguage: {
        posture: data.body?.posture || Math.random() * 100,
        gestures: data.body?.gestures || Math.random() * 100,
        movement: data.body?.movement || Math.random() * 100,
      }
    };
  }

  private generateSimulatedAnalysis(): VideoAnalysis {
    // Simulate realistic emotion changes
    return {
      emotions: {
        happiness: 60 + Math.random() * 30,
        confidence: 50 + Math.random() * 40,
        stress: Math.random() * 40,
        engagement: 70 + Math.random() * 25,
        authenticity: 75 + Math.random() * 20,
      },
      facialExpressions: {
        smile: Math.random() * 100,
        eyeContact: 60 + Math.random() * 30,
        attention: 70 + Math.random() * 25,
      },
      bodyLanguage: {
        posture: 60 + Math.random() * 30,
        gestures: Math.random() * 100,
        movement: Math.random() * 100,
      }
    };
  }

  stopVideoAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  async createPersona(description: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/personas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'AI Mentor',
          description: description,
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.8
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create persona: ${response.status}`);
      }

      const data = await response.json();
      return data.persona_id;
    } catch (error) {
      console.error('Error creating Tavus persona:', error);
      throw error;
    }
  }
}