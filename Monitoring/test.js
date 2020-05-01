import Monitoring from "./index.js";


//test
// console.log(test({label:{pippo:1}},{fields:["label","pippo"],value:0,operator:"!=="}));
// console.log(createMessage({label:{pippo:1}},{fields:["label","pippo"],payload:{greetings:"hello"} }));
let m = Monitoring[0];
// console.log(m);
console.log(m.process({address:"agent-123",status:{label:"dependent"}}));