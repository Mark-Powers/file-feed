// TODO set rootPath and filters from web

const exec = require('child_process').exec;
const express = require('express');
const fs = require('fs')
const templates = require('./templates.js');
const bodyParser = require("body-parser");

const maxFiles = 50;
const port = 8000
const rootPath = "/home/mark/Music"
const type = "audio"
const filters = {
    "audio": ["flac", "ogg", "mp3", "aac", "midi", "mid", "opus", "wav", "m4a", "m3u"],
    "written": ["txt", "pdf", "html", "epub", "doc", "docx"]
}

const server = express();

server.use(bodyParser.urlencoded({ extended: false }));

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

function loadTheFilesAndExtensions(path){
    files = fs.readdirSync(path)
    files.forEach((file) => {
        let stat = fs.statSync(`${path}/${file}`)
        if(stat.isDirectory()){
            loadTheFilesAndExtensions(`${path}/${file}`)
        } else {
            let idx = file.lastIndexOf(".")
            if(idx == -1){
                return
            }
            let ext = file.substring(idx+1)
            if(!extentions.includes(ext)){
                extentions.push(ext)
            }
            if(type != "all" && filters[type].includes(ext)){
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

var theFiles
var extentions
server.get('/', async (req, res, next) => {
    extentions = []
    theFiles = []
    loadTheFilesAndExtensions(rootPath)
    shuffle(theFiles)
    
    theFiles = theFiles.slice(0, maxFiles)
    var html = []
    html.push(templates["/"]["pre"])
    theFiles.forEach((file, index) => {
        html.push(`<li onclick="fetchOpen(${index})">`)
        html.push(`<span class="name" >${file.name}</span>`)
        html.push(`<span class="path" >${file.path} <span class="btn" onclick="fetchOpenDir(${index})">browse</span></span>`)
        html.push(`<span class="date" >Created: ${file.created}</span>`)
        html.push(`<span class="date" >Accessed: ${file.accessed}</span>`)
        html.push(`</li>`)
    })
    html.push(templates["/"]["post"])
    res.status(200).send(html.join(""))
})

server.get("/config", async (req, res, next) => {
    var html = []
    html.push(templates["/config"]["pre"])
    html.push(`<div><span>Path</span><input id="inputPath" type="text" value="${rootPath}"></div>`)
    html.push(`<div><span>Max Files</span><input id="inputMax" type="number" value="${maxFiles}"></div>`)
    html.push(`<div><span>File Filter</span><input id="inputType" type="text" value="${type}"></div>`)
    html.push(`<div><span class="btn" onclick="postConfig()">Save</span></div>`)
    html.push(templates["/config"]["post"])
    res.status(200).send(html.join(""))
}) 

server.post("/config", async (req, res, next) => {
    console.log(req.headers)
    console.log(req.body)
    res.status(200).send("")
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
