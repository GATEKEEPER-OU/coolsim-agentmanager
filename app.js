// App.js
// todo some description

import Utils from '../Utils/index.js';
import Events from '../Locations/Events/index.js';
import Agent from './Agents/index.js';
import Store from "../Store/index.js";


const Time = Utils.time;

// init of the simulation clock
const timeSpeed = "day"; // 1s = 1day

const clock = new Time.Clock(timeSpeed);
const store = new Store("simulation");

// tests actions
let events = new Events(clock);


//  test agent
let agentInit = {age:35};
let agent = new Agent(agentInit);


// console.log(`Agent:`,agent);
// console.log(`Now:`,clock.now.get('year'));
console.log(`Agent's age: ${agent.age}`);
console.log(`Agent's role: ${agent.role.label}`);
console.log(`Agent's skills: ${agent.skills.map(e=>e.label)}`);
// console.log(`Agent's conditions:`, agent.conditions);

simulation(10);

async function simulation(days) {
    console.time("Simulation time");
    for(let i = 0; i < days; i++){
        console.log(`Day ${i+1}`);
        await day();
        await logging();
    }
    console.timeEnd("Simulation time");
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