function provider(name: string): string {
  const value = process.env[name] || 'mock';
  if (!/^[a-z][a-z0-9_-]*$/i.test(value)) throw new Error(`${name} must be an explicit provider name`);
  if ((process.env.APP_ENV || process.env.NODE_ENV) === 'production' && value.toLowerCase() === 'mock') {
    throw new Error(`${name} must use a real provider in production`);
  }
  return value;
}

export function loadConfig() {
  return {
    apiPort: Number(process.env.API_PORT || 4000),
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
    maxImageUploadMb: Number(process.env.MAX_IMAGE_UPLOAD_MB || 8),
    providers: {
      ai: provider('AI_PROVIDER'),
      voiceStt: provider('VOICE_STT_PROVIDER'),
      voiceTts: provider('VOICE_TTS_PROVIDER'),
      vision: provider('VISION_PROVIDER'),
      weather: provider('WEATHER_PROVIDER'),
      maps: provider('MAPS_PROVIDER'),
      auth: provider('AUTH_PROVIDER'),
      database: provider('DATABASE_PROVIDER'),
      objectStorage: provider('OBJECT_STORAGE_PROVIDER'),
      observability: provider('OBSERVABILITY_PROVIDER'),
      hosting: provider('HOSTING_PROVIDER')
    }
  };
}

export type AppConfig = ReturnType<typeof loadConfig>;
