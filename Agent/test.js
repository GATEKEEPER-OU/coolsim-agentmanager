import Agent from "./index.js";


let a = new Agent({simulation:"123"});
let b = new Agent({simulation:"123"});

a.dailyRoutine();
b.dailyRoutine();


console.log("agent",a.getDescription);
