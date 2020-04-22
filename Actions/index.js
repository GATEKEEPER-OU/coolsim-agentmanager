// todo returns a class including a generator of suggested actions

// todo provided actions are related to the phase of the day
// todo actions include a suggested time for execution
// todo actions include a set of implications concerning performing or not the action



// todo list of actions
// type: ['physical','self','basic','socialization','culture','health']
// rate to be selected in the daily list,
// e.g rate = 1 daily mandatory activity, such as sleeping
//      rate = 0.7 (5/7) workday activity such as working
//      rate = 0.14 weekly activity, such as grocery or house keeping
//      rate = 0.07 biweekly activity, such as participate to a community meeting
//      rate = 0.03 monthly activity, such as GP visit
// risk: representing the risk of not acting as cause of a new condition, {rate, weight, type}
//       rate: probability of triggering a worsening
//       weight: value to add to the severity or permanence of a condition
//       type: category of risk
// benefit: representing the benefit of acting as cause of removing an existing condition, {rate, weight, type}
//       rate: probability of triggering an improvement
//       weight: value to remove to the severity or permanence of a condition
//       type: category of benefit
// duration:  duration in hours and errors (array of rates representing how much the duration can deviate [0.1,-0.1])



exports.actions = ()=>{
    return new Actions();
};
exports.acting = ()=>{
    return new Acting();
};


// todo generator of the list of suggested actions
// actions have a cost and risk factor related to the agent's state
// agents get the daily list and choose which actions to carry on and which not
class Actions {
    DAY = 24;
    ACTIONS = {
        //todo https://ec.europa.eu/eip/ageing/sites/eipaha/files/results_attachments/city4age_d2.06_riskmodel_v2.0.pdf
    };
    _checkRate = checkRate;
    _contingencyCost = contingencyCost;
    constructor (){

    }
    // calc list of suggested actions of the day
    static remind({age,conditions}){
        let list = this.list.reduce((partial,action)=>{
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
            if(!this._checkRate(rate,{age,conditions},modifier)){
                return partial;
            }
            // add the action to the list
            partial.add(Object.assign({},action));
            return partial;
        },new Set());
        // return list of actions
        return list;
    }
    static list(){return ACTIONS};
}



// todo state machine generating outcomes for the agents:
// outcomes: conditions resulting from carrying out or not a specific action,
// considering the agent's state
class Acting {
    // 24 hours a day
    static DAY = 24;
    static _checkRate = checkRate;
    static _contingencyCost = contingencyCost;
    constructor (){

    }
    static outcomes({acts,skips},{age, conditions}){
        // todo evaluate acts
        let {furtherSkips,positive} = this.acting(acts,{age,conditions});
        // todo evaluate skips
        let {negative} = this.skipping(skips.concat(furtherSkips), {age,conditions});
        // todo calc new user state
        return {positive,negative};
    }
    static acting(acts, {age, conditions} ){
        // calc outcomes and further skips based on the calc of durations and benefits
        let {positive,furtherSkips} = acts.reduce((partial,action)=>{
                // check if there is still time to act
                let duration = this._duration(action,{age,conditions});
                if(partial.time + duration > this.DAY){
                    // no time to carry out this action
                    return partial.furtherSkips.push(action);
                }
                // update spent time
                partial.time += duration;
                // calc of benefits
                let outcomes = this._outcomes(action,'benefits',{age,conditions});
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
        return {positive,furtherSkips};
    }

    static skipping(skips, {age, conditions}){
        // calc the risks related to the skips (action not performed)
        let outcomes = skips.reduce((partial,skip)=>{
                // calc of new risks
                let outcomes = this._outcomes(skip,'risks',{age,conditions});
                // update outcomes
                // for each type of benefit
                for(let outcome in outcomes){
                    // benefit value
                    let value = outcomes[outcome];
                    // if there is already a key in the map
                    if(partial.negative.has(outcome) ){
                        // add prior value to the current one
                        value += partial.negative.get(outcome);
                    }
                    // update value of the type of outcome
                    partial.negative.set(outcome,value);
                }
                return partial;
            },new Map());
        // returns negative outcomes
        return {negative:outcomes};
    }

    static _duration({duration:{hours,errors}},{age,conditions}){
        let duration = hours;
        let error = errors[Math.floor(Math.random()*errors.length)];
        // increase the error considering age and conditions (always slower, thus error is abs)
        error += (Math.abs(error) * (this._ageingCost(age) + this._conditionsCost(conditions)) );
        return duration * error ;
    }

    static _outcomes({rate,weight,type},decision,{age,conditions}){
        // calc the outcomes
        let contingencyCosts = this._contingencyCost(age,conditions);

        // default no outcomes
        let outcome = {};
        outcome[type] = 0;

        let modifier = 1;

        // if benefits then conditions and age lower the benefit and reduce the rate
        if(decision === 'benefits'){
            // make it a negative value to subtract to benefits
            modifier = -1;
        }
        // if over the rate, then no outcome
        if(!this._checkRate(rate,{age,conditions}, modifier) ){
            return outcome;
        }
        // else, update weight of outcome
        outcome[type] = weight + (contingencyCosts * weight * modifier);

        // return outcome {type:weight}
        return outcome;
    }
}




// support functions
// logic of ageing and conditions
// rate (eg. 0.1, {age,conditions} features of user state and arrays
// modifier: 1, -1 or 0 change the logic of adding or removing contingency cost from rate
function checkRate(rate,{age,conditions},modifier = 1){
    if(isNaN(modifier)){modifier = 1;}
    if(isNaN(rate)){return false;}
    // calc rate
    if( Math.random() > (rate + (contingencyCost(age,conditions) * rate * modifier) ) ){
        return false;
    }
    return true;
}
function contingencyCost(age = 0,conditions = 0) {
    return ageingCost(age) + conditionsCost(conditions);
}

function ageingCost(age){
    if(isNaN(age)){return 0;}

    // todo improve with a non-linear function
    const threshold = 50;
    // if age > threshold then 1% each year above the threshold
    return (age - threshold) > 0 ? (age - threshold)/100 : 0;
}
function conditionsCost(conditions){
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