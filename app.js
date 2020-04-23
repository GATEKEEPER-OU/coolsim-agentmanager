const Clock = require('./Utils');
const Actions = require('./Actions');


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

// todo tests
let actions = Actions.init(1984,clock);


console.log(actions.list);
console.log(actions.age);

let reminders = actions.remind([]);

// console.log(reminders);

console.log(actions.outcomes(reminders,[],[]) );



// todo binding between movements and phases of the day

// todo binding between events and phases of the day

//