// src/utils/download.ts

export const downloadFile = async (
  blob: Blob,
  filename: string,
  options: { saveAs?: boolean } = {}
): Promise<void> => {
  const downloadUrl = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: downloadUrl,
      filename,
      saveAs: options.saveAs ?? false, // Save as dialog by default
    });
  } finally {
    // Cleanup immediately after download starts
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }
};
