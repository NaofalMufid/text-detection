const Tesseract = require('tesseract.js');
const pdf2img = require('pdf2img');

// Path to the PDF file
const pdfPath = './dokumen.pdf';

// Function to convert PDF pages to images
function convertPDFToImages(pdfPath) {
  return new Promise((resolve, reject) => {
    pdf2img.setOptions({
      type: 'png', // Output image format
      density: 200, // Output image density (DPI)
      outputdir: './conv-image', // Output folder path
      outputname: 'page', // Output image name prefix
      page: null, // Convert all pages
    });

    pdf2img.convert(pdfPath, function (err, info) {
      if (err) {
        console.log("waduh",err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

// Function to extract text from images using Tesseract.js
async function extractTextFromImages(images) {
  const results = [];

  for (const image of images) {
    const { data } = await Tesseract.recognize(image.path, 'ind');
    results.push(data.text);
  }

  return results;
}

// Main function to extract text from PDF
async function extractTextFromPDF(pdfPath) {
  try {
    const images = await convertPDFToImages(pdfPath);
    const extractedText = await extractTextFromImages(images);
    return extractedText.join('\n');
  } catch (error) {
    throw error;
  }
}

// Call the function to extract text from PDF
extractTextFromPDF(pdfPath)
  .then(text => {
    console.log('Extracted Text:');
    console.log(text);
  })
  .catch(error => {
    console.error('Error extracting text:', error);
  });
