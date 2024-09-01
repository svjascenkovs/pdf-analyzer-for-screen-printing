const { Poppler } = require('node-poppler');
const sharp = require('sharp');
const path = require('path');

// Paths
const pdfPath = path.resolve(__dirname, 'testExample.pdf'); // Path to your PDF file
const outputDir = path.resolve(__dirname, 'output'); // Output directory
// PNG file path
const imagePath = path.join(__dirname, 'output.png'); // Output directory
const dpi = 300;

const poppler = new Poppler();
async function convertPdfToPng(pdfPath, outputDir) {
  // Define the DPI value (e.g., 300 DPI)
  try {
    const options = {
      pngFile: true, // Output PNG files
      singleFile: true, // Generate separate files for each page
      resolutionXYAxis: dpi,
    };

    // Convert PDF to PNG
    const output = await poppler.pdfToCairo(pdfPath, outputDir, options);
    console.log('PDF successfully converted to PNG:', output);
    // Call the function and log the result
    calculateBlackAreaInMm2(imagePath, dpi)
      .then((areaInMm2) => {
        // console.log(`Total black area: ${areaInMm2.toFixed(2)} mm²`);
        console.log(`Total black area: ${areaInMm2} m²`);
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
  }
}

// Function to calculate black area in the image
async function calculateBlackAreaInMm2(imagePath, dpi = 300) {
  // Load the image with sharp
  const image = sharp(imagePath);

  // Get image metadata
  const metadata = await image.metadata();
  const { width, height } = metadata;
  console.log(width, height);

  // Extract pixel data
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // Count the number of black pixels
  let blackPixelCount = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if the pixel is black (you can adjust the tolerance)
    if (r < 10 && g < 10 && b < 10) {
      blackPixelCount++;
    }
  }

  // Calculate the area in pixels
  const pixelArea = blackPixelCount;
  console.log({ blackPixelCount });

  // Convert the area to mm^2 using DPI
  const pixelPerMm = dpi / 25.4; // 25.4 mm per inch
  // const areaInMm2 = pixelArea / (pixelPerMm * pixelPerMm); // Area in square milimerers
  const areaInMeters2 = pixelArea / (pixelPerMm * pixelPerMm) / 1000000; // Area in square meters

  return areaInMeters2;
}

// Convert the PDF
convertPdfToPng(pdfPath, outputDir);
