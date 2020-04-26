// const async = require('async');
import axios from 'axios';
import turf from '@turf/random';
import * as dbUsers from '../Methods/users.js';


const randomGenerator = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000
});



// southWest:[latitude, longitude], northEast:[latitude, longitude]
const bbox = [-0.7138101195,52.0217227662,-0.7044157712,52.0275801162];

const roles = [
    {label:'gp',rate:0.0001},
    {label:'nurse',rate:0.005,min:3},
    {label:'social_worker',rate:0.001,min:1},
    {label:'community_worker',rate:0.01,min:1},
    {label:'ward',rate:0.1},
    {label:'neighbour',type:'default'}
];
const rolesMap = roles.reduce((partial, role, index)=>{
        // rolesMap
        // discount: number of min that must be discount to recover the distribution
        // rate is cumulative, and closes with 1 for default
        // rate is used with a random number between 0 and 1
        partial.map
            .set(role.label,Object
                .assign({},role,{
                    counter:0,
                    discount: role.min ? role.min : 0,
                    // sum rates or return 1 for the default
                    rate: role.type === 'default' ? 1 : (partial.rate+=role.rate)
                }));
        // console.log(rMap);
        return partial;
    },
    {map:new Map(),rate:0}).map;
// console.log(rolesMap);
// ratesMap Map({rate: label},...)
const ratesMap = roles.reduce ( (partial, role) => {
    let roleMap = rolesMap.get(role.label);
    let rate = roleMap.rate;
    return partial.set(rate,role.label);
}, new Map());
// console.log(rolesMap);

const skills = [
    {label:'first_aid', rate:0.1, roles: new Set(['gp','nurse','ward']) },
    {label:'counseling', rate:0.05, roles: new Set(['social_worker','community_worker']) },
    {label:'driving', rate:0.3},
    {label:'fitness', rate:0.05},
    {label:'nutrition', rate:0.05, roles: new Set(['gp','nurse','social_worker']) },
    {label:'cleaning', rate:0.3},
    {label:'running_errands', rate:0.95},
    {label:'calling', rate:0.95, roles: new Set(['gp','nurse','ward','social_worker','community_worker']) },
    {label:'cooking', rate:0.3},
];






exports.init = async (usersCounter = 0) => {
    let existingUsers = await dbUsers.counter();
    // console.log(`found ${existingUsers} users ==================`);
    const delta = usersCounter - existingUsers;
    console.log(`To be generated ${delta > 0 ? delta : 0} users`);
    return new Promise( async (resolve) => {
        if( delta <= 0){
            console.log(`Requested ${usersCounter} users already available`);
            resolve('Users already available');
        } else {
            return generate(delta);
        }
    });
};



// generate # random users
async function generate(totalUsers){
    const roleGenerator = getRole();
    const locationGenerator = getLocation(bbox);
    const userGenerator = getUser();
    const skillsGenerator = getSkills(skills);

    // console.log(`Done initializing generators`);

    if(userGenerator.next){
        console.log(`Start generating users...`);

        for( let i = 0; i < totalUsers; i++ ){
            let role = roleGenerator.next().value;
            let location = locationGenerator.next().value;

            // get skills
            // if !skills patch the first yield of the generator
            // which does not return skills but is needed to get the first role as parameter
            let skills = skillsGenerator.next(role).value;
            if(!skills){
                skills = skillsGenerator.next(role).value;
            }

            let user = await userGenerator.next();
            // check if there is at least a person in the generated list
            // get the first one of the list
            if(user.value && user.value.length > 0){
                user = user.value[0];
            }else{
                return Promise.reject('Not possible to generate users');
            }

            // console.log(role,location,user);
            // console.log('------------------');
            // console.log('------------------');
            // console.log('------------------');

            // extend user object with the new role, location within the given bbox and skills
            Object.assign(user,{role});
            Object.assign(user.location,{...location});
            Object.assign(user,{skills});

            // console.log(user);

            await dbUsers.create(user,(err)=>{
                if(err){
                    return Promise.reject(err);
                }
            });
            if (process.stdout.clearLine) { process.stdout.clearLine(); }
            console.log(`Generated users: ${i + 1} of ${totalUsers}`);
        }
    }else{
        return Promise.reject('Not possible to generate users');
    }
}



// #ZONE GENERATORS

// generate random user
async function* getUser(num = 1) {
    const params = `/api?nat=gb&results=${num}`;
    while(true){
        let users = await randomGenerator.get(params).then(({status,statusText,data})=>{
            // console.log(`Status: ${statusText}`);
            // console.log(`Number of new users received:`,data.info.results);

            if(status != 200){
                return new Error(`Couldn't get users :(`);
            }

            if(data.info.results >= num){
                return data.results;
            }
            return new Error(`Couldn't get users :(`);
        }).catch((err)=>{
            return err;
        });
        // console.log(`Got users ${users.length}`);
        yield users;
    }
}

// generator role
function* getRole() {
    // init
    let indexRole = 0;
    // generate mins
    while(indexRole < roles.length){
        let role = roles[indexRole];
        let roleMap = rolesMap.get(role.label);
        // does not have a min
        if(!role.min){
            indexRole++;
        } else if(rolesMap.counter >= role.min){
            // the min is fulfilled
            indexRole++;
        } else {
            // increment counter and yield role
            roleMap.counter++;
            yield role.label;
        }
    }
    // generate the rest of the roles
    // extract a default role
    const defaultRole = roles.reduce((defaultRole,role)=>{
        if(defaultRole){return defaultRole;}
        if(!role.type){return defaultRole;}
        return role.label;
    },null);
    const rates = ratesMap.keys();
    // console.log('default role ',defaultRole);
    while(true){
        // generate a rate (between 0 and 1)
        let rolerate = Math.random();
        // if new rate is higher than the previous && lower than the math.random
        // then new rate is the new candidate
        let keyrate = rates.reduce((r,v) => {
            return r < v && v <= rolerate ? v : r;
        }, 0);
        // get label of the role
        let role = rolesMap.get(keyrate);
        // lower discount
        rolesMap.get(role).discount--;
        // send new role
        yield role;
    }
}

// generate random location
function* getLocation (bbox) {
    while(true){
        // return [longitude,latitude]
        let position = turf.randomPosition(bbox);
        yield {coordinates: {longitude:position[0].toString(),latitude:position[1].toString()} };
    }
}

// generate skills
function* getSkills() {
    const skillsMap = skills.reduce((partial,skill)=>{
        return partial.set(skill.label,{rate:skill.rate,counter:0});
    },new Map());
    let role = yield;
    // console.log('first yield',role);
    while(true){
        let userSkills = skills.reduce((partial,skill)=>{
            // console.log('--------',skill);
            let rate = Math.random();
            let map = skillsMap.get(skill.label);
            if(rate <= map.rate || (skill.roles && skill.roles.has(role)) ){
                map.rate ++;
                return partial.concat(skill.label);
            }
            return partial;
        },[]);
        role = yield userSkills;
    }
}

// #ENDZONE GENERATORS