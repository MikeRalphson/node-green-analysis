'use strict';

const fs = require('fs');

const cheerio = require('cheerio');

const htmlStr = fs.readFileSync('./index.html','utf8');

let $ = cheerio.load(htmlStr);

$('article').each(function(e){
    console.log($(this).children('header').first().children('h1').first().children('a').first().text());
    let caption = $(this).children('table .results').first().children('caption').first();
    console.log($(caption).text());
});


