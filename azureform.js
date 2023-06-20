const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const fs = require('fs');

async function OCRAzure(dokumen) {
    const endpoint = process.env.AZURE_FORM_ENDPOINT;
    const api_key = process.env.AZURE_API_KEY;
    const model_id = process.env.AZURE_MODEL_ID;

    const file = fs.createReadStream(dokumen);

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(api_key));
    const poller = await client.beginAnalyzeDocument(model_id, file, {
        onProgress: ({ status }) => {
            console.log(`status: ${status}`);
        }
    });
};

module.exports = {
    OCRAzure
};
