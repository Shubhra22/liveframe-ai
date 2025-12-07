# GrapeJS Integration Guide

## What Changed

✅ Replaced custom iframe editor with GrapeJS visual editor
✅ Added drag-and-drop email components (newsletter preset)
✅ Minimal UI with collapsible panels (hidden by default)
✅ Lucide icons matching your editor style
✅ Custom React buttons instead of default GrapeJS UI

## UI Controls

### Toolbar Buttons (Top Left)
- **Blocks** - Show/hide component library (Grid3x3 icon)
- **Layers** - Show/hide document hierarchy (Layers3 icon)

### Device Toggle (Top Right)
- **Monitor icon** - Desktop view (default)
- **Smartphone icon** - Mobile view (375px width)

### Borders Toggle (Top Right)
- **Eye icon** - Show/hide component outlines in editor

## How to Use

1. **Paste HTML** in the left code editor
2. **Click "Run"** to load into GrapeJS canvas
3. **Click elements** to select and edit
4. **Drag from Blocks** to add new components
5. **Use Layers panel** to see hierarchy and modify styles
6. **Toggle devices** to preview responsive layout

## Features

### Visual Editing
- Click any element to select it
- Toolbar appears with options (move, clone, delete)
- Double-click text to edit inline
- Drag to reorder elements

### Blocks Panel (Left Sidebar)
- Pre-built email components
- Drag and drop into canvas
- Newsletter-optimized blocks
- Sections, columns, buttons, images, text

### Layers Panel (Right Sidebar)
- **Layers tab**: Document hierarchy tree
- **Styles tab**: CSS property editor
- **Settings tab**: Element attributes (href, alt, etc.)

## Styling

All GrapeJS UI is styled to match your dark theme:
- Neutral 900 backgrounds
- Neutral 800 borders
- Blue selection outlines
- Smooth transitions

## Technical Details

### Inline Styles Preserved
- `avoidInlineStyle: false` keeps email-compatible inline CSS
- Parser configured to preserve all attributes
- Full HTML document structure maintained

### Email-Ready Components
- Newsletter preset provides table-based layouts
- MSO conditional comments supported
- Responsive email patterns included

### Custom Buttons
- React components instead of GrapeJS panels
- Lucide icons for consistency
- Tailwind styling matching your theme

## Troubleshooting

### Buttons not working?
- Make sure dev server is running: `npm run dev`
- Check browser console for errors
- Verify GrapeJS initialized (check for editor instance)

### Styles broken?
- GrapeJS preserves inline styles by default
- Check if HTML has proper structure
- Use "Make Email Ready" button to optimize

### Panels not showing?
- Click "Blocks" or "Layers" buttons to toggle
- Panels are collapsed by default for minimal UI
- Click X to close panels

## Next Steps

Want to customize further?
- Add custom blocks in GrapeJS config
- Modify panel layouts in LiveCanvas.tsx
- Adjust styling in grapesjs-custom.css
- Add more toolbar buttons (undo, redo, etc.)
