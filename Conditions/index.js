const {time:Time,costs:Costs,rate:Rate} = require('../Utils');
const CONDITIONS = require('./conditions');

// Module managing the agent conditions
// todo state machine combining:
//  1) outcomes
//      1.1) of actions and skips of the agent
//      1.2) of interventions from other agents
//  2) agent state
//      2.1) pre-existing conditions
//      2.2) time and age
//  3) environmental factors
//      3.1) social-scale events
//      3.2) personal events (self-caused)
//
// the state machine works with probabilities (rates)
// the causal relation between outcomes, state and events is implemented through a type-based mechanism
// for instance an action has benefit of type: 'behavioral'
// this is used to compute a change of state of a behavioural condition
// conditions have a severity level that can be modified by outcomes (positive or negative)
// conditions have a progression which can be toward resolution or worsening,
// that is applied considering the timescale of the condition, e.g. 'day', 'month'
// conditions can be chronic (never being deleted), temporary (severity can only decrease),
// permanent (severity can only increase)
// the permanence within a low, mild or sever level or the condition
// can result in an increasing risk of new conditions

exports.init = (yearOfBirth,clock) => new Conditions(yearOfBirth,clock);


class Conditions{

    constructor(yearOfBirth,clock){
        this.CONDITIONS = CONDITIONS;
        this.conditions = new Map();
        this.BIRTH = yearOfBirth;
        this.clock = clock;
    }

    get age(){
        return this.clock.age(this.BIRTH);
    }
    get list(){
        return Array.from(this.conditions);
    };
    static get getConditions(){return this.CONDITIONS;}


    // calc of updates of conditions, given a positive and negative outcomes
    // returns new events caused by the negative effect of outcomes
    // returns emerging events from the update
    assess( positive = new Map (), negative = new Map() ){
        let emergingEvents = [];
        // update each condition
        this.conditions.keys().forEach(key => {
            let condition = this.conditions[key];
            let type = condition.type;
            let {scale, rate, weight} = condition.progression;
            // impact of progression
            let updates = [];
            updates.push( Costs.weight(rate, weight, this.age, this.conditions) );
            // impact of Outcomes
            updates.push( this._effects(type, positive, 'positive') );
            updates.push( this._effects(type, negative, 'negative') );
            // update events emerging from the update
            emergingEvents = emergingEvents.concat( this._update(key,updates) );
        });

        // return the emerging events to be used as malus by the agent
        return emergingEvents;
    }

    // retrieve effect of outcomes
    _effects(type, outcomes, effect){
        // check each condition
        if( outcomes.has(condition.type) ){
            let modifier = effect === 'positive' ? -1 : 1;
            return ( modifier * outcomes.get(type) );
        }
        return 0;
    }


    // update conditions with age and pre-existing conditions
    _update(key, updates) {
        let condition = Object.assign({},this.conditions[key]);
        let duration = condition.duration;
        // calc update considering logic of duration
        let update = updates.reduce((partial, num)=>{
            switch (duration) {
                case 'permanent':
                    if (num < 0) {
                        // if not degenerating then discard
                        return partial;
                    }
                case 'temporary':
                   if (num > 0) {
                        // if not is improving then discard
                        return partial;
                    }
                    break;
                default: // chronic
                // update new weight but never deleted;
                    return partial + num;
            }
        },0);

        // check if requires other changes and save
        return this._checkAndSave(key, condition, update);
    }

    //
    _checkAndSave(key, condition, update) {
        let events = [];
        // remove temporary condition if weight <= 0
        if (condition.duration === 'temporary' && condition.weight <= 0) {
            this.conditions.delete(key);
            return events;
        }

        // if weight > 1 update duration
        // temporary > chronic > permanent
        if( (condition.weight + update) > 1 ){
            let delta = condition.weight + update - 1;
            events.push({type:condition.type,weight:delta});
            switch(condition.duration){
                case 'chronic':
                    condition.duration = 'permanent';
                    break;
                case 'temporary':
                    condition.duration = 'chronic';
                default:
                    condition.weight = 1;
            }
        }

        // default, update weight
        condition.weight += update;

        // save new state of condition
        this.conditions.set(key,condition);
        return events;
    }
}



let clock = new Time.Clock(3600);
let c = new Conditions(1920,clock);

console.log('fffffffffffff',c.assess({positive: [], negative:[]}));