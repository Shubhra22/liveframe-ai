# Component Structure

## Overview

The editor has been refactored into smaller, manageable components for better maintainability and organization.

## Component Hierarchy

```
App.tsx
└── EditorLayout.tsx
    ├── [Code Editor Section]
    │   ├── BlocksPanel (collapsible)
    │   └── <textarea> (HTML code)
    └── LiveCanvas.tsx
        ├── EditorToolbar
        ├── GrapeJSEditor
        └── LayersPanel (collapsible)
```

## Components

### 1. `EditorLayout.tsx`
**Location:** `components/EditorLayout.tsx`

**Purpose:** Main layout container managing split view, code editor, and live preview

**Features:**
- Split/Code/Preview view toggle
- Code editor with syntax highlighting
- Blocks panel (left side, collapsible)
- Auto-sync with debounce
- "Make Email Ready" AI conversion
- Run button to apply changes

**State:**
- `activeTab`: Current view mode
- `localCode`: Code editor content
- `showBlocks`: Blocks panel visibility

---

### 2. `LiveCanvas.tsx`
**Location:** `components/LiveCanvas.tsx`

**Purpose:** Container for the visual editor with toolbar and panels

**Features:**
- Manages editor state (device mode, borders, layers)
- Coordinates between toolbar and editor
- Handles panel visibility

**State:**
- `showLayers`: Layers panel visibility
- `showBorders`: Component borders toggle
- `deviceMode`: Desktop/mobile view

---

### 3. `GrapeJSEditor.tsx`
**Location:** `components/editor/GrapeJSEditor.tsx`

**Purpose:** Core GrapeJS editor initialization and management

**Features:**
- GrapeJS initialization with newsletter preset
- HTML parsing and loading
- Debounced updates to prevent loops
- Inline style preservation for emails
- Device management
- Exposes methods via ref (setDevice, toggleBorders, getEditor)

**Props:**
- `html`: HTML content to load
- `onHtmlChange`: Callback when content changes

**Ref Methods:**
- `setDevice(device)`: Switch between desktop/mobile
- `toggleBorders()`: Show/hide component outlines
- `getEditor()`: Get GrapeJS instance

---

### 4. `EditorToolbar.tsx`
**Location:** `components/editor/EditorToolbar.tsx`

**Purpose:** Top toolbar with editor controls

**Features:**
- Layers panel toggle button
- Device switcher (desktop/mobile)
- Borders visibility toggle
- Lucide icons for consistency

**Props:**
- `deviceMode`: Current device mode
- `showBorders`: Borders visibility state
- `showLayers`: Layers panel visibility
- `onDeviceToggle`: Device change handler
- `onBordersToggle`: Borders toggle handler
- `onLayersToggle`: Layers panel toggle handler

---

### 5. `BlocksPanel.tsx`
**Location:** `components/editor/BlocksPanel.tsx`

**Purpose:** Drag-and-drop component library (now in code editor section)

**Features:**
- Email-friendly blocks from newsletter preset
- Collapsible with close button
- Sections, columns, buttons, images, text blocks

**Props:**
- `onClose`: Close panel handler

**Note:** This panel is now part of the code editor section (left side) instead of the live canvas

---

### 6. `LayersPanel.tsx`
**Location:** `components/editor/LayersPanel.tsx`

**Purpose:** Document hierarchy and style editor

**Features:**
- Layers tree view
- Style manager (CSS properties)
- Trait manager (element attributes)
- Collapsible with close button

**Props:**
- `onClose`: Close panel handler

---

## File Structure

```
components/
├── LiveCanvas.tsx          # Main canvas container
├── EditorLayout.tsx        # Split view layout
├── Header.tsx              # App header
├── FloatingMenu.tsx        # (Legacy, not used with GrapeJS)
├── grapesjs-custom.css     # GrapeJS theme styling
├── editor/
│   ├── GrapeJSEditor.tsx   # Core editor logic
│   ├── EditorToolbar.tsx   # Toolbar controls
│   ├── BlocksPanel.tsx     # Component library
│   └── LayersPanel.tsx     # Hierarchy & styles
└── ui/
    └── Toaster.tsx         # Toast notifications
```

## Data Flow

### Loading HTML
```
Code Editor (textarea)
  → localCode state
  → debounce (1s)
  → codeToRender state
  → LiveCanvas (html prop)
  → GrapeJSEditor
  → Parse & load into GrapeJS
```

### Editing in GrapeJS
```
User edits component
  → GrapeJS component:update event
  → debounce (500ms)
  → onHtmlChange callback
  → EditorLayout updates localCode
  → Code editor updates
```

### Preventing Loops
- `isUpdatingRef` flag prevents circular updates
- Debounced updates (500ms for GrapeJS, 1s for code editor)
- Content comparison before updating

## Styling

### Theme
- Dark theme with neutral colors
- Matches existing editor style
- Lucide icons throughout

### Custom CSS
- `grapesjs-custom.css` styles all GrapeJS UI
- Blocks, layers, styles panels
- Component toolbar
- Selection outlines

## Key Features

### Blocks Panel Location
✅ **Now in code editor section** (left side)
- Accessible while editing code
- Doesn't interfere with visual editor
- Collapsible to save space

### Minimal UI
- Panels collapsed by default
- Clean canvas-focused view
- Toggle buttons to show/hide

### Email-Ready
- Inline styles preserved
- Newsletter preset components
- Table-based layouts
- MSO conditional comments

## Usage

### Show/Hide Panels
```tsx
// In code editor
<button onClick={() => setShowBlocks(true)}>Show Blocks</button>

// In live canvas
<button onClick={() => setShowLayers(true)}>Show Layers</button>
```

### Access GrapeJS Instance
```tsx
const editorRef = useRef<GrapeJSEditorRef>(null);

// Later
editorRef.current?.setDevice('mobile');
editorRef.current?.toggleBorders();
const editor = editorRef.current?.getEditor();
```

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to find and fix issues
4. **Testability**: Smaller components are easier to test
5. **Readability**: Less code per file, clearer structure
6. **Flexibility**: Easy to add/remove features

## Next Steps

Want to customize further?
- Add more toolbar buttons (undo, redo, clear)
- Create custom blocks in GrapeJSEditor
- Add keyboard shortcuts
- Implement templates library
- Add export options (HTML, PDF, etc.)
