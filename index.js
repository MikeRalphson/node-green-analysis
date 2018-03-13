'use strict';

const fs = require('fs');

const cheerio = require('cheerio');

const htmlStr = fs.readFileSync('./index.html','utf8');

let $ = cheerio.load(htmlStr);

let columnA = process.argv[2] || 1;
let columnB = process.argv[3] || 2;

let headings = [{},{},{},{},{}];

let versions = [];

$('header').first().children('.headings').first().children('tbody').first().children('tr').first().children('th').each(function(i,th){
    let version = $(this).text().split('\n')[0];
    versions.push(version);
});

console.log('# Comparison of',versions[columnA],versions[columnB]);

$('article').each(function(e){
    headings[0].text = $(this).children('header').first().children('h1').first().children('a').first().text();
    headings[0].output = false;

    let tables = $(this).children('table');
    $(tables).each(function(i,t){
        let link = $(this).children('caption').first().children('h2').first().children('a').first();
        headings[1].text = $(link).text();
        headings[2].output = false;

        $(this).children('tbody').first().children('tr').each(function(i,tr){
            let td = $(this).children('td');
            let tdf = $(td).first();
            if ($(tdf).hasClass('sub')) {
                let link = $(tdf).children('h3').first().children('a').first();
                headings[3].text = $(link).text();
                headings[3].output = false;
            }
            else if ($(tdf).hasClass('subsub')) {
                let link = $(tdf).children('a').first();
                headings[4].text = $(link).text();
                headings[4].output = false;

                let code = $(tdf).children('.info').first().children('.fn').first().children('.code').first().text();

                let tdA = $(td).eq(columnA).children('div').first();
                let tdB = $(td).eq(columnB).children('div').first();

                if (($(tdA).hasClass('Yes')) && ($(tdB).hasClass('Error'))) {
                    
                    for (let h=0;h<headings.length;h++) {
                        let heading = headings[h];
                        if (!heading.output) {
                            console.log('\n'+('#'.repeat(h+2)),heading.text);
                            heading.output = true;
                        }
                    }

                    console.log('\n```js');
                    console.log(code);
                    console.log('```');
                }
            }
        });
    });
});

