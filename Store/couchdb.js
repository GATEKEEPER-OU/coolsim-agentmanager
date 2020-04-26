// setup databases
import nano from 'nano';

nano(process.env.COUCHDB_URL || 'http://127.0.0.1:5984');

export const CouchDB = nano;