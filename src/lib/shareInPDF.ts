import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { downloadFile } from "../utils/download";
import { formatTimestamp, generateFilename } from "../utils/formatters";
import { Logger } from "./logger";

// Type definitions
type ImageDimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type FontConfig = {
  japanese: any; // Since PDFFont type requires import, use any as a substitute
  fallback: any;
};

type TextConfig = {
  margin: number;
  lineHeight: number;
  fontSize: number;
  titleFontSize: number;
  maxWidth: number;
};

// constant values
const PAGE_CONFIG = {
  WIDTH: 595.28, // A4 width : 210mm x 297mm (points)
  HEIGHT: 841.89, // A4 height : 210mm x 297mm (points)
  MARGIN: 40, // Base margin (points)
  IMAGE_SCALE: 0.95, // Image maximum scale (95%)
};

const TEXT_CONFIG: TextConfig = {
  margin: 50,
  lineHeight: 20,
  fontSize: 10,
  titleFontSize: 12,
  maxWidth: PAGE_CONFIG.WIDTH - 100, // margin * 2
};

const JAPANESE_FONT_URL =
  "https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.otf";

// Initialize fonts
const initializeFonts = async (pdfDoc: PDFDocument): Promise<FontConfig> => {
  // Register fontkit
  pdfDoc.registerFontkit(fontkit);

  // Fetch and embed the Japanese font
  const fontBytes = await fetch(JAPANESE_FONT_URL).then((res) =>
    res.arrayBuffer(),
  );

  return {
    japanese: await pdfDoc.embedFont(fontBytes, { subset: true }),
    fallback: await pdfDoc.embedFont(StandardFonts.Helvetica),
  };
};

// Image processing function
const processImage = async (
  pdfDoc: PDFDocument,
  imageData: string,
): Promise<{
  image: any;
  dimensions: ImageDimensions;
}> => {
  const imageBytes = Uint8Array.from(atob(imageData.split(",")[1]), (c) =>
    c.charCodeAt(0),
  );
  const image = await pdfDoc.embedPng(imageBytes);
  const imageDims = image.scale(1);

  const availableWidth = PAGE_CONFIG.WIDTH - PAGE_CONFIG.MARGIN * 2;
  const availableHeight = PAGE_CONFIG.HEIGHT - PAGE_CONFIG.MARGIN * 2;

  const widthScale = availableWidth / imageDims.width;
  const heightScale = availableHeight / imageDims.height;
  const scale = Math.min(widthScale, heightScale) * PAGE_CONFIG.IMAGE_SCALE;

  const scaledWidth = imageDims.width * scale;
  const scaledHeight = imageDims.height * scale;

  return {
    image,
    dimensions: {
      width: scaledWidth,
      height: scaledHeight,
      x: (PAGE_CONFIG.WIDTH - scaledWidth) / 2,
      y: (PAGE_CONFIG.HEIGHT - scaledHeight) / 2,
    },
  };
};

// Text wrapping function
const wrapText = (
  text: string,
  font: any,
  maxWidth: number,
  fontSize: number,
): string[] => {
  const lines: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    let lineLength = remainingText.length;
    while (
      lineLength > 0 &&
      font.widthOfTextAtSize(remainingText.substring(0, lineLength), fontSize) >
        maxWidth
    ) {
      lineLength--;
    }

    const line = remainingText.substring(0, lineLength);
    lines.push(line);
    remainingText = remainingText.substring(lineLength).trim();
  }

  return lines;
};

// Draw text on the page
const drawText = (
  page: any,
  text: string,
  x: number,
  y: number,
  size: number,
  fonts: FontConfig,
): void => {
  try {
    page.drawText(text, {
      x,
      y,
      size,
      font: fonts.japanese,
      color: rgb(0, 0, 0),
    });
  } catch (e) {
    console.warn("Falling back to standard font for:", text);
    page.drawText(text, {
      x,
      y,
      size,
      font: fonts.fallback,
      color: rgb(0, 0, 0),
    });
  }
};

export const shareInPDF = async (
  imageData: string,
  comment: string,
  url: string,
  startTag: string,
): Promise<void> => {
  const logger = new Logger("ShareInPDF");

  try {
    const pdfDoc = await PDFDocument.create();
    const fonts = await initializeFonts(pdfDoc);
    const { image, dimensions } = await processImage(pdfDoc, imageData);

    // Page 1: Screenshot page
    const firstPage = pdfDoc.addPage([PAGE_CONFIG.WIDTH, PAGE_CONFIG.HEIGHT]);
    firstPage.drawImage(image, dimensions);

    // Page 2: Information page
    const secondPage = pdfDoc.addPage([PAGE_CONFIG.WIDTH, PAGE_CONFIG.HEIGHT]);
    let yOffset = 800;
    const now = new Date();

    // Add text to the page
    drawText(
      secondPage,
      "取得日時:",
      TEXT_CONFIG.margin,
      yOffset,
      TEXT_CONFIG.titleFontSize,
      fonts,
    );
    yOffset -= TEXT_CONFIG.lineHeight;
    drawText(
      secondPage,
      formatTimestamp(now),
      TEXT_CONFIG.margin,
      yOffset,
      TEXT_CONFIG.fontSize,
      fonts,
    );
    yOffset -= TEXT_CONFIG.lineHeight * 2;

    drawText(
      secondPage,
      "URL:",
      TEXT_CONFIG.margin,
      yOffset,
      TEXT_CONFIG.titleFontSize,
      fonts,
    );
    yOffset -= TEXT_CONFIG.lineHeight;
    const urlLines = wrapText(
      url,
      fonts.japanese,
      TEXT_CONFIG.maxWidth,
      TEXT_CONFIG.fontSize,
    );
    for (const line of urlLines) {
      drawText(
        secondPage,
        line,
        TEXT_CONFIG.margin,
        yOffset,
        TEXT_CONFIG.fontSize,
        fonts,
      );
      yOffset -= TEXT_CONFIG.lineHeight;
    }
    yOffset -= TEXT_CONFIG.lineHeight;

    drawText(
      secondPage,
      "開始タグ:",
      TEXT_CONFIG.margin,
      yOffset,
      TEXT_CONFIG.titleFontSize,
      fonts,
    );
    yOffset -= TEXT_CONFIG.lineHeight;
    const startTagLines = wrapText(
      startTag,
      fonts.japanese,
      TEXT_CONFIG.maxWidth,
      TEXT_CONFIG.fontSize,
    );
    for (const line of startTagLines) {
      drawText(
        secondPage,
        line,
        TEXT_CONFIG.margin,
        yOffset,
        TEXT_CONFIG.fontSize,
        fonts,
      );
      yOffset -= TEXT_CONFIG.lineHeight;
    }
    yOffset -= TEXT_CONFIG.lineHeight;

    drawText(
      secondPage,
      "コメント:",
      TEXT_CONFIG.margin,
      yOffset,
      TEXT_CONFIG.titleFontSize,
      fonts,
    );
    yOffset -= TEXT_CONFIG.lineHeight;
    const commentLines = wrapText(
      comment,
      fonts.japanese,
      TEXT_CONFIG.maxWidth,
      TEXT_CONFIG.fontSize,
    );
    for (const line of commentLines) {
      drawText(
        secondPage,
        line,
        TEXT_CONFIG.margin,
        yOffset,
        TEXT_CONFIG.fontSize,
        fonts,
      );
      yOffset -= TEXT_CONFIG.lineHeight;
    }

    // generate the PDF file
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });

    // Execute the download
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    await downloadFile(pdfBlob, generateFilename(now, "pdf"), {
      saveAs: false,
    });
  } catch (error) {
    logger.error("PDF generation and download failed:", error);
    throw error;
  }
};