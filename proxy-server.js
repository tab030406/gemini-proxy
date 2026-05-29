const https = require('https');
 
require('http').createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
 
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try {
      const { apiKey, payload } = JSON.parse(body);
      const data = JSON.stringify(payload);
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      };
      const preq = https.request(options, pres => {
        let result = '';
        pres.on('data', d => result += d);
        pres.on('end', () => {
          res.writeHead(pres.statusCode, { 'Content-Type': 'application/json' });
          res.end(result);
        });
      });
      preq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      preq.write(data);
      preq.end();
    } catch(e) {
      res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
    }
  });
}).listen(process.env.PORT || 3000, () => console.log('Proxy running'));
 
