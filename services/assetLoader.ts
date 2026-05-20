
export class AssetLoader {
  private static instance: AssetLoader;
  private assets: Map<string, HTMLImageElement | HTMLAudioElement> = new Map();
  private loadingCount = 0;
  private totalCount = 0;
  private onProgressListeners: ((progress: number) => void)[] = [];

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  onProgress(callback: (progress: number) => void) {
    this.onProgressListeners.push(callback);
  }

  private updateProgress() {
    const progress = this.totalCount === 0 ? 100 : (this.loadingCount / this.totalCount) * 100;
    this.onProgressListeners.forEach(cb => cb(progress));
  }

  async loadImage(name: string, url: string): Promise<HTMLImageElement> {
    if (this.assets.has(name)) return this.assets.get(name) as HTMLImageElement;
    
    this.totalCount++;
    this.updateProgress();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = url;
      img.onload = () => {
        this.assets.set(name, img);
        this.loadingCount++;
        this.updateProgress();
        resolve(img);
      };
      img.onerror = (e) => {
        console.error(`Failed to load image: ${url}`, e);
        this.loadingCount++; // Still count as "processed" to progress the bar
        this.updateProgress();
        reject(e);
      };
    });
  }

  getImage(name: string): HTMLImageElement | undefined {
    return this.assets.get(name) as HTMLImageElement;
  }

  // Future expansion for audio files
  async loadAudio(name: string, url: string): Promise<HTMLAudioElement> {
    if (this.assets.get(name)) return this.assets.get(name) as HTMLAudioElement;
    
    this.totalCount++;
    this.updateProgress();

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.oncanplaythrough = () => {
        this.assets.set(name, audio);
        this.loadingCount++;
        this.updateProgress();
        resolve(audio);
      };
      audio.onerror = (e) => {
        this.loadingCount++;
        this.updateProgress();
        reject(e);
      };
    });
  }
}

export const assetLoader = AssetLoader.getInstance();
