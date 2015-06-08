var fs = require('fs');
var http = require('http');
var rep = "/home/jerom/Projets/MyScraper/Films/";

var pendingGet = 0;
var loading = false;
var films = {};
var options = {
  host: 'www.allocine.fr',
  path: ''
};

myTitleCallback = function(filename) {
    return function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('error', function(err){
      console.log("Error Occurred: "+err.message);
    });
    response.on('end', function () {
      // Poster
      iImg = str.indexOf('image_src');
      img = str.substring(iImg+17, str.indexOf('>', iImg)-3);      
      var file = fs.createWriteStream('./public/poster/'+filename+img.substring(img.length-4));
      var request = http.get(img, function(response) {
        response.pipe(file);
      });
      // Titre
      iTitle = str.indexOf('<h1>');
      title = str.substring(iTitle+4, str.indexOf('</h1>', iTitle));
      
      console.log(filename + " : " + img + " : " + title+" : "+img.substring(img.length-4));
      films[filename]={"titre":title, 
			           "img":'poster/'+filename+img.substring(img.length-4)};
      // FIN
      pendingGet--;
    	if (pendingGet == 0) {
    		storeFilms();
    	}
    });
  }
}

mySearchTitleCallback = function(filename) {
    return function(response) {
    var str = '';
    response.on('error', function(err){
      console.log("Error Occurred: "+err.message);
    });
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
	 var iH1 = str.indexOf("<h1>");
	 var iUrl = str.indexOf("a href='/film/", iH1);
	 url = str.substring(iUrl+8, str.indexOf('>', iUrl)-1);
	 console.log(filename + " : " + url);
   if (url.indexOf('/film')=== 0) {
	   http.request({host: 'www.allocine.fr', path: url}, myTitleCallback(filename)).end();
    } else {
      pendingGet--;
    }
    });
  }
}

fs.readdir(rep, function (err, files) {
  if (err) throw err;
   files.forEach( function (file) {
     fs.lstat('/'+file, function(err, stats) {
       if (!err && stats.isDirectory()) {
        console.log("--> "+file);
       }
       else{        
        options.path = '/recherche/?q='+file.replace(/(\s+)?.?.?.?.$/, '').replace(/[^a-z0-9()\s]/gi, ' ').replace(/ /g,'+');
        console.log(options.path);
        http.request(options, mySearchTitleCallback(file)).end();
	       loading = true;
	       pendingGet++;
      }
     });
   });
});

storeFilms = function() {
	var listeFilms = [];
  for (var film in films) {
    listeFilms.push({
      "titre": films[film].titre,
      "filename": film,
      "img": films[film].img
    });
  }
    console.log(JSON.stringify(listeFilms));
    //var file = fs.createWriteStream('./ejfilmstest.json');

}
