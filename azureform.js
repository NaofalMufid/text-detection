const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const fs = require('fs');

async function OCRAzure(dokumen, filename) {
    const endpoint = process.env.AZURE_FORM_ENDPOINT;
    const api_key = process.env.AZURE_API_KEY;
    const model_id = process.env.AZURE_MODEL_ID;

    const file = dokumen;

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(api_key));
    const poller = await client.beginAnalyzeDocument(model_id, file);
    const { documents: [document] } = await poller.pollUntilDone();

    if (!document) {
        throw new Error("Expected at least one document in the result.");
    }

    console.log(
        "Extracted document:",
        document.docType,
        `(confidence: ${document.confidence || "<undefined>"})`
    );
    // console.log("Fields:", document.fields);
    const result = {};
    for(const attribute in document.fields){
        const value = document.fields[attribute].value
        result[attribute] = value;
    }
    fs.writeFileSync(`./hasil/azure-ocr-${filename}.json`, JSON.stringify(result));
};

module.exports = {
    OCRAzure
};
