import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';

let configured = false;

export function initCloudinary() {
  if (!config.isCloudinaryConfigured) {
    console.warn(
      'Cloudinary not configured — file uploads disabled. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
    return false;
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  configured = true;
  console.log('Cloudinary configured');
  return true;
}

export function getCloudinary() {
  if (!configured && config.isCloudinaryConfigured) {
    initCloudinary();
  }
  return cloudinary;
}

export function isCloudinaryReady() {
  return configured || config.isCloudinaryConfigured;
}
