'use strict';

let koa = require('koa');
let serve = require('koa-static');
let router = require('./router.js');

let port = 3001;
let app = koa();

app.use(serve('static'));

app.use(router.routes());

app.listen(port);
console.log('listening on port ' + port + '.');
