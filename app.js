const http = require('http');
const Busboy = require('busboy');
const { textDetect } = require('./awstextract');
const { OCRAzure } = require('./azureform');

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const response = {
    code: 200,
    status: true,
    message: ''
  };

  if (req.method === 'POST' && req.url === '/aws') {
    const busboy = Busboy({ headers: req.headers });
    let fileData, file_name;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileData = Buffer.alloc(0);
      file_name = filename.filename;
      file.on('data', (chunk) => {
        fileData = Buffer.concat([fileData, chunk]);
      });
    });

    busboy.on('finish', async () => {
      const aws = await textDetect(fileData, file_name);
      response.status = aws;
      response.message = 'aws ocr';
      res.write(JSON.stringify(response));
      res.end();
    });

    busboy.on('error', (err) => {
      res.statusCode(400);
      res.write({ message: err.message })
      res.end();
    });

    req.pipe(busboy);
  } else if (req.method === 'POST' && req.url === '/azure') {
    const busboy = Busboy({ headers: req.headers });
    let fileData, file_name;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileData = Buffer.alloc(0);
      file_name = filename.filename;
      file.on('data', (chunk) => {
        fileData = Buffer.concat([fileData, chunk]);
      });
    });

    busboy.on('finish', async () => {
      const aws = await OCRAzure(fileData, file_name);
      response.status = aws;
      response.message = 'azure ocr';
      res.write(JSON.stringify(response));
      res.end();
    });

    busboy.on('error', (err) => {
      res.statusCode(400);
      res.write({ message: err.message })
      res.end();
    });

    req.pipe(busboy);
  } else {
    res.write(JSON.stringify(response));
    res.end();
  }
});

server.listen(4050);
