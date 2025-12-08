# Email Export Guide

## Issues Fixed

### 1. Bulky HTML from Base64 Images
**Problem**: When images were added, they were sometimes stored as base64 data URLs directly in the HTML, making files massive (100KB+ per image).

**Solution**: 
- All images are now automatically uploaded to Cloudinary when added
- Base64 images are intercepted and converted to hosted URLs
- A final cleanup pass ensures no base64 images remain in the export

### 2. Broken Fonts in Email Platforms
**Problem**: The editor was showing Space Grotesk (a custom font) but exporting without any font-family declarations, causing inconsistent rendering.

**Solution**:
- Changed canvas to use email-safe fonts: `Helvetica, Arial, sans-serif`
- What you see in the editor now matches what recipients see
- Included MSO conditional comments for Outlook compatibility
- Added inline font-family styles on the body tag
- All text elements preserve their font-family in the export

### 3. Random CSS Classes and Box-Sizing
**Problem**: GrapeJS was generating random class names (c2131, c2140, etc.) and adding `box-sizing: border-box` to every element, making the HTML messy and incompatible with email clients.

**Solution**:
- Configured CSS Composer to not generate CSS rules
- Set Selector Manager to prioritize components over classes
- Added cleanup regex to remove all generated classes
- Removed box-sizing declarations from exported HTML
- Ensured all styles remain inline (required for email)

## Best Practices for Email HTML

### Font Strategy
Email clients have limited font support. The builder now uses:
- **Primary**: Helvetica (widely supported)
- **Fallback**: Arial, sans-serif
- **Outlook**: Special MSO conditional styling

### Image Guidelines
1. **Size**: Keep images under 5MB (enforced by upload service)
2. **Format**: Use JPG for photos, PNG for graphics with transparency
3. **Hosting**: All images are automatically uploaded to Cloudinary
4. **Alt Text**: Always add alt text for accessibility

### HTML Structure
The exported HTML includes:
- Proper DOCTYPE and meta tags
- MSO conditional comments for Outlook
- Inline styles (required for email)
- Table-based layout (most compatible)

## Testing Your Emails

### Recommended Testing Tools
1. **Litmus** - Test across 90+ email clients
2. **Email on Acid** - Comprehensive testing suite
3. **Mail Tester** - Free spam score checker
4. **Gmail/Outlook** - Manual testing in real clients

### Common Issues to Check
- [ ] Images load correctly (not base64)
- [ ] Fonts render consistently
- [ ] Layout works on mobile
- [ ] Links are clickable
- [ ] No broken styles

## Troubleshooting

### Images Not Loading
- Check that Cloudinary upload succeeded (see console logs)
- Verify image URLs are accessible
- Ensure images are under 5MB

### Fonts Look Different
- This is normal! Email clients don't support custom web fonts
- The builder uses safe system fonts for maximum compatibility
- Focus on layout and hierarchy rather than exact font matching

### HTML Too Large
- Check for any remaining base64 images
- Optimize images before uploading
- Remove unnecessary inline styles

## Export Workflow

1. **Build** your email in the visual editor
2. **Add images** - they're automatically uploaded
3. **Preview** in different devices using the toolbar
4. **Copy HTML** from the code editor
5. **Test** in your email platform
6. **Send** with confidence!

## Technical Details

### Image Upload Flow
```
User adds image → Base64 detected → Upload to Cloudinary → Replace with URL → Update component
```

### HTML Generation
```
GrapeJS components → Get HTML/CSS → Clean base64 → Add email headers → Export full document
```

### Font Handling
```
Editor: Helvetica, Arial (email-safe)
Export: Helvetica, Arial (same as editor - WYSIWYG)
```

The editor now shows exactly what your email recipients will see!
