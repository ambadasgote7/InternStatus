import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    if (!file?.buffer) return reject(new Error("Invalid file"));

    const isPdf = file.mimetype === "application/pdf";
    
    // Clean filename - remove existing .pdf extension to avoid duplication
    let originalName = file.originalname;
    if (originalName.toLowerCase().endsWith('.pdf')) {
      originalName = originalName.slice(0, -4); // Remove .pdf
    }
    
    const publicId = `${Date.now()}-${originalName}`;

    const uploadOptions = {
      folder,
      public_id: publicId,
      resource_type: isPdf ? "raw" : "image", // Use 'raw' for PDFs
      type: "upload",
      access_mode: "public",
      // Add these for better PDF handling
      ...(isPdf && {
        format: 'pdf',
        flags: 'attachment'
      })
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          reject(err);
        } else {
                    
          // Ensure PDF URLs end with .pdf
          if (isPdf && !result.secure_url.includes('.pdf')) {
            result.secure_url = `${result.secure_url}.pdf`;
          }
          
          resolve(result);
        }
      }
    );

    stream.end(file.buffer);
  });
