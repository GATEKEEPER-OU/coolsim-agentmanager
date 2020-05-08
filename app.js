// App.js
// todo some description

import Utils from '../Utils/index.js';
import Actions from './Actions/index.js';
import Conditions from './Conditions/index.js';
import Events from '../Locations/Events/index.js';
import Agent from './Agents/index.js';
import Store from "../Store/index.js";


const Time = Utils.time;

// init of the simulation clock
const timeSpeed = 3600; // 1s = 1h

const clock = new Time.Clock(timeSpeed);
const store = new Store("simulation");

// tests actions
let actions = new Actions(1984,clock);
let conditions = new Conditions(1984,clock);
let events = new Events(clock);



// let reminders = actions.remind([]);
// let actionOutcomes = actions.outcomes(reminders,[],[])
// let emergingEvents = conditions.assess([],[]);
//
//
//
// console.log('Conditions.assess',emergingEvents);
// console.log('Actions.remind',reminders);
// console.log('Actions.outcomes',actionOutcomes );


//  test agent
let agentInit = {age:55};
let agent = new Agent(agentInit);


// console.log(`Agent:`,agent);
// console.log(`Now:`,clock.now.get('year'));
console.log(`Agent's age: ${agent.age}`);
console.log(`Agent's role: ${agent.role.label}`);
console.log(`Agent's skills: ${agent.skills.map(e=>e.label)}`);
// console.log(`Agent's conditions:`, agent.conditions);

simulation(10);

async function simulation(days) {

    for(let i = 0; i < days; i++){
        console.log(`Day ${i+1}`);
        await day();
        await logging();
    }
}


async function day() {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve( agent.dailyRoutine(events.today()) );
        },1050);
    });

}

async function logging() {
    return new Promise((resolve,reject)=> {
        store.readBySection("agents").then(res => {
            // console.log("Simulation logs", res.docs.length);
            resolve(res);
        }).catch(err => reject(err));
    });
}