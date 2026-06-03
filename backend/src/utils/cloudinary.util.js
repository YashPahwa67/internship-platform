import { Readable } from 'stream';
import { getCloudinary } from '../config/cloudinary.js';
import { config } from '../config/index.js';
import { ApiError } from './ApiError.js';

/**
 * Upload buffer to Cloudinary via upload_stream (memory-efficient).
 */
export function uploadBuffer(buffer, options = {}) {
  const cld = getCloudinary();
  if (!cld) {
    throw new ApiError(503, 'STORAGE_UNAVAILABLE', 'Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: config.cloudinary.folder,
        resource_type: options.resourceType || 'auto',
        ...options.cloudinaryOptions,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Delete asset by public_id. resourceType: image | raw | video
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  if (!publicId) return;
  const cld = getCloudinary();
  if (!cld) return;

  try {
    await cld.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete failed:', publicId, err.message);
  }
}

/** Infer Cloudinary resource_type from mime */
export function resourceTypeForMime(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  return 'raw';
}

/** Build MongoDB cloudinaryAsset subdocument from upload result */
export function toAssetMetadata(result, originalFilename, mimeType) {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    filename: originalFilename || result.original_filename || 'file',
    mimeType: mimeType || undefined,
    size: result.bytes,
    uploadedAt: new Date(),
  };
}

export async function replaceAsset(oldAsset, buffer, uploadOptions) {
  const result = await uploadBuffer(buffer, uploadOptions);
  const resourceType = uploadOptions.resourceType || 'auto';

  if (oldAsset?.publicId) {
    const rt = oldAsset.mimeType?.startsWith('image/') ? 'image' : 'raw';
    await deleteAsset(oldAsset.publicId, rt === 'auto' ? resourceType : rt);
  }

  return toAssetMetadata(result, uploadOptions.originalFilename, uploadOptions.mimeType);
}
