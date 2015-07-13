var NLP = require('stanford-corenlp');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');


// Configure and load the NLP resources
var config = {
    "nlpPath":"./corenlp",
    "version":"3.5.2",
    "annotators": ['tokenize', 'ssplit', 'pos', 'lemma', 'ner', 'parse']
};
var coreNLP = new NLP.StanfordNLP(config);
var defaultEntities = ['LOCATION', 'PERSON', 'ORGANIZATION'];



app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/nlp/v1/', function(request, response) {
  //var text = request.param('text');
  var text = request.body.text;
  var options = request.body.options;

  // Process the text, return the response.
  coreNLP.process(text, function (err, result) {
        if (err){
            // If coreNLP throws an error, print it in the console and return it in the response.
            console.log(err);
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.end('Error parsing request:' + err);
        } else {
            // Parse the coreNLP result, extracting entities and tokens. Return the options, tokens and entities as the response.
            parsed = parse(result, options);
            response.json({
                options: options,
                entities: parsed.entities,
                tokens: parsed.tokens
            })
        }
    });

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



// Function to parse the coreNLP response and extract a tokens and entities.
// Returns a JSON object with keys 'entities' and 'tokens'.
// 'entities' is a JSON object where the keys are the types of entities,
// 'tokens' is simply a list of Strings.
// Options:
//      lemmatize (boolean) - if true, return a list of lemmas instead of base terms.
//      stopWordRemoval (boolean) - if true, remove stop words from the token list
//      entityTypes (array of Strings) - Manually specify which entities to extract and return.
//          possible entityTypes: ['TIME', 'LOCATION', 'ORGANIZATION', 'PERSON', 'MONEY', 'PERCENT', 'DATE'],
//          default: ['LOCATION', 'PERSON', 'ORGANIZATION']

function parse(nlpResponse, options){
    // Initialise
    var tokenList = [];
    var entities = {};
    var prevEntity = false;
    var entityBuffer = [];

    // Set the property to save to the token list, either the lemma or the original term.
    // Makes no difference for entities.
    var tokenProp = 'word';
    if (options.lemmatize == true) {
        tokenProp = 'lemma'
    }

    // If no entity types are specified, use defaults.
    if (!options.entityTypes){
        options.entityTypes = defaultEntities;
    }

    // Initialise the entities JSON with the entitiy types above
    for (e in options.entityTypes){
        entities[options.entityTypes[e]] = []
    }

    // Iterate through all terms, build a separate token and entity list, return both as the output of this function.
    // Duplicates are not removed from the token list, however they are removed from the entity list.
    for (s in nlpResponse.document.sentences.sentence){
        // for each sentence
        var sentence = nlpResponse.document.sentences.sentence[s];
        for (t in sentence.tokens.token){
            // for each token
            var token = sentence.tokens.token[t];

            // Append the new token, don't check for duplicates.
            tokenList = tokenList.concat(token[tokenProp]);

            //handle entity list logic
            if ((token.NER != 'O') && (options.entityTypes.indexOf(token.NER) > -1)) {
                    if (token.NER != prevEntity) {
                            // New tag!
                            // Was there a buffer?
                            if (entityBuffer.length>0) {
                                    // There was! We save the entity if it's not present already.
                                if (!(entities[prevEntity].indexOf(entityBuffer.join(' ')) > -1)) {
                                    entities[prevEntity].push(entityBuffer.join(' '));
                                }

                                // Reset the buffer
                                entityBuffer = [];
                            }
                            // Push to the buffer
                            entityBuffer.push(token.word);
                    } else {
                            // Prev entity is same a current one. We push to the buffer.
                            entityBuffer.push(token.word);
                    }
            } else {
                    if (entityBuffer.length>0) {
                            // There was! We save the entity if it's not already present.
                            if (!(entities[prevEntity].indexOf(entityBuffer.join(' ')) > -1)) {
                                entities[prevEntity].push(entityBuffer.join(' '));
                            }

                            // Reset the buffer
                            entityBuffer = [];
                    }
            }
            // Save the current entity type
            prevEntity = token.NER;
        }
    }

    // Return the lists of entities and tokens
    return {'entities': entities, 'tokens': tokenList}
}