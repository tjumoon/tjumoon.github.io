var pathFn = require('path');
var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function (locals) {
    var log = this.log;
    var config = this.config;
    var count = config.baidu_url_submit.count;
    var urlsPath = config.baidu_url_submit.path;
    
    var host = config.baidu_url_submit.host;
    var token = config.baidu_url_submit.token;

    log.info("Generating Baidu urls for last " + count + " posts");

    // get last posts
    var urls = [].concat(locals.posts.toArray())
                     .map(function(post) {
                       return {
                         "date": post.date,
                         "permalink": post.permalink
                       }
                     })
                     .sort(function(a, b) {
                       return b.date - a.date;
                     })
                     .slice(0, count)
                     .map(function(post) {
                       return post.permalink
                     })
                     .join('\n');

    log.info("Posts urls generated in " + urlsPath + "\n" + urls);

    var target = "http://data.zz.baidu.com/urls?site=" + host + "&token=" + token;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', target, false);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.onload = function () {
        console.log(this.responseText);
    };
    xhr.send(urls);
};