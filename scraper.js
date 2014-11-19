var request = require('request'),
	fs = require('fs'),
 	Q = require('q'),
 	async = require('async'),
	MongoClient = require('mongodb').MongoClient,
	url = 'mongodb://localhost:27017/avtoizpit',
	savedQuestionsIds = [],
	collection;

function fetchPicture(item, done) {
	var deferred = Q.defer();
		format = "png",
		uri = "https://avtoizpit.com/GetPicture?pictureOId=" + item.pictureOId + "&width=200&height=180&format=" + format;

	if (item.pictureOId >= 0) {
		item.hasPicture = true;
		item.format = "png";
		request(uri).pipe(fs.createWriteStream("./pictures/" + item.pictureOId + "." + format)).on('close', function () {
			done();
		});
	} else {
		done();
	}
}

function downloadImages(questions) {
	var deferred = Q.defer(),
		imageCounter = 0;

	async.eachSeries(questions, function (question, done) {
		var pictureItems = [question].concat(question.answers);

		async.eachSeries(pictureItems, fetchPicture, function (err) {
			if (err) {
				console.error(err);
			} else {
				done();
			}
		});
	}, function (err) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(imageCounter);
		}
	});

	return deferred.promise;
}

function getExam() {
	request.post('https://avtoizpit.com/GetTestSet?categoryId=1&subCategoryId=3&language=bg', function (err, httpResponse, body) {
		var questions = JSON.parse(body).testSet.questions;
		
		questions = questions.map(function (question) {
			question._id = question.id;
			question.answers = question.answers.map(function (answer) {
				answer.md = 12 / (question.answers.length);
				answer.pictureOId = question.pictureOId < 0 ? answer.pictureOId : -1;
				return answer;
			});
			return question;
		}).filter(function (question) {
			return savedQuestionsIds.indexOf(question._id) < 0;
		});

		savedQuestionsIds = savedQuestionsIds.concat(questions.map(function (question) { return question._id } ));

		console.log('Scraped ' + questions.length + ' questions');

		if (questions.length > 0) {
			downloadImages(questions).then(function (count) {
				console.log('Downloaded ' + count + ' images');

				collection.insert(questions, {
					continueOnError: true,
					safe: true
				}, function (err, result) {
					if (err) {
						console.error(err);
					}

					console.log('Saved ' + result.length + ' questions to database');
					getExam();
				});
			});
		} else {
			getExam();
		}
	});
}

MongoClient.connect(url, function (err, db) {
	console.log('Connected to database');
	collection = db.collection('questions');

	collection.find().toArray(function (err, result) {
		savedQuestionsIds = result.map(function (question) {
			return question._id;
		});
		
		getExam();
	});
});

