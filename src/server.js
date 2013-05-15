var http = require('http');
var fs = require('fs');
var marked = require('marked');
var url = require('url');

http.createServer(function (req, res) {
    var reqUrl = url.parse(req.url);

    if (/\.(css)$/.test(reqUrl.path)) {
        var filepath = (reqUrl.path + '').replace(/\.[0-9]+\.css$/g,'.css');

        var stat = fs.statSync(".." + filepath);

        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
        res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader("Vary", "Accept-Encoding");
        res.setHeader('Last-Modified', stat.mtime);
        res.writeHead(200, {'Content-Type': 'text/css'});

        res.write(fs.readFileSync(".." + filepath));
        res.end();

    } else {
        var path = "../entries" + reqUrl.path + ".md";

        if (!fs.existsSync(path)) {
            res.writeHead(404, {'Conten-Type': 'text/html'});
            res.end("yolo bitch");
        } else {
            var layout;
            res.writeHead(200, {'Content-Type': 'text/html'});

            fs.readFile("../layout/layout.html", function (err, data) {
                if (err) {
                    throw err;
                }
                layout = data.toString();
                var entries = fs.readdirSync("../entries");
                var links = "";
                for (var i = 0; i < entries.length; ++i) {
                    var entryName = entries[i].substring(0, entries[i].length - 3);
                    var name = entryName.replace("-", " ");

                    links += '<li><a class="'+(("/"+entryName == reqUrl.path) ? "active" : "")+'" href="/' + entryName + '">' + ucwords(name) + '</a></li>';
                }
                fs.readFile(path, function (err, data) {
                    if (err) {
                        throw err;
                    }

                    data = data.toString();
                    var index = data.indexOf("\n\n");
                    var informations = data.substring(0,index);
                    informations = getMetaData(informations);

                    var content = marked(data.substring(index));

                    layout = layout.replace("%MENU%", links);
                    layout = layout.replace("%CONTENT%", content);
                    layout = layout.replace("%TITLE%", reqUrl.path.substring(1));

                    for (var k in informations) {
                        if (informations.hasOwnProperty(k)) {

                            var key = k.toUpperCase();
                            layout = layout.replace("%"+key+"%",informations[k]);
                        }
                    }
                    res.end(layout);
                });
            });
        }

    }

}).listen(8000);


// http://kevin.vanzonneveld.net
// + original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
// + improved by: Waldo Malqui Silva
// + bugfixed by: Onno Marsman
// + improved by: Robin
// + input by: James (http://www.james-bell.co.uk/)
// + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// * example 1: ucwords('kevin van zonneveld');
// * returns 1: 'Kevin Van Zonneveld'
// * example 2: ucwords('HELLO WORLD');
// * returns 2: 'HELLO WORLD'
function ucwords(str) {
    return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
        return $1.toUpperCase();
    });


}

function getMetaData(str) {
    var rows = str.split("\n");
    var data = {};
    for(var i=0;i<rows.length;++i) {
        var key = rows[i].match(/^([a-z]+)/);
        key = key[0];
        var index = rows[i].indexOf(":");
        var value = rows[i].substring(index+1);
        data[key] = value;
    }
    return data;
}


