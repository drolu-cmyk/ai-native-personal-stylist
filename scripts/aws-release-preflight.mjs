#!/usr/bin/env node

const required = [
  'AWS_REGION',
  'AWS_ROLE_TO_ASSUME',
  'ECR_REPOSITORY',
  'PUBLIC_WEB_URL',
  'API_BASE_URL',
  'CORS_ORIGINS',
  'RATE_LIMIT_MAX',
  'MAX_IMAGE_UPLOAD_MB',
  'STORAGE_DELETION_PRIVACY_READINESS_ACK'
];

const providerVars = [
  'AI_PROVIDER',
  'VOICE_STT_PROVIDER',
  'VOICE_TTS_PROVIDER',
  'VISION_PROVIDER',
  'WEATHER_PROVIDER',
  'MAPS_PROVIDER',
  'AUTH_PROVIDER',
  'DATABASE_PROVIDER',
  'OBJECT_STORAGE_PROVIDER',
  'OBSERVABILITY_PROVIDER',
  'HOSTING_PROVIDER'
];

const errors = [];
const warnings = [];

function value(name) {
  return process.env[name]?.trim();
}

function requireEnv(name) {
  if (!value(name)) errors.push(`${name} is required for AWS release readiness.`);
}

function requireUrl(name) {
  const raw = value(name);
  if (!raw) return;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') errors.push(`${name} must use https for production.`);
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

for (const name of required) requireEnv(name);
requireUrl('PUBLIC_WEB_URL');
requireUrl('API_BASE_URL');

if (value('CORS_ORIGINS')?.includes('*')) {
  errors.push('CORS_ORIGINS must not include wildcards for production.');
}

for (const name of providerVars) {
  const current = value(name);
  if (!current) {
    errors.push(`${name} is required for production release readiness.`);
    continue;
  }
  if (!/^[a-z][a-z0-9_-]*$/i.test(current)) errors.push(`${name} must be an explicit provider name.`);
  if (current.toLowerCase() === 'mock') errors.push(`${name} must use a real provider for production release readiness.`);
}

if (value('STORAGE_DELETION_PRIVACY_READINESS_ACK') !== 'true') {
  errors.push('STORAGE_DELETION_PRIVACY_READINESS_ACK must be true after storage, deletion, privacy, consent, and logging readiness are reviewed.');
}

if (errors.length) {
  console.error('AWS release preflight failed:');
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('AWS release preflight passed.');
for (const warning of warnings) console.warn(`Warning: ${warning}`);
