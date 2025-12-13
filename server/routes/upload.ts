/**
 * File Upload Routes
 *
 * Handle file uploads to Firebase Storage via backend
 */

import { Router } from 'express';
import multer from 'multer';
import { admin } from '../db';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, PNG, JPG, JPEG
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG files are allowed.'));
    }
  },
});

/**
 * POST /api/upload/pre-approval-docs
 * Upload pre-approval documents to Firebase Storage
 */
router.post('/pre-approval-docs', upload.array('documents', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const userId = req.body.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    console.log(`📤 Uploading ${files.length} files for user ${userId}`);

    // Get storage bucket
    const bucket = admin.storage().bucket();

    // Upload each file
    const uploadPromises = files.map(async (file) => {
      const timestamp = Date.now();
      const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `pre-approval-docs/${userId}/${timestamp}_${sanitizedFileName}`;

      // Create a file in the bucket
      const fileRef = bucket.file(storagePath);

      // Upload the file buffer
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make the file publicly accessible (or use signed URLs for security)
      await fileRef.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      return {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedAt: new Date().toISOString(),
        downloadURL: publicUrl,
        storagePath,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    console.log(`✅ Successfully uploaded ${uploadedFiles.length} files`);

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files',
    });
  }
});

export default router;
