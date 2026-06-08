const providerValues = ['openai', 'google', 'aws', 'mock'] as const;
type Provider = (typeof providerValues)[number];

function provider(name: string): Provider {
  const value = process.env[name] || 'mock';
  if (!providerValues.includes(value as Provider)) throw new Error(`${name} must be a supported provider`);
  return value as Provider;
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
      maps: provider('MAPS_PROVIDER')
    }
  };
}

export type AppConfig = ReturnType<typeof loadConfig>;
