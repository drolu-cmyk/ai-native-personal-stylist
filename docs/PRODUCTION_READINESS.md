# Production Readiness

The app should move from internal use to customer use without changing the core rules.

## Shipping path

1. Internal mock mode: local closet, mock weather, mock calendar, no paid providers.
2. Internal provider mode: real voice, weather, maps, and model adapters behind server controls.
3. Private customer pilot: consent, account boundary, logging, deletion path, and support process.
4. Public production: monitored workloads, cost controls, incident response, and clear privacy terms.

## Voice quality

Voice should be short, useful, and calm. The app should not produce long speeches or vague styling advice.

A good answer sounds like:

"Wear the white oxford, charcoal trouser, black loafers, and rain shell. It fits dinner, the rain, and the walk."

Rules:

- one main outfit
- one reason
- one caution only when needed
- no invented clothes
- no long personality performance
- no hidden scoring details

## Geospatial and mapping

Location context should improve the outfit only when the user allows it.

Useful signals:

- weather at destination
- walking distance
- transit time
- indoor or outdoor venue
- neighborhood formality
- rain, snow, heat, wind, or humidity

Do not store precise live location trails in git or logs. Production should keep location access narrow, consented, and easy to turn off.

## Customer trust

Before customer use, the app needs:

- account boundary
- data deletion path
- upload limits
- provider cost limits
- request logging controls
- private image handling
- security contact
- clear license
- visible CI status

## Olu AI Skills connection

The Olu AI Skills repo should support product shipping, not just internal demos.

Use it for:

- short product explainer
- onboarding walkthrough
- outfit flow diagram
- release notes video
- customer education clips

The skills should help customers understand the product without adding visual noise to the app itself.
