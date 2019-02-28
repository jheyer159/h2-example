const http2 = require('http2');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile)

const config = 'config.json'

const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  // stream is a Duplex
  try {
    console.log('new stream', headers[':authority'])
    const authority = headers[':authority']
    stream.respond({ ':status': 200 });
    send(stream, authority)
    setInterval( () => send(stream, authority), 3000)
  } catch(err){
    console.error(err)
  }
});

function send(stream, authority) {
  try {
    stream.pushStream({ ':path': '/' }, async (err, pushStream, headers) => {
      try {
        if (err) throw err;
        const now = new Date()
        const time= now.toJSON()
        const file = JSON.parse(await readFile(config))
        const command = file.command
        const json = {time, command}
        console.log(json)
        console.log('send to', authority) 
        pushStream.respond({ ':status': 200 })
        pushStream.end(JSON.stringify(json));
      } catch(err){
        console.error(err)
      }
    })
  } catch(err){
    console.error(err)
  }
}


server.listen(8443);
