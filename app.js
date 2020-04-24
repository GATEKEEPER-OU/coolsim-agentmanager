const Clock = require('./Utils');
const Actions = require('./Actions');
const Conditions = require('./Conditions');
const Events = require('./Events');

// init of the simulation clock
const timeSpeed = 3600; // 1s = 1h

const clock = new Clock(timeSpeed);

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
let events = new Events();



let reminders = actions.remind([]);
let actionOutcomes = actions.outcomes(reminders,[],[])
let emergingEvents = conditions.assess([],[]);
let todayEvents = events.sunrise();



console.log('Conditions.assess',emergingEvents);
console.log('Actions.remind',reminders);
console.log('Actions.outcomes',actionOutcomes );
console.log('Events.sunrise',todayEvents );
