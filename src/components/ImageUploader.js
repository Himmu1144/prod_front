import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Normalize image URLs for display
const normalizeImageUrl = (url) => {
  if (!url) return "";
  
  // If it's a data URL (newly uploaded file), return as is
  if (url.startsWith('data:')) return url;
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url;
  
  // Add media/ prefix if not present to match GCS URL structure
  const pathWithMedia = url.startsWith('media/') ? url : `media/${url}`;
  
  // Return the full GCS URL
  return `https://storage.googleapis.com/onlybigcars-crm/${pathWithMedia}`;
};

const ImageUploader = ({ images, setImages, maxImages = 5 }) => {
  const [previewImages, setPreviewImages] = useState(
    images?.map(img => {
      // Handle both string URLs and objects with URL property
      const imageUrl = typeof img === 'object' ? img.url : img;
      return { url: normalizeImageUrl(imageUrl), file: null };
    }) || []
  );

  useEffect(() => {
    console.log("ImageUploader received images:", images);
    
    // Update previewImages when images prop changes
    setPreviewImages(
      images?.map(img => {
        // Handle both string URLs and objects with URL property
        const imageUrl = typeof img === 'object' ? img.url : img;
        return { url: normalizeImageUrl(imageUrl), file: null };
      }) || []
    );
  }, [images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (previewImages.length + files.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    // Process each file
    files.forEach(file => {
      console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        console.log(`File loaded: ${file.name}, data size: ${reader.result.length}`);
        
        // Create new array with the new image
        const newImages = [
          ...previewImages,
          { url: reader.result, file } // reader.result contains the data URL
        ];
        
        // Update state with the new images
        setPreviewImages(newImages);
        setImages(newImages);
      };
      
      reader.onerror = (error) => {
        console.error(`Error reading file ${file.name}:`, error);
        alert(`Failed to load image: ${file.name}`);
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);
    setImages(newImages);
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {previewImages.map((image, index) => (
          <div key={index} className="relative w-24 h-24 border rounded">
            <img
              src={image.url}
              alt={`Preview ${index}`}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                console.error(`Failed to load image: ${image.url.substring(0, 100)}...`);
                e.target.src = 'https://via.placeholder.com/100?text=Error';
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
            >
              <X size={16} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
      
      {previewImages.length < maxImages && (
        <div className="mt-2">
          <label className="cursor-pointer block p-2 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-red-500 transition-colors">
            <span className="text-gray-600">Click to upload images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;