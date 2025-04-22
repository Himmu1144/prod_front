import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
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

  // const handleImageChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   if (previewImages.length + files.length > maxImages) {
  //     alert(`You can upload a maximum of ${maxImages} images.`);
  //     return;
  //   }
    
  //   // Create a copy of the current images including previously uploaded ones
  //   const newImagesArray = [...previewImages];
  //   let filesProcessed = 0;
    
  //   console.log(`Processing ${files.length} new files. Current image count: ${previewImages.length}`);
    
  //   // Process each file
  //   files.forEach((file) => {
  //     console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
      
  //     const reader = new FileReader();
      
  //     reader.onloadend = () => {
  //       console.log(`File loaded: ${file.name}`);
        
  //       // Add this image to our array copy
  //       newImagesArray.push({ url: reader.result, file });
        
  //       // Increment count of processed files
  //       filesProcessed++;
        
  //       // Only update state when all files have been processed
  //       if (filesProcessed === files.length) {
  //         setPreviewImages(newImagesArray);
  //         setImages(newImagesArray);
  //         console.log(`All files processed. New total image count: ${newImagesArray.length}`);
  //       }
  //     };
      
  //     reader.onerror = (error) => {
  //       console.error(`Error reading file ${file.name}:`, error);
  //       filesProcessed++;
  //     };
      
  //     reader.readAsDataURL(file);
  //   });
  // };

//   // Update the handleImageChange function
// const handleImageChange = (e) => {
//   const files = Array.from(e.target.files);
  
//   // Check total images limit
//   if (previewImages.length + files.length > maxImages) {
//     alert(`You can upload a maximum of ${maxImages} images.`);
//     return;
//   }
  
//   // Create a copy of the current images including previously uploaded ones
//   const newImagesArray = [...previewImages];
//   let filesProcessed = 0;
  
//   console.log(`Processing ${files.length} new files. Current image count: ${previewImages.length}`);
  
//   // Process each file
//   files.forEach((file) => {
//     console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
//     const reader = new FileReader();
    
//     reader.onloadend = () => {
//       console.log(`File loaded: ${file.name}`);
      
//       // Add this image to our array copy
//       newImagesArray.push({ url: reader.result, file });
      
//       // Increment count of processed files
//       filesProcessed++;
      
//       // Only update state when all files have been processed
//       if (filesProcessed === files.length) {
//         // Update local state
//         setPreviewImages(newImagesArray);
        
//         // Pass to parent - make sure parent gets the complete updated array
//         setImages(newImagesArray);
        
//         console.log(`All files processed. New total image count: ${newImagesArray.length}`);
//       }
//     };
    
//     reader.onerror = (error) => {
//       console.error(`Error reading file ${file.name}:`, error);
//       filesProcessed++;
//     };
    
//     reader.readAsDataURL(file);
//   });
// };

const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  
  // Check total images limit
  if (previewImages.length + files.length > maxImages) {
    alert(`You can upload a maximum of ${maxImages} images.`);
    return;
  }
  
  // Create a copy of the current images
  const newImagesArray = [...previewImages];
  let filesProcessed = 0;
  
  console.log(`Processing ${files.length} new files. Current image count: ${previewImages.length}`);
  
  // Process each file
  files.forEach((file) => {
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      console.log(`File loaded: ${file.name}`);
      
      // Add this image to our array copy WITH the file reference
      newImagesArray.push({
        url: reader.result,
        file: file // Store the actual File object
      });
      
      // Increment count of processed files
      filesProcessed++;
      
      // Only update state when all files have been processed
      if (filesProcessed === files.length) {
        // Update local state first
        setPreviewImages(newImagesArray);
        
        // Then update parent state - WITHOUT using setTimeout which can cause issues
        setImages(newImagesArray);
        console.log(`All files processed. New total image count: ${newImagesArray.length}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error(`Error reading file ${file.name}:`, error);
      filesProcessed++;
    };
    
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
      
  
{/* 
{previewImages.length < maxImages && (
  <div className="mt-2">
    <label className="cursor-pointer block p-2 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-red-500 transition-colors">
      <span className="text-gray-600">
        Click to upload images 
      </span>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </label>
  </div>
)} */}

{/* // Add this before the image upload label */}
{previewImages.length > 0 && (
  <div className="flex justify-between items-center mb-2 text-sm">
    <span className="text-gray-600">
      Selected images: {previewImages.length}/{maxImages}
    </span>
    {/* {previewImages.length < maxImages && (
      <span className="text-blue-600 cursor-pointer hover:underline" 
            onClick={() => document.getElementById('image-uploader-input').click()}>
        Add more
      </span>
    )} */}
  </div>
)}
{previewImages.length < maxImages && (
  <div className="mt-2">
    <label className="cursor-pointer block p-2 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-red-500 transition-colors">
      <div className="flex flex-col items-center">
        <FaUpload className="text-gray-500 mb-1" />
        <span className="text-gray-600 font-medium">
          Click to upload images
        </span>
        <span className="text-gray-500 text-xs mt-1">
          (Hold Ctrl/Cmd to select multiple files)
        </span>
      </div>
      <input
        type="file"
        id="image-uploader-input"
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