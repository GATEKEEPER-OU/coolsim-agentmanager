import {CouchDB as couch} from "../couchdb.js";

import util from 'util';
import allSettled from 'promise.allsettled';

const databases = ['simulations','planners','users','events','messages'];

const destroy  = util.promisify(couch.db.destroy);
const create  = util.promisify(couch.db.create);

exports.init = async () => initDBs()
    .then(results => {
        // console.log(results);
        return results.forEach(result=>{
            if(result.status === 'fulfilled'){
                console.log(`${result.value.message}`);
            } else {
                console.error(`${result.reason.error.message}`);
                throw Error(result.reason.error.message);
            }
        })
    });

exports.reset = resetDatabase;
exports.dbs = databases;




// #ZONE internal functions //
async function initDBs() {
    return allSettled( databases.map((db)=>resetDatabase(db)) );
}

async function resetDatabase(db) {
    let destroy = await destroyDatabase(db);
    let create = await createDatabase(db);
    return Promise.all([destroy,create])
        .then(results => {
            // console.log(results);
            return results.reduce( (result,partial)=> {
                return partial.status !== 'ok' ? partial : result;
            },{status:'ok',
                message:`Reset db ${db} OK`,
                statusCode: 200});
        }).catch(err=>Promise.reject(err));
}

async function destroyDatabase(db) {
    return destroy(db)
        .then(_=>{
            // console.log(`Deleted db ${db}`);
            return Promise.resolve({
                status:'ok',
                message:`Deleted db ${db}`,
                statusCode: 200
            });
        })
        .catch((err) => {
            if (err && err.statusCode == 404) {
                // console.log('nothing to delete');
                return Promise.resolve({
                    status:'ok',
                    message:`Deleted db ${db}`,
                    statusCode: 200
                });
            } else {
                return Promise.reject({
                    error: err,
                    message: `Error deleting db ${db}`,
                    statusCode: 400,
                    status: 'error'
                });
            }
        });
}

async function createDatabase(db) {
    return create(db)
        .then(_=>{
            // console.log(`Created db ${db}`);
            return Promise.resolve({
                status:'ok',
                message:`Created db ${db}`,
                statusCode:200
            });
        })
        .catch(err => {
            if (err && err.statusCode == 412) {
                // console.log('nothing to create');
            } else {
                console.error('create error', err);
                return Promise.reject({
                    error: err,
                    message: `Error creating db ${db}`,
                    statusCode: 400,
                    status: 'error'
                });
            }
        });
}
// #ENDZONE