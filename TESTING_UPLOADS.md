# Testing Image Uploads

## How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12 or Cmd+Option+I)

3. **Try adding an image in one of these ways:**

### Method 1: Drag & Drop Image Block
1. Click "Blocks" button in code editor
2. Find an image block
3. Drag it to the canvas
4. Click on the image placeholder
5. Upload an image

### Method 2: Add Image Component
1. In the canvas, click to add a component
2. Select "Image" from blocks
3. Click the image to upload

### Method 3: Paste HTML with Image
1. Paste HTML with `<img>` tag in code editor
2. Click "Run"
3. The image should be processed

## What You Should See in Console

When you upload an image, you should see these logs:

```
🎯 Asset added: image data:image/png;base64,iVBORw0KG...
🔄 Converting base64 to hosted image...
📤 Uploading image to Cloudinary: image-1234567890.png
🔄 Uploading to Cloudinary... {fileName: "image-1234567890.png", fileSize: "45.23 KB", fileType: "image/png"}
✅ Cloudinary upload successful: https://res.cloudinary.com/dhugmgqsh/image/upload/...
✅ Image uploaded: https://res.cloudinary.com/dhugmgqsh/image/upload/...
```

## Troubleshooting

### No console logs at all?
- Make sure dev server is running
- Refresh the page
- Check browser console is open
- Try adding an image block from the Blocks panel

### "Upload failed" error?
- Check your Cloudinary credentials in `services/imageUploadService.ts`
- Verify the upload preset is set to "Unsigned" in Cloudinary dashboard
- Check network tab for API errors

### Still using base64?
- The upload might have failed silently
- Check console for error messages
- Verify internet connection
- Try a smaller image (< 1MB)

### Cloudinary 401 Unauthorized?
- Your upload preset might not be set to "Unsigned"
- Go to Cloudinary Dashboard → Settings → Upload → Upload presets
- Edit your preset and set "Signing Mode" to "Unsigned"

### CORS errors?
- Cloudinary should allow CORS by default
- If you see CORS errors, check your Cloudinary security settings

## Verify Upload Success

After uploading, check the final HTML:
1. Look at the code editor
2. Find the `<img>` tag
3. The `src` should be a Cloudinary URL like:
   ```html
   <img src="https://res.cloudinary.com/dhugmgqsh/image/upload/f_auto,q_auto/v1234567890/abc123.png">
   ```

NOT base64 like:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...">
```

## Manual Test

If automatic upload isn't working, you can test the upload function directly:

1. Open browser console
2. Paste this code:
```javascript
// Create a test file
const testUpload = async () => {
  const response = await fetch('https://via.placeholder.com/150');
  const blob = await response.blob();
  const file = new File([blob], 'test.png', { type: 'image/png' });
  
  // Test upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'polymuse_unsigned');
  
  const uploadResponse = await fetch(
    'https://api.cloudinary.com/v1_1/dhugmgqsh/image/upload',
    { method: 'POST', body: formData }
  );
  
  const data = await uploadResponse.json();
  console.log('Upload result:', data);
};

testUpload();
```

If this works, your Cloudinary setup is correct!

## Expected Behavior

✅ **Working correctly:**
- Console shows upload logs
- Images appear in canvas
- Final HTML has Cloudinary URLs
- No base64 in exported HTML

❌ **Not working:**
- No console logs when adding images
- Images still show as base64
- Upload errors in console
- CORS or 401 errors
