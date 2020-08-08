// TODO set rootPath and filters from web

const exec = require('child_process').exec;
const express = require('express');
const fs = require('fs')

const maxFiles = 50;
const port = 8000
const rootPath = ""
const type = "written"
const filters = {
    "audio": ["flac", "ogg", "mp3", "aac", "midi", "mid", "opus", "wav"],
    "written": ["txt", "pdf", "html", "epub", "doc", "docx"]
}

const server = express();

server.use((req, res, next) => {
    console.debug(new Date(), req.ip, req.method, req.originalUrl);
    if(!["::1", "::ffff:127.0.0.1"].includes(req.ip )){
        res.status(404).send("you shall not pass")
        return
    }
    next();
})

server.get('/main.css', (req, res) => res.sendFile(__dirname + "/main.css"))

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

var theFiles
server.get('/', async (req, res, next) => {
    theFiles = []
    listFiles = function(path){
        files = fs.readdirSync(path)
        files.forEach((file) => {
            let stat = fs.statSync(`${path}/${file}`)
            if(stat.isDirectory()){
                listFiles(`${path}/${file}`)
            } else {
                let idx = file.lastIndexOf(".")
                if(idx == -1){
                    return
                }
                let ext = file.substring(idx+1)
                console.log(ext)
                if(filters[type].includes(ext)){
                    theFiles.push({
                        path: path,
                        name: file,
                        created: String(stat.birthtime).substring(0, 24),
                        accessed: String(stat.atime).substring(0, 24),
                    })
                }
                
            }
        }) 
    }
    listFiles(rootPath)
    shuffle(theFiles)
    theFiles = theFiles.slice(0, maxFiles)
    var html = []
    html.push(`<!doctype html>
    <html lang="en">
    <head>
        <title>Files</title>
        <link rel="stylesheet" type="text/css" href="/main.css">
        <script>
            function fetchOpen(index){
                fetch("/open/"+index)
                    .then(response => console.log("ok"))
                    .catch((error) => {
                        console.error('Error:', error);
                      });                      
            }
            function fetchOpenDir(index){
                event.stopPropagation();
                console.log("test")
                fetch("/openDir/"+index)
                    .then(response => console.log("ok"))
                    .catch((error) => {
                        console.error('Error:', error);
                      });  
            }
        </script>
    </head>
    <body>
    <h1>Check out these files!</h1>
    <ul>`)
    theFiles.forEach((file, index) => {
        html.push(`<li onclick="fetchOpen(${index})">`)
        html.push(`<span class="name" >${file.name}</span>`)
        html.push(`<span class="path" >${file.path} <span class="btn" onclick="fetchOpenDir(${index})">browse</span></span>`)
        html.push(`<span class="date" >Created: ${file.created}</span>`)
        html.push(`<span class="date" >Accessed: ${file.accessed}</span>`)
        html.push(`</li>`)
    })
    html.push(`</ul>
    </body>
    </html>`)
    res.status(200).send(html.join(""))
})

server.get("/open/:index", (req, res, next)=>{
    let index = Number(req.params.index)
    let f = theFiles[index]
    exec(`xdg-open "${f.path}/${f.name}"`)

    res.status(200).send("");
})

server.get("/openDir/:index", (req, res, next)=>{
    let index = Number(req.params.index)
    let f = theFiles[index]
    exec(`xdg-open "${f.path}"`)

    res.status(200).send("");
})

server.listen(port, () => console.info(`Listening on port ${port}`))
