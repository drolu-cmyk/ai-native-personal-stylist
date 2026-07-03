# Styling Skill System

This document defines reusable modules for the styling agent.

## Skills

- voice-intent-parser: converts a request into structured intent.
- outfit-planner: ranks closet items and creates outfit slots.
- recommendation-explainer: turns structured slots into a short user-facing explanation.

## Contract

Each skill should include instructions, examples, and eval cases. The core rule is simple: recommend only real closet item IDs and explain the decision clearly.
