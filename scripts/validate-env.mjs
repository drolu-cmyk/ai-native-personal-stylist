#!/usr/bin/env node

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] || process.env.APP_ENV || process.env.NODE_ENV || 'development';
const providers = ['openai', 'google', 'aws', 'mock'];
const required = ['NODE_ENV', 'PUBLIC_APP_NAME', 'PUBLIC_WEB_URL', 'API_BASE_URL', 'API_PORT'];
const providerVars = ['AI_PROVIDER', 'VOICE_STT_PROVIDER', 'VOICE_TTS_PROVIDER', 'VISION_PROVIDER', 'WEATHER_PROVIDER', 'MAPS_PROVIDER'];
const errors = [];

function value(name) { return process.env[name]?.trim(); }
function requireVar(name) { if (!value(name)) errors.push(`${name} is required.`); }
function validateUrl(name) { try { new URL(value(name)); } catch { errors.push(`${name} must be a valid URL.`); } }
function validateInt(name, min, max) {
  const number = Number(value(name));
  if (!Number.isInteger(number) || number < min || number > max) errors.push(`${name} must be between ${min} and ${max}.`);
}

for (const name of required) requireVar(name);
for (const name of providerVars) {
  const current = value(name) || 'mock';
  if (!providers.includes(current)) errors.push(`${name} must be one of ${providers.join(', ')}.`);
}
validateUrl('PUBLIC_WEB_URL');
validateUrl('API_BASE_URL');
validateInt('API_PORT', 1, 65535);
validateInt('RATE_LIMIT_MAX', 1, 100000);
validateInt('MAX_IMAGE_UPLOAD_MB', 1, 25);

if (errors.length) {
  console.error('Environment validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Environment validation passed for mode: ${mode}.`);
