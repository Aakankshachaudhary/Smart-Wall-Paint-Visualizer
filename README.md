# Smart Wall Paint Visualizer

A frontend-only wall paint visualization project built with HTML, CSS, and JavaScript.

## Current Features

- Room image upload with JPG/PNG validation
- 5 MB upload limit
- Manual polygon wall selection
- Undo, clear, and finish selection controls
- Preset and custom paint colours
- Paint opacity control
- Solid, vertical stripe, horizontal stripe, and grid designs
- Before and after preview
- Save designs using IndexedDB
- Saved design metadata: colour, design, opacity, and date
- Download current and saved designs
- Delete saved designs
- Loading, empty, and error states
- Responsive styling

## Project Structure

- `css/style.css` — global styles
- `css/components.css` — reusable component styles
- `css/responsive.css` — responsive styles
- `js/canvas.js` — wall selection and canvas painting
- `js/colors.js` — colour palette and custom colour
- `js/designs.js` — design selection
- `js/storage.js` — sessionStorage and IndexedDB
- `js/upload.js` — image upload and validation
- `js/app.js` — preview and saved-design page logic

## Storage

`sessionStorage` stores the current room and painted image.

`IndexedDB` stores saved designs because image data can be too large for `localStorage`.

## Scope

This version intentionally remains frontend-only. It does not use a backend, MongoDB, JWT authentication, or paid APIs.


## Phase 2 – Professional UX Upgrade

Phase 2 improves the existing frontend workflow without changing the project to a backend application.

### Added in Phase 2
- Live wall preview when changing colour, pattern, or opacity after wall selection.
- Safer control states for Undo, Clear, Finish, Apply, Reset, and Preview.
- Escape-key support to cancel an active wall selection.
- Improved before/after preview with Side by Side, Before-only, and After-only modes.
- Design details summary showing colour, pattern, opacity, and creation date.
- Edit Design and My Designs navigation from the preview screen.
- Improved saved-design cards with a visual colour swatch.
- Drag-and-drop room image upload.
- File name and file-size feedback during upload.
- Upload processing state and improved validation/error feedback.

## Phase 3 Improvements

Phase 3 focuses on a more professional editing workflow and better saved-design productivity. The wall selector now shows visible selection points and a live point count, supports keyboard shortcuts for undo, finish, and cancel, and gives clearer selection guidance. Saved Designs now includes search and sorting controls so users can quickly find saved colour or pattern combinations.
