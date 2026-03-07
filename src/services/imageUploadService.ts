/**
 * Image Upload Service
 * 
 * Replace the uploadToCloudinary function with your preferred image hosting service
 * Options: Cloudinary, ImgBB, AWS S3, Vercel Blob, Supabase Storage, etc.
 */

// Upload to Cloudinary
export async function uploadToCloudinary(file: File): Promise<string> {
  const CLOUDINARY_UPLOAD_PRESET = 'polymuse_unsigned'; // Set in Cloudinary dashboard
  const CLOUDINARY_CLOUD_NAME = 'dhugmgqsh'; // Your Cloudinary cloud name

  console.log('🔄 Uploading to Cloudinary...', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    fileType: file.type,
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Cloudinary error:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('✅ Cloudinary upload successful:', data.secure_url);
    
    // Return optimized URL (auto format and quality)
    return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
}

// Example: Upload to ImgBB (free, no account needed for basic use)
export async function uploadToImgBB(file: File): Promise<string> {
  const IMGBB_API_KEY = 'your_imgbb_api_key'; // Get from https://api.imgbb.com/

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data.url; // Returns the hosted image URL
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Example: Upload to your own backend
export async function uploadToBackend(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url; // Your backend returns the hosted URL
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Main upload function - choose your preferred service
export async function uploadImage(file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Check file size (max 5MB recommended for emails)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image too large. Please use an image under 5MB');
  }

  // Using Cloudinary for image hosting
  console.log('📤 Uploading image to Cloudinary:', file.name);
  return await uploadToCloudinary(file);
}

// Temporary upload function using a free service (for demo only)
async function uploadToTemporaryHost(file: File): Promise<string> {
  // Using a free temporary image hosting service
  // NOTE: These images may expire! Use Cloudinary/ImgBB for production
  
  const formData = new FormData();
  formData.append('image', file);

  try {
    // Using freeimage.host as a temporary solution
    const response = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    if (data.image?.url) {
      return data.image.url;
    }
    
    throw new Error('Invalid response from upload service');
  } catch (error) {
    console.error('Image upload error:', error);
    // If upload fails, fall back to base64 (not ideal but better than breaking)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Utility: Convert base64 to File object
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Utility: Find and replace base64 images in HTML with uploaded URLs
export async function replaceBase64ImagesWithUrls(html: string): Promise<string> {
  const imgRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"/g;
  const matches = html.match(imgRegex);

  if (!matches) return html;

  let updatedHtml = html;

  for (const match of matches) {
    const base64Match = match.match(/src="(data:image\/[^;]+;base64,[^"]*)"/);
    if (!base64Match) continue;

    const base64 = base64Match[1];
    
    try {
      // Convert base64 to file
      const file = base64ToFile(base64, `image-${Date.now()}.png`);
      
      // Upload and get URL
      const url = await uploadImage(file);
      
      // Replace in HTML
      updatedHtml = updatedHtml.replace(base64, url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Keep base64 if upload fails
    }
  }

  return updatedHtml;
}
