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