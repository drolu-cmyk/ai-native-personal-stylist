# Startup Credits Plan

Keep the project zero-to-low cost until the founder deliberately connects paid or credit-backed providers.

## Google Cloud

Create a company-controlled billing account, apply through the startup program if eligible, use separate dev/staging/prod projects, set budget alerts, deploy the API to Cloud Run, and store provider credentials in Secret Manager.

## OpenAI

Apply through eligible startup channels, keep a company-controlled organization, create separate environment credentials, set usage limits, and route all calls through the API layer.

## Cost controls

Use mock providers by default, cap upload size, add rate limits, and never expose provider credentials to the web client.
