#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] || process.env.APP_ENV || process.env.NODE_ENV || 'development';
const required = ['NODE_ENV', 'PUBLIC_APP_NAME', 'PUBLIC_WEB_URL', 'API_BASE_URL', 'API_PORT'];
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
const strictModes = new Set(['ci', 'staging', 'production']);
const productionModes = new Set(['production']);
const allowExampleEnv = process.env.ALLOW_EXAMPLE_ENV === 'true' || !strictModes.has(mode);

function loadLocalEnv() {
  const envFiles = allowExampleEnv ? ['.env.local', '.env', '.env.example'] : ['.env.local', '.env'];
  for (const fileName of envFiles) {
    const envPath = resolve(process.cwd(), fileName);
    if (!existsSync(envPath)) continue;

    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const name = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const unquotedValue = rawValue.replace(/^["']|["']$/g, '');
      if (name && process.env[name] === undefined) process.env[name] = unquotedValue;
    }
  }
}

function value(name) { return process.env[name]?.trim(); }
function requireVar(name) { if (!value(name)) errors.push(`${name} is required.`); }
function validateUrl(name) { try { new URL(value(name)); } catch { errors.push(`${name} must be a valid URL.`); } }
function validateHttpsUrl(name) {
  const raw = value(name);
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') errors.push(`${name} must use https in production.`);
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}
function validateInt(name, min, max) {
  const number = Number(value(name));
  if (!Number.isInteger(number) || number < min || number > max) errors.push(`${name} must be between ${min} and ${max}.`);
}
function validateProviderName(name) {
  const current = value(name);
  if (!current) {
    errors.push(`${name} is required.`);
    return;
  }
  if (!/^[a-z][a-z0-9_-]*$/i.test(current)) errors.push(`${name} must be an explicit provider name.`);
  if (productionModes.has(mode) && current.toLowerCase() === 'mock') {
    errors.push(`${name} must use a real provider in production, not mock.`);
  }
}

loadLocalEnv();

for (const name of required) requireVar(name);
for (const name of providerVars) validateProviderName(name);
if (productionModes.has(mode)) {
  validateHttpsUrl('PUBLIC_WEB_URL');
  validateHttpsUrl('API_BASE_URL');
} else {
  validateUrl('PUBLIC_WEB_URL');
  validateUrl('API_BASE_URL');
}
validateInt('API_PORT', 1, 65535);
validateInt('RATE_LIMIT_MAX', 1, 100000);
validateInt('MAX_IMAGE_UPLOAD_MB', 1, 25);

if (errors.length) {
  console.error('Environment validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Environment validation passed for mode: ${mode}.`);
