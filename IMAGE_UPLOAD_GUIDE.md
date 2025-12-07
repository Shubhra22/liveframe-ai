# Image Upload Guide for Email Templates

## Why Not Base64?

❌ **Don't use base64 images in emails:**
- Increases email size by 33%
- Blocked by Outlook desktop
- Triggers spam filters
- Gmail clips emails over 102KB
- Poor deliverability

✅ **Use hosted images instead:**
- Smaller email size
- Better deliverability
- Works in all email clients
- Faster loading
- Browser caching

## Recommended Image Hosting Services

### 1. Cloudinary (Recommended)
**Pros:**
- Free tier: 25GB storage, 25GB bandwidth/month
- Automatic image optimization
- CDN delivery
- Image transformations (resize, crop, etc.)
- Easy setup

**Setup:**
1. Sign up at https://cloudinary.com
2. Get your Cloud Name and Upload Preset
3. Update `services/imageUploadService.ts`:
```typescript
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';
```

### 2. ImgBB
**Pros:**
- Free forever
- No account needed for basic use
- Simple API
- Fast CDN

**Setup:**
1. Get API key from https://api.imgbb.com/
2. Update `services/imageUploadService.ts`:
```typescript
const IMGBB_API_KEY = 'your_api_key';
```

### 3. AWS S3 + CloudFront
**Pros:**
- Highly scalable
- Full control
- Very cheap

**Cons:**
- More complex setup
- Requires AWS account

### 4. Vercel Blob Storage
**Pros:**
- Easy if using Vercel
- Generous free tier
- Simple API

**Setup:**
```bash
npm install @vercel/blob
```

### 5. Supabase Storage
**Pros:**
- Free tier: 1GB storage
- Built-in CDN
- Easy authentication

## Implementation Options

### Option A: Quick Setup with Cloudinary (5 minutes)

1. **Sign up for Cloudinary:**
   - Go to https://cloudinary.com
   - Create free account
   - Note your Cloud Name from dashboard

2. **Create Upload Preset:**
   - Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Save and note the preset name

3. **Update the code:**
```typescript
// In services/imageUploadService.ts
export async function uploadImage(file: File): Promise<string> {
  return await uploadToCloudinary(file);
}
```

4. **Add environment variables:**
```env
# .env.local
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Option B: Use ImgBB (3 minutes)

1. **Get API Key:**
   - Go to https://api.imgbb.com/
   - Sign up and get your API key

2. **Update the code:**
```typescript
// In services/imageUploadService.ts
export async function uploadImage(file: File): Promise<string> {
  return await uploadToImgBB(file);
}
```

3. **Add environment variable:**
```env
# .env.local
VITE_IMGBB_API_KEY=your_api_key
```

### Option C: Build Your Own Backend

Create an API endpoint that:
1. Receives the image file
2. Uploads to your storage (S3, etc.)
3. Returns the public URL

```typescript
// Example backend endpoint (Node.js/Express)
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  // Upload to S3, etc.
  const url = await uploadToS3(file);
  res.json({ url });
});
```

## Integration with GrapeJS

### Automatic Upload on Image Add

Update `GrapeJSEditor.tsx` to handle uploads:

```typescript
// After editor initialization
editor.on('asset:upload:start', () => {
  console.log('Upload started');
});

editor.on('asset:upload:end', () => {
  console.log('Upload completed');
});

editor.on('asset:upload:error', (err) => {
  console.error('Upload error:', err);
  toast.error('Failed to upload image');
});
```

### Convert Existing Base64 Images

Add a button to convert all base64 images to hosted URLs:

```typescript
import { replaceBase64ImagesWithUrls } from '../services/imageUploadService';

const handleConvertImages = async () => {
  const currentHtml = editor.getHtml();
  const updatedHtml = await replaceBase64ImagesWithUrls(currentHtml);
  editor.setComponents(updatedHtml);
  toast.success('All images uploaded!');
};
```

## Best Practices for Email Images

### 1. Image Size
- Keep images under 1MB each
- Total email size under 100KB (excluding images)
- Use compression tools

### 2. Image Dimensions
- Max width: 600px (standard email width)
- Use responsive images with max-width: 100%

### 3. Image Format
- Use JPG for photos
- Use PNG for logos/graphics with transparency
- Avoid GIFs (limited support)
- Don't use WebP (poor email client support)

### 4. Alt Text
- Always include alt text for accessibility
- Helps when images are blocked

### 5. Fallback
- Use background colors behind images
- Provide text alternatives

## Example: Complete Cloudinary Setup

```typescript
// services/imageUploadService.ts
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file: File): Promise<string> {
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5MB)');
  }

  // Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  
  // Return optimized URL
  return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}
```

## Testing

1. **Test in Email Clients:**
   - Send test emails to Gmail, Outlook, Apple Mail
   - Check image loading
   - Verify alt text displays when images blocked

2. **Test Image URLs:**
   - Ensure URLs are publicly accessible
   - Check HTTPS (required for email)
   - Verify CDN is working

3. **Test Email Size:**
   - Keep total HTML under 102KB
   - Use tools like https://www.mail-tester.com/

## Troubleshooting

### Images not loading in emails?
- Check if URLs are public (not localhost)
- Ensure HTTPS
- Verify CORS settings
- Check image file size

### Upload failing?
- Check API keys/credentials
- Verify file size limits
- Check network connection
- Look at browser console for errors

### Spam filter issues?
- Use reputable image hosting
- Don't use too many images
- Include alt text
- Balance image/text ratio

## Next Steps

1. Choose an image hosting service
2. Set up account and get credentials
3. Update `imageUploadService.ts`
4. Add environment variables
5. Test image uploads
6. Integrate with GrapeJS asset manager
7. Add "Convert Base64" button for existing images
