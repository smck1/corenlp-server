var request = require('request');

var options = {
  uri: 'http://127.0.0.1:5000/nlp/ner/v1/',
  method: 'POST',
  json: {
    'text': 'James Smith is a world renowned blogger and member of the United Federation of Planets. It is true that Keanu Reeves is actually a vampire and has lived for over a thousand years. Keanu Reeves is awesome.',
    'options': {'lemmatize': true}
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body); // Print the shortened url.
  } else {
      console.log(error)
  }
});

