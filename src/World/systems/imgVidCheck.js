function isImageOrVideo(filePath) {
    const lowerCaseFilePath = filePath.toLowerCase();
  
    if (lowerCaseFilePath.endsWith('.jpg') ||
        lowerCaseFilePath.endsWith('.jpeg') ||
        lowerCaseFilePath.endsWith('.png') ||
        lowerCaseFilePath.endsWith('.gif') ||
        lowerCaseFilePath.endsWith('.svg') ||
        lowerCaseFilePath.endsWith('.webp') ||
        lowerCaseFilePath.endsWith('.bmp')) {
      return 'image';
    } else if (lowerCaseFilePath.endsWith('.mp4') ||
               lowerCaseFilePath.endsWith('.webm') ||
               lowerCaseFilePath.endsWith('.ogg') ||
               lowerCaseFilePath.endsWith('.mov') ||
               lowerCaseFilePath.endsWith('.avi') ||
               lowerCaseFilePath.endsWith('.mkv')) {
      return 'video';
    } else {
      return 'unknown';
    }
}
  
export { isImageOrVideo };
  

  