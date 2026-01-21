# Followspot Cue Sheet App

A lightweight, offline-first followspot cue sheet application for theatre lighting operators.

## Features

- **Master Cue Sheet**: Complete view of all cues with inline editing
- **Operator Views**: Filtered views for Spot 1-4 showing only relevant cues
- **Save/Load**: Export to JSON files, load from local storage
- **Auto-Save**: Optional auto-save every 2 minutes
- **PDF Export**: Generate printable PDFs for master and individual operators
- **Character Management**: Editable character/target dropdown list
- **Dark Mode**: High contrast, low-light friendly interface
- **100% Offline**: Works without internet after initial load

## Quick Start

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
2. Sample data loads automatically on first use
3. Edit cues inline by clicking any cell
4. Use tabs to switch between Master and Operator views

## Save/Load Files

### Saving
1. Click **"Save to File"** button in the toolbar
2. Choose location and filename (e.g., `Hamlet_Followspots_2026.json`)
3. File saves as JSON with all cues and settings

### Loading
1. Click **"Load from File"** button
2. Select a previously saved `.json` file
3. All cues and settings restore automatically

### Auto-Save
- Toggle **"Auto-Save"** checkbox to enable
- Saves to browser localStorage every 2 minutes
- Also saves on every edit

## PDF Export

1. Click **"Export PDF"** dropdown
2. Choose "Master Sheet" or individual Spot operator
3. PDF generates and downloads automatically
4. Formatted for printing with headers and production info

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Quick save to localStorage
- `Ctrl/Cmd + N`: Add new cue
- `Escape`: Cancel editing / Close modals

## Column Reference

| Column | Description |
|--------|-------------|
| Cue # | Cue number (e.g., 1, 1.5, 2A) |
| Page/Bar | Page number, bar, or measure reference |
| Go Trigger | When to execute (e.g., "LX 42 GO", "on lyric 'rise again'") |
| Character | Who to follow (populated from Characters list) |
| Location | Stage position (DSR, DSL, USC, etc.) |
| Spot 1-4 Action | What each operator does (Pickup, Fade, Out, Hold, etc.) |
| Size | Frame size (Full Body, Mid, Headshot, Tight) |
| Color/Gel | Color frame/gel number |
| Intensity | Percentage brightness |
| Notes | Additional instructions |
| Special FX | Special effects or flags |

## Stage Location Abbreviations

- **DS** = Downstage (toward audience)
- **US** = Upstage (away from audience)
- **C** = Center
- **R** = Right (stage right, actor's right)
- **L** = Left (stage left, actor's left)

## Browser Compatibility

- Chrome 86+ (recommended for File System Access API)
- Firefox 78+
- Safari 14+
- Edge 86+

## Technical Notes

- Data stored as JSON
- Uses File System Access API where available, falls back to download/upload
- jsPDF library included for PDF generation
- No server required - runs entirely in browser

## License

MIT License - Free for theatre use
