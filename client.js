const http2 = require('http2');
const fs = require('fs');
const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('localhost-cert.pem')
});

client.on('error', (err) => console.error(err));

client.on('stream', (pushedStream, requestHeaders) => {
  pushedStream.on('push', (responseHeaders) => {
    // process response headers
  });
  pushedStream.on('data', (chunk) => { 
    console.log(JSON.parse(chunk.toString()))
  /* handle pushed data */ 
  });
  pushedStream.on('end', ()=> {
    console.log('end')
  })
});

const req = client.request({ ':path': '/' });

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log(`\n${data}`);
  client.close();
});
req.end();
