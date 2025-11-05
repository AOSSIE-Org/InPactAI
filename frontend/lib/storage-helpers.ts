import { supabase } from "./supabaseClient";

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param userId - The user's ID
 * @param filename - The filename (without extension)
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string,
  userId: string,
  filename: string
): Promise<string> {
  const parts = file.name.split(".");
  const fileExt = parts.length > 1 ? parts.pop() : "jpg";
  if (!fileExt) {
    throw new Error("File must have a valid extension");
  }
  const filePath = `${userId}/${filename}.${fileExt}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Replace if exists
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The full file path
 */
export async function deleteImage(
  bucket: string,
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The full file path
 * @returns The public URL
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Check if a file exists in Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The full file path
 * @returns True if the file exists, false otherwise
 */
export async function fileExists(
  bucket: string,
  filePath: string
): Promise<boolean> {
  // Extract folder and filename
  const lastSlash = filePath.lastIndexOf("/");
  const folder = lastSlash > 0 ? filePath.substring(0, lastSlash) : "";
  const fileName = filePath.substring(lastSlash + 1);

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    search: fileName,
  });
  if (error) {
    return false;
  }
  return data ? data.some((file) => file.name === fileName) : false;
}

/**
 * Upload profile picture for a user
 * @param file - The image file
 * @param userId - The user's ID
 * @returns The public URL of the uploaded profile picture
 */
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<string> {
  return uploadImage(file, "profile-pictures", userId, "profile");
}

/**
 * Upload brand logo
 * @param file - The image file
 * @param userId - The user's ID
 * @returns The public URL of the uploaded logo
 */
export async function uploadBrandLogo(
  file: File,
  userId: string
): Promise<string> {
  return uploadImage(file, "brand-logos", userId, "logo");
}
