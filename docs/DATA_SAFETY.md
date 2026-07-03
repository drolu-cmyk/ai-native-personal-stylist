# Data Safety

This repo is public. Do not commit real user data.

## Not allowed in git

- real names tied to wardrobe or profile data
- email addresses or phone numbers
- home, work, or live location trails
- private images
- voice recordings or transcripts from real users
- provider keys or service account files
- billing data
- production logs

## Allowed in git

- sample users
- sample closet items
- placeholder image references
- local development environment examples
- provider adapter names

## Release rules

- Real user data must live in managed storage, not source control.
- Secrets must live in GitHub or cloud secret stores.
- Logs must avoid voice text, private image metadata, and precise location trails.
- Users need a way to delete closet and profile data before public usage expands.
