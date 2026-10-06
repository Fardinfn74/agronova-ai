# Responsive navigation and dashboard cleanup

## Build

- Make the shared demo/live dashboard sidebar collapsible on desktop, with a clear control at its upper-right edge.
- Keep section labels visible when expanded and switch to compact icon navigation when collapsed.
- Move Profile to the sidebar footer and add a neighboring current-plan control that opens the plan details only when requested.
- Remove the always-visible current-plan panel from every dashboard section.
- On phones and tablets, use an accessible slide-out workspace menu so content remains usable without a narrow fixed sidebar.
- Replace the landing-page mobile navigation with a menu toggle beside the AgroNova logo; it opens and closes a stacked list of links and Login / Signup.

## Responsive verification

- Check the landing page, demo dashboard, and authenticated dashboard layouts at phone, tablet, and desktop widths.
- Verify menu open/close, sidebar expansion, Profile, current-plan details, and the floating Nova control without overlaps.
- Confirm metadata remains complete and the preview builds without errors.

## Technical details

- Reuse the shared `Workspace` for demo and authenticated dashboards so behavior stays consistent.
- Keep existing design tokens and clay/glass visual language; use existing button controls and Lucide icons.
- Keep all current data, authentication, and NASA behavior unchanged.
