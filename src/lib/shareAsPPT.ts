import pptxgen from 'pptxgenjs';
import { downloadFile } from '../utils/download';
import { formatTimestamp, generateFilename } from '../utils/formatters';
import { Logger } from './logger';

// Type definitions
type ImageDimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type SlideStyle = {
  titleStyle: { bold: true; fontSize: number; color: string };
  contentStyle: { fontSize: number; color: string; breakLine: true };
  spaceStyle: { text: string; options: { fontSize: number } };
};

// Constant values
const SLIDE_CONFIG = {
  WIDTH: 10, // Slide width (inches)
  HEIGHT: 5.625, // Slide height (inches, 16:9 ratio)
  IMAGE_SCALE: 0.95, // Image maximum scale (95%)
  MARGIN: 0.025, // Margin (2.5%)
  TEXT_MARGIN: 0.5, // Text margin
};

const SLIDE_STYLES: SlideStyle = {
  titleStyle: { bold: true, fontSize: 14, color: '363636' },
  contentStyle: { fontSize: 12, color: '666666', breakLine: true },
  spaceStyle: { text: '\n', options: { fontSize: 8 } },
};

// Get image dimensions based on the slide size
const getImageDimensions = async (base64ImageData: string): Promise<ImageDimensions> => {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = base64ImageData;
  });

  const imgRatio = img.width / img.height;
  const slideRatio = SLIDE_CONFIG.WIDTH / SLIDE_CONFIG.HEIGHT;
  const availableWidth = SLIDE_CONFIG.WIDTH * SLIDE_CONFIG.IMAGE_SCALE;
  const availableHeight = SLIDE_CONFIG.HEIGHT * SLIDE_CONFIG.IMAGE_SCALE;

  let width: number;
  let height: number;

  // Determine image size based on aspect ratio
  if (imgRatio > slideRatio) {
    width = availableWidth;
    height = width / imgRatio;
  } else {
    height = availableHeight;
    width = height * imgRatio;
  }

  // Center the image on the slide
  const x = (SLIDE_CONFIG.WIDTH - width) / 2;
  const y = (SLIDE_CONFIG.HEIGHT - height) / 2;

  return { width, height, x, y };
};

// Generate PowerPoint file from base64 data
const generatePPTX = async (
  pptxData: string,
  mimeType: string = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
): Promise<Blob> => {
  const byteCharacters = atob(pptxData);
  const byteArray = new Uint8Array(byteCharacters.split('').map((char) => char.charCodeAt(0)));
  return new Blob([byteArray], { type: mimeType });
};

export const shareAsPPT = async (
  imageData: string,
  comment: string,
  url: string,
  startTag: string
): Promise<true> => {
  const logger = new Logger('shareAsPPT');

  try {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // Prefix "data:image/" is required for pptxgenjs
    const base64ImageData = imageData.startsWith('data:image/')
      ? imageData
      : `data:image/png;base64,${imageData}`;

    // Page 1: Screenshot slide
    const slide1 = pres.addSlide();
    const imageDims = await getImageDimensions(base64ImageData);
    slide1.addImage({
      data: base64ImageData,
      x: imageDims.x,
      y: imageDims.y,
      w: imageDims.width,
      h: imageDims.height,
    });

    // Page 2: Information slide
    const slide2 = pres.addSlide();
    const now = new Date();
    const timestamp = formatTimestamp(now);

    // Add text to the slide
    slide2.addText(
      [
        { text: 'Date and time:', options: SLIDE_STYLES.titleStyle },
        { text: timestamp, options: SLIDE_STYLES.contentStyle },
        SLIDE_STYLES.spaceStyle,

        { text: 'URL:', options: SLIDE_STYLES.titleStyle },
        { text: url, options: SLIDE_STYLES.contentStyle },
        SLIDE_STYLES.spaceStyle,

        { text: 'Element start tag:', options: SLIDE_STYLES.titleStyle },
        { text: startTag, options: SLIDE_STYLES.contentStyle },
        SLIDE_STYLES.spaceStyle,

        { text: 'Comment:', options: SLIDE_STYLES.titleStyle },
        { text: comment, options: SLIDE_STYLES.contentStyle },
      ],
      {
        x: SLIDE_CONFIG.TEXT_MARGIN,
        y: SLIDE_CONFIG.TEXT_MARGIN,
        w: '95%',
        h: '90%',
        valign: 'top',
        margin: 10,
      }
    );

    // Generate the PowerPoint file
    const pptxOutput = await pres.write({ outputType: 'base64' });
    if (typeof pptxOutput !== 'string') {
      throw new Error('PowerPoint generation failed: Invalid output type');
    }

    // Execute download
    const pptxBlob = await generatePPTX(pptxOutput);
    await downloadFile(pptxBlob, generateFilename(now, 'pptx'), {
      saveAs: false,
    });

    return true;
  } catch (error) {
    logger.error('PowerPoint generation and download failed:', error);
    throw error;
  }
};
