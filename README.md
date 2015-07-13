# CoreNLP-Server

A node.js webserver for the CoreNLP pipeline. Currently only returns parsed entities and tokens.


# Run

To run just start server.js (node server.js / js server.js)

## Requests
Post to server:5000/nlp/ner/v1/.

If successful, a JSON response is given with *options* specifying which options were used to process the text as well as
*entities*, a JSON object where keys are the entity type and values are the enitity names, and *tokens*, a list of terms.

### Params

*text* - The text to be processed
*options* - The options configuration current parameters are:
    *lemmatize* true/false, if true, returns lemmas instead of the base words.
    *stopWordRemoval* true/false, not yet implemented, but will remove stop words from the token list before returning.
    *entityTypes* list of Strings, manually specify the entity types to return (see stanford NER for entity types.)


## Requirements

Requires Stanford's coreNLP (http://nlp.stanford.edu/software/corenlp.shtml) software.
Make sure to update the path to CoreNLP and the version number in server.js



