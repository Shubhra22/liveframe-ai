# Font-Family Fix

## The Problem

When you load HTML with inline `font-family` styles into GrapeJS and then export it, the font-family declarations were being stripped out, causing text to render in default browser fonts.

## Why This Happens

GrapeJS has a complex relationship with inline styles:
1. It parses your HTML and converts inline styles into its internal component model
2. When exporting, it can either keep styles inline OR convert them to CSS classes
3. The `grapesjs-preset-newsletter` plugin is supposed to keep inline styles, but it doesn't always preserve font-family

## The Solution

### 1. Ensure avoidInlineStyle is false
```typescript
avoidInlineStyle: false,
```
This tells GrapeJS to keep all styles inline (required for email).

### 2. Configure Style Manager with font-family defaults
```typescript
{
  property: 'font-family',
  type: 'select',
  default: 'Helvetica, Arial, sans-serif',
  options: [
    { id: 'helvetica', value: 'Helvetica, Arial, sans-serif', name: 'Helvetica' },
    // ... more options
  ],
}
```

### 3. Add font-family to new components
```typescript
editor.on('component:add', (component) => {
  const textTypes = ['text', 'textnode', 'link'];
  if (textTypes.includes(type) || component.get('tagName')?.match(/^(p|h[1-6]|span|a|div)$/i)) {
    const styles = component.getStyle();
    if (!styles['font-family']) {
      component.addStyle({ 'font-family': 'Helvetica, Arial, sans-serif' });
    }
  }
});
```

### 4. Preserve font-family during HTML loading
When loading HTML, GrapeJS should automatically preserve inline styles because `avoidInlineStyle: false`.

## Testing

1. Load your test.html into the editor
2. Make a small change (add a space, change text)
3. Check the exported HTML - font-family should be present in inline styles
4. If not, check the browser console for any GrapeJS warnings

## Email-Safe Fonts

These fonts work reliably across all email clients:
- **Helvetica, Arial, sans-serif** (recommended)
- **Georgia, serif**
- **Times New Roman, serif**
- **Courier New, monospace**

Avoid:
- Custom web fonts (Google Fonts, etc.) - not supported in most email clients
- System fonts like -apple-system, Segoe UI - inconsistent rendering

## Fallback Strategy

The body tag always includes:
```html
<body style="font-family: Helvetica, Arial, sans-serif;">
```

This ensures that even if individual elements don't have font-family, they'll inherit from the body.

## MSO Conditional Comments

For Outlook compatibility, we include:
```html
<!--[if mso]>
<style type="text/css">
    body, table, td {font-family: Helvetica, Arial, sans-serif !important;}
</style>
<![endif]-->
```

This forces Outlook to use the correct font.
