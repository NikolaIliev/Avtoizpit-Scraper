var express = require('express'),
	MongoClient = require('mongodb').MongoClient,
	url = 'mongodb://localhost:27017/avtoizpit',
	app = express(),
	resultLength = 100,
	collection;

app.all("*", function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", ["X-Requested-With", "Content-Type", "Access-Control-Allow-Methods"]);
	res.header("Access-Control-Allow-Methods", ["GET"]);
	next();
});

app.get('/questions', function (req, res) {
	collection.find().toArray(function (err, result) {
		if (err) {
			console.error(err);
		} else {
			console.log(req.param("count"));
			res.json(result.splice(0, req.param("count"))).end();
		}
	})
});

MongoClient.connect(url, function (err, db) {
	if (err) {
		console.error(err);
	} else {
		collection = db.collection('questions');
		app.listen(3010);
		console.log('Listening on port 3010');
	}
});