'use strict';

const fs = require('fs');

const cheerio = require('cheerio');

const htmlStr = fs.readFileSync('./index.html','utf8');

let $ = cheerio.load(htmlStr);

let columnA = process.argv[2] || 1;
let columnB = process.argv[3] || 2;

$('article').each(function(e){
    console.log('#',$(this).children('header').first().children('h1').first().children('a').first().text());
    let tables = $(this).children('table');
    $(tables).each(function(i,t){
        let link = $(this).children('caption').first().children('h2').first().children('a').first();
        console.log('##',$(link).text());
        $(this).children('tbody').first().children('tr').each(function(i,tr){
            let td = $(this).children('td');
            let tdf = $(td).first();
            if ($(tdf).hasClass('sub')) {
                let link = $(tdf).children('h3').first().children('a').first();
                console.log('###',$(link).text());
            }
            else if ($(tdf).hasClass('subsub')) {
                let link = $(tdf).children('a').first();
                console.log('####',$(link).text());
                let tdA = $(td).eq(columnA).children('div').first();
                let tdB = $(td).eq(columnB).children('div').first();
                if (($(tdA).hasClass('Yes')) && ($(tdB).hasClass('Error'))) {
                    console.log('*','Can be used');
                }
            }
        });
    });
});

let versions = [];

$('header').first().children('.headings').first().children('tbody').first().children('tr').first().children('th').each(function(i,th){
    let version = $(this).text().split('\n')[0];
    versions.push(version);
});

console.log('\nComparison of',versions[columnA],versions[columnB]);
