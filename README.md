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


## Phase 4 – Final Product Polish

Phase 4 is the final frontend-focused product upgrade. It keeps the existing workflow intact and adds the finishing touches needed for a realistic room-painting experience.

### Added in Phase 4
- Natural wall-colour rendering using the canvas colour blend mode so existing room brightness, shadows, and texture remain visible.
- Persistent wall-selection points while editing, so accidental navigation back to the editor does not immediately lose the current selection.
- Optimized uploaded room images (maximum working dimension 1800px) to reduce browser-storage pressure while retaining good visual quality.
- Interactive before/after comparison slider on the preview page.
- Improved editor hierarchy, guidance, live-preview messaging, canvas framing, focus states, and responsive layouts.
- More reliable saved-design sorting using creation timestamps when available.
- Improved small-screen controls and touch-friendly canvas behavior.
- Preserves all Phase 1–3 functionality without creating a second implementation of the same feature.

### Product Scope
This is a frontend-only implementation. It is suitable as a polished portfolio/project demonstration and as a strong UI prototype. A commercial production deployment would additionally need a secure backend, user accounts, cloud image storage, server-side validation, database persistence, authentication, monitoring, and deployment infrastructure.
