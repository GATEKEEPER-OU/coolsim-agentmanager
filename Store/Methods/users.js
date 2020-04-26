import {CouchDB} from'../couchdb.js';
const dbUsers = CouchDB.use('users');

// DB methods

// DB METHODS //
export const list = dbUsers.list().then(users=>()=>users,err=>()=>Error(err));
export const counter = async () => {
    let users = await dbUsers.list().then(async users=>{
        console.log(`Found ${users.total_rows} users in the Users DB`);
        return users.total_rows;
        // users = users.total_rows;
    }).catch(err=>console.error(err));
    return users;
};


// USER METHODS //
export const create = (user, cb) => dbUsers.insert(user, user.userName, cb);
export const deleteUser = ({userName,_rev}, cb) => dbUsers.destroy(userName,_rev, cb);

export const update = (user, cb) => {
    user.get(user._id, errors.wrapNano(function (err,currentUser) {
        if(err){
            cb(err);
        } else {
            Object.assign(currentUser, user);
            dbUsers.insert(currentUser, cb);
        }
    }));
};

export const updateDiff = (userDiff, cb) => {
    merge();

    function merge() {
        // get the user from the DB
        dbUsers.get(userDiff._id, (err, user) => {
            if (err) {
                cb(err);
            } else {
                // overriding the user object
                Object.assign(user, userDiff);
                // update the DB
                dbUsers.insert(user, (err) => {
                    // error of collision
                    if (err && err.statusCode === 409 && !userDiff._rev) {
                        merge(); // try again
                    }
                    else {
                        cb.apply(null, arguments);
                    }
                });
            }
        });
    }
};