# LiveFrame AI - Email Template Editor

A visual email template editor powered by GrapeJS and Azure OpenAI.

## Features

- Split view editor: code on left, live GrapeJS canvas on right
- Visual drag-and-drop editing with email-friendly components
- AI-powered email generation from text prompts
- Convert any HTML to email-ready format with AI
- Responsive preview (desktop/mobile)
- Template save/load via Supabase
- Image upload via Cloudinary

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required env vars:
- `VITE_OPENAI_ENDPOINT` — Azure OpenAI endpoint
- `VITE_OPENAI_API_KEY` — Azure OpenAI API key
- `VITE_OPENAI_DEPLOYMENT` — Model deployment name
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── editor/          # GrapeJS editor, toolbar, layers panel
│   ├── ui/              # Toaster
│   ├── AiGenerateModal  # AI email generation modal
│   ├── EditorLayout     # Main split-view layout
│   ├── FloatingMenu     # Context menu for selected elements
│   ├── Header           # App header
│   ├── LiveCanvas       # GrapeJS canvas wrapper
│   └── TemplateManager  # Save/load templates
├── services/
│   ├── aiService        # Azure OpenAI integration
│   ├── imageUploadService
│   ├── supabaseClient
│   └── templateService
├── styles/
│   └── grapesjs-custom.css
├── types.ts
├── constants.ts
├── App.tsx
└── index.tsx
```

## Tech Stack

- React 19 + TypeScript
- GrapeJS + Newsletter Preset
- Azure OpenAI (GPT)
- Vite
- Tailwind CSS
- Supabase
- Cloudinary
