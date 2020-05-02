// monitor module mange and instatiate listners of agent status
// get the list of monitors
// instatiate monitors and provides a list of monitors to apply

import MONITOR from "./monitor.js";
import Utils from "../../Utils/index.js"


export class Monitor {

    constructor(monitor){
        // console.log(monitor);
        if (!monitor || !monitor.test || !monitor.action) {
            throw new Error(`ERROR: miss configured monitor ${monitor.label}`);
        }
        this.test = monitor.test;
        this.rate = monitor.rate ? monitor.rate : 1;
        this.action = monitor.action;
        this.rateTest = Utils.rate.test
    }

    process(state,date){

        // test the rate
        if (!this.rateTest(this.rate)) {
            return false;
        }

        if( !this._test(state,this.test) ) {
            return false
        }

        let p = {};
        if(date){
            p.date = date;
        }

        // act
        switch (this.action.type) {

            case 'message':
                return Object.assign( p,this._createMessage(state,this.action) );

            default:
                return Object.assign(p,state);
        }
    }
    _createMessage(state,{fields,payload}) {
        let value = Utils.extractFromObject(state,fields);
        console.log(state,fields,value);
        let fieldName = fields[fields.length-1];
        let newPayload = Object.assign({message:{}},payload);
        // add field in the message
        if(value && fieldName){
            let f = fields[fields.length-1];
            newPayload.message[f] = value;
        }
        // payload
        return newPayload;
    }
    _test(state,{fields,value,operator}) {
        // test value
        let v = Utils.extractFromObject(state, fields);
        // evaluate expression
        return eval(`v ${operator} value`);
    }
};

// monitor function takes a state and returns a payload {section,message}
function generateMonitor(monitor){
    try {
        return new Monitor(monitor);
    }catch (err){
        console.error(err);
    }
}

const Monitoring = MONITOR.map( monitor => {
    let monitorFunction = generateMonitor(monitor);
    console.log(monitorFunction);
    return monitorFunction;
} );
// each monitor is generated as a function
export default Monitoring;