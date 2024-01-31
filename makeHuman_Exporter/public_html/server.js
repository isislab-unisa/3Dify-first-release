const express = require('express')
const path = require('path')
const { get } = require('request')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, '../images')))
app.use(express.static(path.join(__dirname, '../media')))
app.use(express.static(path.join(__dirname, '../../weights')))
app.use(express.static(path.join(__dirname, '../../dist')))

app.get('/', (req, res) => res.redirect('/makehuman_exporter'))
app.get('/makehuman_exporter', (req, res) => res.sendFile(path.join(viewsDir, 'makeHumanExporter.html')))
app.get('/mediaPipeTest', (req, res) => res.sendFile(path.join(viewsDir, 'mediaPipeTest.html')))

app.post('/fetch_external_image', async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) {
    return res.status(400).send('imageUrl param required')
  }
  try {
    const externalResponse = await request(imageUrl)
    res.set('content-type', externalResponse.headers['content-type'])
    return res.status(202).send(Buffer.from(externalResponse.body))
  } catch (err) {
    return res.status(404).send(err.toString())
  }
})

const fs = require('fs')
var exec = require('child_process').exec;

app.post('/uploadmhm', (req, res) => {

  console.log(req.body.text)
  fs.writeFile(path.join(__dirname, 'aaa.mhm'), req.body.text, (err) => {
    if (err) {
      return res.send(err);
    } else {
      exec('\"C:\\Program Files\\Python312\\python.exe\" d:\\MakehumanSocketClient\\cli\\mhrc\\genericCommand.py loadMhm', 
          (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
          
            console.log(`${stdout}`);
            exec('\"C:\\Program Files\\Python312\\python.exe\" d:\\MakehumanSocketClient\\cli\\mhrc\\genericCommand.py exportFbx',
              (err, stdout, stderr) => {
                if (err) {
                  console.error(`exec error: ${err}`);
                  return;
                }
              
                console.log(`${stdout}`);
                res.send('OK');
              });
      });
    }
  })
});

app.post('/applymodifiers', (req, res) =>
{
  console.log(req.body.text)
  fs.writeFile(path.join(__dirname, 'aaa.json'), req.body.text, (err) => {
    if (err) {
      return res.send(err);
    } else {      
      exec('\"C:\\Program Files\\Python312\\python.exe\" d:\\3dify\\MakehumanSocketClient\\cli\\mhrc\\applymodifiers.py ' + path.join(__dirname, 'aaa.json'), 
          (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
          
            console.log(`${stdout}`);
            exec('\"C:\\Program Files\\Python312\\python.exe\" d:\\3dify\\MakehumanSocketClient\\cli\\mhrc\\genericCommand.py exportFbx',
              (err, stdout, stderr) => {
                if (err) {
                  console.error(`exec error: ${err}`);
                  return;
                }
              
                console.log(`${stdout}`);
                res.send('OK');
              });
      });
    }
  })
})

var AdmZip = require('adm-zip');
app.get('/downloadFbxZip', function(req, res) {
    var zip = new AdmZip();
    // add local file
    zip.addLocalFile("d:/myHuman.fbx");
    zip.addLocalFolder("d:/Textures/", "/Textures");
    // get everything as a buffer
    var zipFileContents = zip.toBuffer();
    const fileName = 'avatar.zip';
    const fileType = 'application/zip';
    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': fileType,
      })
    return res.end(zipFileContents);
});

app.listen(3000, () => console.log('Listening on port 3000!'))

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    )

    get(options, function(err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}