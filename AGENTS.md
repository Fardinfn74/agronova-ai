# AgroNova Project Guidelines

- Keep the public landing page at `/` and the interactive product demo at `/demo`; this preserves the story-first entry while giving the full workflow a focused workspace.
- Keep demo calculations deterministic and client-side with clearly labeled dated sample data; live NASA/API and persistence upgrades come later without pretending demo values are live.
- Centralize all sample fields, crop facts, NASA observations, scenario logic, and translations in `src/lib/agronova-demo.ts`; one evidence model keeps every recommendation traceable.
- Keep demo and live dashboard navigation in the shared `Workspace`; this preserves identical responsive behavior across both modes.
