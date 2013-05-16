var http = require('http');
var fs = require('fs');
var marked = require('marked');
var url = require('url');
var cleanCSS = require('clean-css');

http.createServer(function (req, res) {

    var reqUrl = url.parse(req.url);
    var path = reqUrl.path;

    if (/\.(css)$/.test(reqUrl.path)) {
        getCssFile(reqUrl.path, res);
    } else if(/\.(js)$/.test(reqUrl.path)) {
        getJsFile(reqUrl.path, res);
    } else if (/\.(txt)$/.test(reqUrl.path)) {
        getTxtFile(reqUrl.path, res);
    } else if (/^\/blog\/[a-z0-9-]*$/.test(path)) {
        path = path.replace('/blog', '');
        path = "../entries" + path + ".md";

        if (!fs.existsSync(path)) {
            res.writeHead(404, {'Conten-Type': 'text/html; charset=utf-8'});
            res.end("yolo bitch");
        } else {
            var time = Date.now();
            var article = getArticle(path);
            article += Date.now()-time;
            echoHTML(article, res);


        }
    } else if (path == "/") {
        var lastEntries = getLastEntries(5);
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        var content = "";
        for (var i = 0; i < lastEntries.length; ++i) {
            var data = fs.readFileSync(lastEntries[i].path).toString();
            var articleSlug = lastEntries[i].name.substring(0, lastEntries[i].name.length - 3);
            var informations = parseMetaData(data);
            var entry = getRealContent(data);
            entry = insertMetaData(entry,informations);
            content += getExcerpt(entry, articleSlug) + "<hr>";

        }
        var layout = infuseLayout(content);
        layout = layout.replace("%TITLE%","Zappcms Blog");
        res.end(layout);
    } else if(/^\/archiv\/[0-9]{4}-[0-9]{2}$/.test(reqUrl.path)) {
        var date = reqUrl.path.substring(8);
        var articles = getArticlesInMonth(date);

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        var content = "";
        for (var i = 0; i < articles.length; ++i) {
            var data = articles[i];
            var articleSlug = articles[i].name.substring(0, articles[i].name.length - 3);
            var informations = parseMetaData(data.content);
            var entry = getRealContent(data.content);
            entry = insertMetaData(entry, informations);
            content += getExcerpt(entry, articleSlug) + "<hr>";
        }
        var layout = infuseLayout(content);
        layout = layout.replace("%TITLE%","Zappcms Archiv "+date);
        res.end(layout);
    } else if(/^\/gitpull$/.test(reqUrl.path)) {
        var util = require('util'),
                spawn = require('child_process').spawn,
                ls = spawn('sh', ['gitpull.sh']); // the second arg is the command
        // options

        ls.stdout.on('data', function (data) {    // register one or more handlers
            console.log('stdout: ' + data);
        });

    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end("404, not found :(");
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

function infuseLayout(content) {
    var layout = fs.readFileSync("../layout/layout.html").toString();
    var months = getArticleMonths();
    var links = "";
    for(var i=0;i<months.length;++i) {
        links += '<li><a href="/archiv/'+months[i]+'">'+months[i]+'</a></li>';
    }

    layout = layout.replace("%MENU%", links);
    layout = layout.replace("%CONTENT%", content);
    layout = layout.replace("%DISQUS%", fs.readFileSync("../layout/disqus.html").toString());

    return layout;
}

function getArticleMonths() {
    var entries = fs.readdirSync("../entries");
    var months = [];
    for (var i = 0; i < entries.length; ++i) {
        var path = "../entries/" + entries[i];
        var datas = getMetaDataFromFile(path);
        var date = datas.created.split("-");
        var month = date[1];
        var year = date[0];
        var menuString = year + "-" + month;
        if (months.indexOf(menuString) == -1) {
            months.push(menuString);
        }
    }

    return months;
}

function getArticlesInMonth(yearMonth) {
    var entries = fs.readdirSync("../entries");
    var articles = [];
    for (var i = 0; i < entries.length; ++i) {
        var path = "../entries/" + entries[i];
        var wholeFile = fs.readFileSync(path).toString();
        var datas = parseMetaData(wholeFile);
        var date = datas.created.split("-");
        var month = date[1];
        var year = date[0];
        var menuString = year + "-" + month;

        if(menuString == yearMonth) {
            articles.push({name:entries[i],content:wholeFile});
        }
    }

    return articles;
}



function parseMetaData(article) {
    var regex = /([^|]*)\n\|\|*/;
    var informations = article.match(regex);
    if (informations == null) return null;

    informations = informations[1];
    var rows = informations.split("\n");
    var data = {};
    for (var i = 0; i < rows.length; ++i) {
        var key = rows[i].match(/^([a-z]+)/);
        key = key[0];
        var index = rows[i].indexOf(":");
        var value = rows[i].substring(index + 1);
        data[key] = value;
    }
    return data;
}

function insertMetaData(str, inf) {
    if (inf != null) {
        for (var k in inf) {
            if (inf.hasOwnProperty(k)) {
                var key = k.toUpperCase();
                str = str.replace("%" + key + "%", inf[k]);
            }
        }
    }

    return str;

}

function getMetaDataFromFile(file) {
    var data = fs.readFileSync(file).toString();
    return parseMetaData(data);
}

function getLastEntries(count) {
    var entries = fs.readdirSync("../entries");
    var data = [];
    for (var i = 0; i < entries.length; ++i) {
        var metaData = getMetaDataFromFile("../entries/" + entries[i]);
        data.push({ created: metaData.created, path: "../entries/" + entries[i], name: entries[i] });
    }

    data.sort(function (a, b) {
        return a.created < b.created;
    });

    data = data.slice(0,count);

    return data;
}


function getExcerpt(data, articleSlug) {
    var firstdot = data.indexOf(".");
    var excerpt;
    if (firstdot == -1) {
        excerpt = data;
    } else {
        excerpt = data.substring(0, firstdot + 1);
    }
    excerpt += '<br><a href="/blog/' + articleSlug + '">Weiter lesen...</a>';
    excerpt = excerpt.replace('<h1>', '<h1><a href="/blog/' + articleSlug + '">');
    excerpt = excerpt.replace('</h1>', '</a></h1>');
    return excerpt;
}

function getRealContent(data) {
    var regex = /([^|]*)\n\|\|*/;
    var content = marked(data.replace(regex, ''));
    return content;
}


function getCssFile(path, res) {
    var filepath = (path + '').replace(/\.[0-9]+\.css$/g, '.css');

    var stat = fs.statSync(".." + filepath);

    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
    res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader('Last-Modified', stat.mtime);
    res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});

    var content = fs.readFileSync(".." + filepath).toString();
    content = cleanCSS.process(content);

    res.write(content);
    res.end();
}

function getTxtFile(path, res) {

    var stat = fs.statSync("../layout" + path);

    res.setHeader("Cache-Control", "public, max-age=345600"); // 1 year
    res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader('Last-Modified', stat.mtime);
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});

    res.write(fs.readFileSync("../layout" + path));
    res.end();
}

function getJsFile(path, res) {
    var filepath = (path + '').replace(/\.[0-9]+\.js/g, '.js');

    var stat = fs.statSync(".." + filepath);

    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
    res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader('Last-Modified', stat.mtime);
    res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});

    res.write(fs.readFileSync(".." + filepath));
    res.end();
}

function getArticle(path) {
    var mdData = fs.readFileSync(path).toString();

    var layout = infuseLayout(getArticleContent(mdData));

    var informations = parseMetaData(mdData);
    layout = insertMetaData(layout, informations);

    layout = layout.replace("%TITLE%", ucwords(path.substring(11,path.length-3).replace("-"," ")));

    return layout;
}

function getArticleContent(data) {
    var regex = /([^|]*)\n\|\|*/;
    return marked(data.replace(regex, ''));
}

function echoHTML(str, res) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(str);
}

function cmd_exec(cmd, args, cb_stdout, cb_end) {
    var spawn = require('child_process').spawn,
            child = spawn(cmd, args),
            me = this;
    me.exit = 0;  // Send a cb to set 1 when cmd exits
    child.stdout.on('data', function (data) {
        cb_stdout(me, data)
    });
    child.stdout.on('end', function () {
        cb_end(me)
    });
}
