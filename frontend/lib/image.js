import { translate, getSavedLanguage } from "./translations";

// Shrinks a photo in the browser and returns it as a small JPEG "data URL".
export function resizeImage(file, maxSize = 240, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const lang = getSavedLanguage();

    if (!file || !file.type.startsWith("image/")) {
      reject(new Error(translate(lang, "errChooseImage")));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Scale down so the longest side is at most maxSize pixels
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff"; // white behind transparent images
      context.fillRect(0, 0, width, height);
      context.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(translate(lang, "errReadImage")));
    };

    img.src = url;
  });
}