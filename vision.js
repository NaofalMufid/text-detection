const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const fs = require('fs');

async function OCRGoogle(dokumen) {
    try {
        const [results] = await client.textDetection(dokumen);
        const detections = results.textAnnotations;
        fs.writeFileSync('./file/google-hasil.json', JSON.stringify(detections));
        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

module.exports = {
    OCRGoogle
};

