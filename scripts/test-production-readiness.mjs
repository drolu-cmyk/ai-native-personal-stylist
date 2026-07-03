#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const baseProductionEnv = {
  NODE_ENV: 'production',
  APP_ENV: 'production',
  PUBLIC_APP_NAME: 'Personal Stylist',
  PUBLIC_WEB_URL: 'https://app.example.com',
  API_BASE_URL: 'https://api.example.com',
  API_PORT: '4000',
  RATE_LIMIT_MAX: '100',
  MAX_IMAGE_UPLOAD_MB: '8',
  AI_PROVIDER: 'openai',
  VOICE_STT_PROVIDER: 'google',
  VOICE_TTS_PROVIDER: 'google',
  VISION_PROVIDER: 'aws',
  WEATHER_PROVIDER: 'weatherapi',
  MAPS_PROVIDER: 'google',
  AUTH_PROVIDER: 'aws-cognito',
  DATABASE_PROVIDER: 'aws-dynamodb',
  OBJECT_STORAGE_PROVIDER: 'aws-s3',
  OBSERVABILITY_PROVIDER: 'aws-cloudwatch',
  HOSTING_PROVIDER: 'aws-ecs',
  AWS_REGION: 'us-east-1',
  AWS_ROLE_TO_ASSUME: 'arn:aws:iam::123456789012:role/example',
  ECR_REPOSITORY: 'personal-stylist-api',
  CORS_ORIGINS: 'https://app.example.com',
  STORAGE_DELETION_PRIVACY_READINESS_ACK: 'true'
};

function run(command, args, envPatch) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...baseProductionEnv, ...envPatch },
    encoding: 'utf8'
  });
}

function expectFailure(name, command, args, envPatch, expectedText) {
  const result = run(command, args, envPatch);
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0 || !output.includes(expectedText)) {
    console.error(`${name} did not fail as expected.`);
    console.error(output);
    process.exit(1);
  }
}

function expectSuccess(name, command, args) {
  const result = run(command, args, {});
  if (result.status !== 0) {
    console.error(`${name} did not pass as expected.`);
    console.error(`${result.stdout}\n${result.stderr}`);
    process.exit(1);
  }
}

expectFailure(
  'production env validation rejects mock provider',
  'node',
  ['scripts/validate-env.mjs', '--mode=production'],
  { AI_PROVIDER: 'mock' },
  'AI_PROVIDER must use a real provider in production'
);

expectFailure(
  'production env validation rejects missing live provider',
  'node',
  ['scripts/validate-env.mjs', '--mode=production'],
  { AUTH_PROVIDER: '' },
  'AUTH_PROVIDER is required'
);

expectFailure(
  'AWS preflight rejects mock provider',
  'node',
  ['scripts/aws-release-preflight.mjs'],
  { MAPS_PROVIDER: 'mock' },
  'MAPS_PROVIDER must use a real provider for production release readiness'
);

expectFailure(
  'AWS preflight rejects wildcard CORS',
  'node',
  ['scripts/aws-release-preflight.mjs'],
  { CORS_ORIGINS: '*' },
  'CORS_ORIGINS must not include wildcards for production'
);

expectFailure(
  'AWS preflight rejects missing readiness acknowledgment',
  'node',
  ['scripts/aws-release-preflight.mjs'],
  { STORAGE_DELETION_PRIVACY_READINESS_ACK: 'false' },
  'STORAGE_DELETION_PRIVACY_READINESS_ACK must be true'
);

expectSuccess('production env validation accepts real providers', 'node', ['scripts/validate-env.mjs', '--mode=production']);
expectSuccess('AWS preflight accepts real provider readiness config', 'node', ['scripts/aws-release-preflight.mjs']);

console.log('Production readiness tests passed.');
