# PokéFossil v6 Operating Summary

## Default Architecture
- Framework: React 19 + TypeScript + Vite + Tailwind CSS v4.
- UI Paradigm: Pokémon FireRed / LeafGreen (GBA) UI aesthetics.
- Global Typography: 'Press Start 2P', fallback to sans-serif.
- Color System: Authentic FRLG palette (FRLG Red #e65050, FRLG Blue #5080e6, FRLG Light BG #f8f8f8, etc.).
- Components: Dialog boxes with rounded corners (8px) and thick colored borders; FRLG menu tabs with rounded top corners.

## Current Milestone (FRLG UI Transformation)
1. Rewrite src/index.css:
   - Strip .noise-overlay, .vignette-overlay, .float-animation, .sprite-sepia, and --background: #f4f1ea variables.
   - Set global font to 'Press Start 2P', sans-serif.
   - Define FRLG palette (--frlg-bg-light, --frlg-red, --frlg-blue, etc.).
   - Create .dialog-box class: white background, border-radius: 8px, thick colored border, subtle inner shadow.
2. Rewrite src/App.tsx:
   - Eliminate vignette and noise overlays.
   - Redesign navigation to authentic FRLG menu tabs (rounded top corners, distinct active/inactive states).
   - Apply light blue/grey tiled background pattern instead of aged paper cream.

## Key Guardrails
- Must actually edit files using write_to_file or replace_file_content.
- Maintain build and type integrity (npm run build).
- Keep subagent reporting via send_message.

## Current Runtime Constraints
- OS: Windows, Shell: PowerShell, Working Directory: d:\Pokefossil.
