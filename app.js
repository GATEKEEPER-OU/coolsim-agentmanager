const Clock = require('./Clock');



// init of the simulation clock
const timeSpeed = 3600; // 1s = 1h

const clock = Clock.init(timeSpeed);

//
// setInterval(()=>{
//     console.log(`${clock.phase} - ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
//     },1000);

let sleepTime = 5;
console.log(`taking a nap of ${sleepTime} hours, now are ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
setTimeout(()=>{
    console.log(`waking up now at ${clock.now.format("dddd, MMMM Do YYYY, H:mm:ss")}`);
}, clock.milliseconds(sleepTime, 'hours',[0.2,-0.2]));





// todo binding between movements and phases of the day

// todo binding between events and phases of the day

//