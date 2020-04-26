import {time as Time} from './Utils/index.js';
// const Actions = require('./Actions');
import {Actions} from './Actions/index.js';
import {Conditions} from './Conditions/index.js';
import {Events} from './Events/index.js';
import {Agent} from './Agents/index.js';

// init of the simulation clock
const timeSpeed = 3600; // 1s = 1h

const clock = new Time.Clock(timeSpeed);

//
// setInterval(()=>{
//     console.log(`${clock.phase} - ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
//     },1000);
//
// let sleepTime = 5;
// console.log(`taking a nap of ${sleepTime} hours, now are ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
// setTimeout(()=>{
//     console.log(`waking up now at ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
// }, clock.milliseconds(sleepTime, 'hours',[0.2,-0.2]));
//
//

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





// todo test agent
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
        await day();
    }
}


async function day() {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve( agent.dailyRoutine(events.today()) );
        },1050);
    });

}
