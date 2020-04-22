const listOfActions = require('./actions');
const Clock = require('../Clock');


exports.init = (yearOfBirth,clock)=>{
    return new Actions(yearOfBirth,clock);
};

// actions have a cost and risk factor related to the agent's state
// agents get the daily list and choose which actions to carry on and which not
// class Actions.remind() returns a list of suggested actions of the day
// class Actions.outcomes() returns the outcome of performed and skipped actions

class Actions {
    DAY = 24;

    constructor (yearOfBirth,clock){
        this.clock = clock;
        this.BIRTH = yearOfBirth;
        this.ACTIONS = listOfActions.get();
    }
    get age(){
        return this.clock.age(this.BIRTH);
    }
    get list(){
        return this.ACTIONS;
    };


    // calc list of suggested actions of the day
    remind(conditions){
        return this.list.reduce((partial,action)=>{
            // check if it falls in the list
            // modifier 1 add rate, -1 remove rate
            let modifier = 0;
            switch(action.type){
                case 'physical':
                    modifier = 1;
                    break;
                case 'self':
                    modifier = 0;
                    break;
                case 'socialization':
                    modifier = -1;
                    break;
                case 'culture':
                    modifier = -1;
                    break;
                case 'health':
                    modifier = 1;
                    break;
                default: // basic
                    modifier = 1;
            }
            if(!this._checkRate(action.rate,conditions,modifier)){
                return partial;
            }
            // add the action to the list
            partial.add(Object.assign({},action));
            return partial;
        },new Set());
    }

    // calc of outcomes
    outcomes(acts = [],skips = [], conditions = []){
        if( acts instanceof Set){
            acts = Array.from(acts);
        } else if( acts instanceof Map ){
            acts = Array.from(acts)
        }
        if( skips instanceof Set){
            skips = Array.from(skips);
        } else if( acts instanceof Map ){
            skips = Array.from(skips)
        }


        // evaluate acts
        let {furtherSkips,positive, time} = this._acting(acts, conditions);
        // evaluate skips
        let {negative} = this._skipping(skips.concat(furtherSkips), conditions);
        // return outcome and time spent
        return {positive,negative,time};
    }

    // internal methods
    _acting(acts, conditions ){
        // calc outcomes and further skips based on the calc of durations and benefits
        let results = acts.reduce((partial, action)=>{
                // check if there is still time to act
                let duration = this._duration(action,conditions);
                if(partial.time + duration > this.DAY){
                    // no time to carry out this action
                    return partial.furtherSkips.push(action);
                }
                // update spent time
                partial.time += duration;
                // calc of benefits
                let outcomes = this._outcomes(action.benefit,'benefits', conditions);
                // update outcomes
                // for each type of benefit
                for(let outcome in outcomes){
                    // benefit value
                    let value = outcomes[outcome];
                    // if there is already a key in the map
                    if(partial.positive.has(outcome) ){
                        // add prior value to the current one
                        value += partial.positive.get(outcome);
                    }
                    // update value of the type of outcome
                    partial.positive.set(outcome,value);
                }
                return partial;
            },
            {
                positive:new Map(),
                furtherSkips:[],
                time:0
            } );
        // returns positive outcomes and actions that had been skipped
        return results;
    }

    // evaluate outcomes of skipped actions
    _skipping(skips, conditions){
        // calc the risks related to the skips (action not performed)
        let outcomes = skips.reduce((partial,skip)=>{
                // calc of new risks
                let actionOutcomes = this._outcomes(skip.risk, 'risk', conditions);
                // update outcomes
                // for each type of benefit
                for(let outcome in actionOutcomes){
                    // benefit value
                    let value = actionOutcomes[outcome];
                    // if there is already a key in the map
                    if(partial.has(outcome) ){
                        // add prior value to the current one
                        value += partial.get(outcome);
                    }
                    // update value of the type of outcome
                    partial.set(outcome,value);
                }
                return partial;
            },new Map());
        // returns negative outcomes
        return {negative:outcomes};
    }

    // calculate duration
    _duration({duration:{hours,errors}},conditions){
        let duration = hours;
        let error = errors[Math.floor(Math.random()*errors.length)];
        // increase the error considering age and conditions (always slower, thus error is abs)
        error += (Math.abs(error) * (this._ageingCost() + this._conditionsCost(conditions)) );
        return duration + error ;
    }

    // calculate rate of an outcome
    _outcomes({rate,weight,type},decision,conditions){
        // calc the outcomes
        let cost = this._contingencyCost(conditions);

        // default no outcomes
        let outcome = {};
        outcome[type] = 0;

        let modifier = 1;

        // if benefits then conditions and age lower the benefit and reduce the rate
        if(decision === 'benefit'){
            // make it a negative value to subtract to benefits
            modifier = -1;
        }
        // if over the rate, then no outcome
        if(!this._checkRate(rate, conditions, modifier) ){
            return outcome;
        }
        // else, update weight of outcome
        outcome[type] = weight + (cost * weight * modifier);
        console.log(outcome,type,weight,cost,modifier);
        // return outcome {type:weight}
        return outcome;
    }


    // support functions
    // logic of ageing and conditions
    // rate (eg. 0.1, {age,conditions} features of user state and arrays
    // modifier: 1, -1 or 0 change the logic of adding or removing contingency cost from rate
    _checkRate(rate,conditions,modifier = 1){
        if(isNaN(modifier)){modifier = 1;}
        if(isNaN(rate)){return false;}
        // calc rate
        if( Math.random() > (rate + (this._contingencyCost(this.age,conditions) * rate * modifier) ) ){
            return false;
        }
        return true;
    }
    _contingencyCost(conditions = 0) {
        return this._ageingCost(this.age) + this._conditionsCost(conditions);
    }

    _ageingCost(){
        // todo improve with a non-linear function
        const threshold = 50;
        // if age > threshold then 1% each year above the threshold
        return (this.age - threshold) > 0 ? (this.age - threshold)/100 : 0;
    }
    _conditionsCost(conditions){
        let num = 0;
        // managing different types set, array, maps
        if(Array.isArray(conditions)){
            num += conditions.length;
        } else if(conditions instanceof Set){
            num += conditions.size;
        } else if(conditions instanceof Map){
            num += conditions.size;
        } else if(!isNaN(conditions)){
            num += parseFloat(conditions);
        }
        // todo improve with a non-linear function
        // 1% each condition
        return num/100;
    }
}