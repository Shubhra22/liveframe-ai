<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LiveFrame AI - Email Template Editor

A minimal email template editor powered by GrapeJS and Gemini AI.

## Features

- **Split View Editor**: Code on left, live preview on right
- **Visual Editing**: Click and edit elements directly in the canvas with GrapeJS
- **Collapsible Panels**: 
  - Blocks panel (collapsed by default) - Drag-and-drop email components
  - Layers panel (collapsed by default) - View document hierarchy and styles
- **AI-Powered**: Convert any HTML to email-ready format with Gemini
- **Responsive Preview**: Toggle between desktop and mobile views

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

## Usage

1. **Paste HTML** in the left code editor
2. **Click "Run"** to render in the live canvas
3. **Edit visually** by clicking elements in the preview
4. **Use "Blocks"** button to show drag-and-drop components
5. **Use "Layers"** button to see document structure and modify styles
6. **Click "Make Email Ready"** to optimize for email clients with AI

## UI Controls

- **Blocks Button**: Show/hide component library (collapsed by default)
- **Layers Button**: Show/hide document hierarchy (collapsed by default)
- **Device Toggle**: Switch between desktop/mobile preview
- **Visibility Toggle**: Show/hide component borders in editor

## Tech Stack

- React + TypeScript
- GrapeJS (visual editor)
- GrapeJS Newsletter Preset (email-friendly components)
- Gemini AI (HTML to email conversion)
- Vite (build tool)
- Tailwind CSS (styling)

View your app in AI Studio: https://ai.studio/apps/drive/1aGwIK1WJ91hKOvTjpTeW-6AzO-MuIXo4
