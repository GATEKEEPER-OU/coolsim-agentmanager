const Actions = require('./Actions/');
const Conditions = require('./Conditions/');

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

    constructor(clock, yearOfBirth){
        this.clock = clock;
        // if no year give, it is a new born
        if(!yearOfBirth){
            this.yearOfBirth = clock.now().get('year');
        }
        this.conditionsSet = new Set();
    }
    get age(){return this.clock.age(this.yearOfBirth)}
    get conditions(){return this.conditions; }

    //
    dailyRoutine(events){
        // todo evaluate impact of events

        // todo get reminders of daily activities

        // todo decide what to do
        // todo decide what to skip
        // todo evaluate outcomes

        // todo return the logs the day
    }



};
module.exports =  Agent;

// todo test
const {clock: Clock} = require('../Utils');
let clock = new Clock(3600);
let agent = new Agent(2015,clock);


console.log(`Agent's age: ${agent.age}`);


