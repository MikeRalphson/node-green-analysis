'use strict';

const fs = require('fs');

const cheerio = require('cheerio');

const htmlStr = fs.readFileSync('./index.html','utf8');

let $ = cheerio.load(htmlStr);

$('article').each(function(e){
    console.log($(this).children('header').first().children('h1').first().children('a').first().text());
    let tables = $(this).children('table');
    $(tables).each(function(i,t){
        let link = $(this).children('caption').first().children('h2').first().children('a').first();
        console.log(' caption',$(link).text());
        $(this).children('tbody').first().children('tr').each(function(i,tr){
            console.log('<tr>');
            let tdf = $(this).children('td').first();
            if ($(tdf).hasClass('sub')) {
                console.log('   ','sub heading');
            }
            else if ($(tdf).hasClass('subsub')) {
                console.log('     ','sub-sub heading');
            }
        });
    });
});


