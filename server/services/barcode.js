import bwipjs from "bwip-js";
import crypto from "crypto";

/**
 * Generate a unique item ID
 * @returns {string} - Generated item ID
 */
function generateItemId() {
  // Generate 8 random bytes and convert to hex string, add NSTP prefix
  return `NSTP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Generate a barcode as a Buffer
 * @param {Object} options - Barcode generation options
 * @param {string} options.text - Text to encode in barcode
 * @param {string} options.bcid - Barcode type (e.g. 'code128', 'qrcode', 'datamatrix', etc)
 * @param {number} options.height - Barcode height in pixels
 * @param {number} options.width - Barcode width in pixels
 * @param {string} options.scale - Scale factor (default: 2)
 * @param {boolean} options.includetext - Whether to include text below barcode
 * @param {string} options.textxalign - Text alignment (center, left, right)
 * @returns {Promise<Buffer>} - Generated barcode as Buffer
 */
async function generateBarcode({
  text,
  bcid = "code128",
  height = 30, // Increased height for better readability
  width = 100, // Increased width for better readability
  scale = 3, // Increased scale for better print quality
  includetext = true,
  textxalign = "center",
}) {
  try {
    return await bwipjs.toBuffer({
      bcid,
      text,
      scale,
      height,
      width,
      includetext,
      textxalign,
    });
  } catch (error) {
    throw new Error(`Failed to generate barcode: ${error.message}`);
  }
}

/**
 * Generate a new item ID and its corresponding barcode
 * @returns {Promise<Object>} - Object containing the item ID and barcode buffer
 */
async function generateItemBarcode() {
  const itemId = generateItemId();
  const barcodeBuffer = await generateBarcode({
    text: itemId,
    bcid: "code128", // Using Code 128 as it's good for alphanumeric data
  });

  return {
    itemId,
    barcodeBuffer,
  };
}

export { generateBarcode, generateItemId, generateItemBarcode };
