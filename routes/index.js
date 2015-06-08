var express = require('express');
var router = express.Router();
var fs = require('fs');
var films = require('../ejfilms.json');

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(films);
	res.render('index', { title: 'E&J Films', films: films.films });
});

module.exports = router;
