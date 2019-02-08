var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var html = fs.readFileSync('./public/downloadable-views/test.html', 'utf8');
const path = require('path');

var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    "base": "file:///" + path.resolve('./public') + "/"
};

var users = [
    {
        name: 'aaa',
        age: 24,
        dob: '1/1/1991'
    },
    {
        name: 'bbb',
        age: 25,
        dob: '1/1/1995'
    },
    {
        name: 'ccc',
        age: 24,
        dob: '1/1/1994'
    }
];

var admins = [
    {
        name: 'ddd',
        age: 24,
        dob: '1/1/1991'
    },
    {
        name: 'eee',
        age: 25,
        dob: '1/1/1995'
    }
];

var document = {
    type: 'file',     // 'file' or 'buffer'
    template: html,
    context: {
        // users: users,
        // admins: admins
        invoice: 'LN-ABC-12',
        lead: {
            name: 'Pravallika',
            gst: 'SHuihd12hj'
        }
    },
    path: "./output.pdf"    // it is not required if type is buffer
};

pdf.create(document, options)
    .then(res => {
        console.log(res);
    })
    .catch(error => {
        console.error(error);
    });