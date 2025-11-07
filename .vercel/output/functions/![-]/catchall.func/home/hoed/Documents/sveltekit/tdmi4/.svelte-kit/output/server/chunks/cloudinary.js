import { v2 } from "cloudinary";
import stream from "stream";
async function uploadFile(fileBuffer, muridId) {
  return new Promise((resolve, reject) => {
    const public_id = `murid_photos/${muridId}`;
    const uploadStream = v2.uploader.upload_stream(
      {
        public_id,
        overwrite: true,
        // Overwrite the file if it already exists for this ID
        invalidate: true
        // Invalidate the CDN cache to show the new image immediately
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload result is undefined."));
        }
        resolve(result.public_id);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
}
async function deleteFile(publicId) {
  try {
    await v2.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete file ${publicId} from Cloudinary:`, error);
  }
}
function getPublicFileUrl(publicId) {
  return v2.url(publicId, { secure: true });
}
export {
  deleteFile as d,
  getPublicFileUrl as g,
  uploadFile as u
};
