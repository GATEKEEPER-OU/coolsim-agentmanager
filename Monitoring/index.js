// monitor module mange and instatiate listners of agent status
// todo get the list of monitors
// instatiate monitors and provides a list of monitors to apply

import MONITOR from "./monitor.js";
import Utils from "../../Utils/index.js"


// monitor function takes a state and returns a payload {section,message}
function generateMonitor(monitor){
    return (state)=> {
        if (!monitor || !monitor.test || !Array.isArray(monitor.test)) {
            throw new Error(`ERROR: miss configured monitor ${monitor.label}`);
        }


        // test the rate
        if (!Utils.rate.test(monitor.rate)) {
            return false;
        }

        if( !test(state,monitor.test) ) {
            return false
        }


        // act
        switch (monitor.action.type) {
            case 'message':
            default:
                return createMessage(monitor.action);
        }
    }
}

function test(state,{fields,value,operator}) {
    // test value
    let v = Utils.extractFromObject(state, fields);
    // evaluate expression
    return eval(`v ${operator} value`);
}

function createMessage({fields,payload}) {
    let value = Utils.extractFromObject(state,fields);
    let fieldName = fields[fields.length-1];
    let payload = Object.assign({},payload);
    // add field in the message
    if(value && fieldName){
        payload.message[fields.length-1] = value;
    }
    // payload
    return payload;
}

// each monitor is generated as a function
export default Monitoring = MONITOR.map( monitor => generateMonitor(monitor) );