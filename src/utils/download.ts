// src/utils/download.ts

export async function downloadFile(
  blob: Blob,
  filename: string,
  options: { saveAs?: boolean } = {},
): Promise<void> {
  console.log(`Downloading file: ${filename}`);
  const downloadUrl = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: downloadUrl,
      filename,
      saveAs: options.saveAs ?? false,
    });
  } finally {
    // Cleanup immediately after download starts
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }
}
