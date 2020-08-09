module.exports = {
    "/": {
        "pre": `<!doctype html>
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
        <ul>`,
        "post": `</ul>
        </body>
        </html>`
    },
    "/config": {
        "pre": `<!doctype html>
        <html lang="en">
        <head>
            <title>Config</title>
            <link rel="stylesheet" type="text/css" href="/main.css">
            <script>
                function postConfig(){
                    newDir = document.getElementById("inputPath")
                    newMax = document.getElementById("inputMax")
                    newType = document.getElementById("inputType")
                    newObj = { rootPath: newDir, maxFiles: newMax, type: newType}
                    fetch("/config", {method: "POST", body: JSON.stringify(newObj)})
                }
            </script>
        </head>
        <body>
        <h1>Config</h1>`,
        "post": `</body>
        </html>`
    }
}
