var http = require('http');
var fs = require('fs');
var marked = require('marked');
var url = require('url');

http.createServer(function (req, res) {
    var reqUrl = url.parse(req.url);
    var path = reqUrl.path;

    if (/\.(css)$/.test(path)) {
        var filepath = (path + '').replace(/\.[0-9]+\.css$/g,'.css');

        var stat = fs.statSync(".." + filepath);

        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
        res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader("Vary", "Accept-Encoding");
        res.setHeader('Last-Modified', stat.mtime);
        res.writeHead(200, {'Content-Type': 'text/css'});

        res.write(fs.readFileSync(".." + filepath));
        res.end();

    } else if (/\/blog\//.test(path)) {
        path = path.replace('/blog','');
        console.log(path);
        var path = "../entries" + path + ".md";

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

                    links += '<li><a class="'+(("/"+entryName == path) ? "active" : "")+'" href="/blog/' + entryName + '">' + ucwords(name) + '</a></li>';
                }
                fs.readFile(path, function (err, data) {
                    if (err) {
                        throw err;
                    }

                    data = data.toString();
                    var regex = /([^|]*)\n\|\|*/;
                    var informations = data.match(regex);
                    if(informations != null) {
                        informations = informations[1];
                        informations = getMetaData(informations);
                        for (var k in informations) {
                            if (informations.hasOwnProperty(k)) {

                                var key = k.toUpperCase();
                                layout = layout.replace("%"+key+"%",informations[k]);
                            }
                        }
                    }
                    var content = marked(data.replace(regex, ''));

                    layout = layout.replace("%MENU%", links);
                    layout = layout.replace("%CONTENT%", content);
                    layout = layout.replace("%TITLE%", path.substring(1));
                    layout = layout.replace("%DISQUS%", fs.readFileSync("../layout/disqus.html").toString());

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


