const Actions = require('../Actions/');
const Conditions = require('../Conditions/');

// todo init agents from users, registers agents in users status

// todo each agent is initialised with:
// todo 1) the community clock
// todo 2) condition generator
// todo 3) status generator
// todo 4) event generator
// todo 5) action generator

// todo agent has internal phases defined bu

// todo agents are setTimeout functions working on the community clock

// todo state machine active, self-sufficient, dependent, death
// list of actions he can perform
// preferences
// in training
// use emerging events as a malus for the next round of actions


// going out of the area > bring modifiers

// the delta of outcomes > create new conditions? or trigger emergency?

// pipeline of interventions to be done, eventually the next day?

// degree of relations between agents


class Agent{

    constructor(yearOfBirth,clock,priorConditions = []){
        this.clock = clock;
        // if no year give, it is a new born
        if(!yearOfBirth || isNaN(yearOfBirth) ){
            this.yearOfBirth = clock.now.get('year');
        }else{
            this.yearOfBirth = yearOfBirth
        }

        // init helpers
        this.actionsHelper = new Actions(this.yearOfBirth,this.clock);
        this.conditionsHelper = new Conditions(this.yearOfBirth,this.clock,priorConditions);
    }
    get age(){
        return this.clock.age(this.yearOfBirth);
    }
    // returns an array with the current conditions of the agent
    get conditions(){
        return Array.from(this.conditionsHelper.status);
    }

    //
    dailyRoutine(events = []){
        // todo evaluate impact of events

        // todo get reminders of daily activities
        let dailies = this.actionsHelper.remind(this.conditions);
        // todo decide what to do
        // todo decide what to skip
        let choices = {actions:[], skips:[]};


        // IMPORTANT TODO it can be done in bulk or cycle (for the sake of logs)
        // evaluate outcomes of actions
        let {positive,negative,time} = this.actionsHelper.outcomes(choices.actions,choices.skips,this.conditionsHelper.list);


        // IMPORTANT TODO AS BULK //
        // translate outcomes to conditions
        let issues = this.conditionsHelper.assess(positive,negative);

        // todo logs the day
        let day = {
            activities: {
                actions: choices.actions,
                skips: choices.skips,
                time,
                outcomes:{positive,negative}
            },
            state:{
                conditions: this.conditions,
                issues
            }
        };
        this._log(day);
        return day;
    }





    // todo log service
    _log(entry){
        console.log(entry);
    }
    _
};
module.exports =  Agent;

// todo test
const {time} = require('../Utils');
let clock = new time.Clock(3600);
let agent = new Agent(2000,clock);


// console.log(`Agent:`,agent);
// console.log(`Now:`,clock.now.get('year'));
console.log(`Agent's age: ${agent.age}`);
// console.log(`Agent's conditions:`, agent.conditions);
agent.dailyRoutine();


