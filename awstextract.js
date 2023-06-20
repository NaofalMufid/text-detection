require('dotenv').config();
const { AnalyzeDocumentCommand, Textract } = require('@aws-sdk/client-textract');
const fs = require('fs');
const _ = require('lodash')

const client = new Textract({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY_ID,
    },
    region: 'ap-southeast-1'
});

const getText = (result, blocksMap) => {
    let text = "";

    if (_.has(result, "Relationships")) {
        result.Relationships.forEach(relationship => {
            if (relationship.Type === "CHILD") {
                relationship.Ids.forEach(childId => {
                    const word = blocksMap[childId];
                    if (word.BlockType === "WORD") {
                        text += `${word.Text} `;
                    }
                    if (word.BlockType === "SELECTION_ELEMENT") {
                        if (word.SelectionStatus === "SELECTED") {
                            text += `X `;
                        }
                    }
                });
            }
        });
    }
    // fs.writeFileSync('getText.json', JSON.stringify(text.trim()));
    return text.trim();
};

const findValueBlock = (keyBlock, valueMap) => {
    let valueBlock;
    keyBlock.Relationships.forEach(relationship => {
        if (relationship.Type === "VALUE") {
            // eslint-disable-next-line array-callback-return
            relationship.Ids.every(valueId => {
                if (_.has(valueMap, valueId)) {
                    valueBlock = valueMap[valueId];
                    return false;
                }
            });
        }
    });
    // fs.writeFileSync('findValueBlock.json', JSON.stringify(valueBlock));
    return valueBlock;
};

const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
    const keyValues = {};

    const keyMapValues = _.values(keyMap);
    // fs.writeFileSync('keyMapValues.json', JSON.stringify(keyMapValues))
    keyMapValues.forEach(keyMapValue => {
        const valueBlock = findValueBlock(keyMapValue, valueMap);
        const key = getText(keyMapValue, blockMap);
        const value = getText(valueBlock, blockMap);
        keyValues[key] = value;
    });
    // fs.writeFileSync('keyValueRelationship.json', JSON.stringify(keyValues));
    return keyValues;
};

const getKeyValueMap = blocks => {
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};

    let blockId;
    blocks.forEach(block => {
        blockId = block.Id;
        blockMap[blockId] = block;

        if (block.BlockType === "KEY_VALUE_SET") {
            if (_.includes(block.EntityTypes, "KEY")) {
                keyMap[blockId] = block;
            } else {
                valueMap[blockId] = block;
            }
        }
    });
    // fs.writeFileSync('valueMap.json', JSON.stringify({ keyMap, valueMap, blockMap }))
    return { keyMap, valueMap, blockMap };
};

async function textDetect(buffFile, filename) {
    const docLocal = Buffer.from(buffFile, 'binary');
    let detectParam = {
        Document: {
            Bytes: docLocal
        },
        FeatureTypes: ["FORMS"]
    }
    const command = new AnalyzeDocumentCommand(detectParam);
    try {
        const data = await client.send(command);
        // fs.writeFileSync('datatextktpmiring.json', JSON.stringify(data.Blocks));
        const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
        const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);
        fs.writeFileSync(`./hasil/${filename}.json`, JSON.stringify(keyValues));
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    textDetect,
};
