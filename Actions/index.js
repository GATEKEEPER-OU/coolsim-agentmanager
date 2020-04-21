// todo returns a class including a generator of suggested actions

// todo provided actions are related to the phase of the day
// todo actions include a suggested time for execution
// todo actions include a set of implications concerning performing or not the action



// todo list of actions
// type, such as mobility, socialization
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
const actions = {
    //todo https://ec.europa.eu/eip/ageing/sites/eipaha/files/results_attachments/city4age_d2.06_riskmodel_v2.0.pdf
};


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
    constructor (){

    }
    remind({age,conditions}){
        // todo calc list of actions considering conditions and age
        // todo apply risks and benefit factors considering conditions and age
        // todo modify duration and errors considering conditions and age
        // todo return action with new rates and errors
    }
}



// todo state machine generating outcomes for the agents:
// outcomes: conditions resulting from carrying out or not a specific action,
// considering the agent's state
class Acting {
    DAY = 24;
    constructor (){

    }
    outcomes({actions,skips},{age, conditions}){
        // todo evaluate acts
        let {furtherSkips,positive} = this.acting(actions,{age,conditions});
        // todo evaluate skips
        let {negative} = this.skipping(skips.concat(furtherSkips), {age,conditions});
        // todo calc new user state
        return {positive,negative};
    }
    acting(actions, {age, conditions} ){
        // calc outcomes and further skips based on the calc of durations and benefits
        let {positive,furtherSkips} = actions.reduce((partial,action)=>{
                // check if there is still time to act
                let duration = this._duration(action,{age,condition});
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

        return {positive,furtherSkips};
    }

    skipping(skips, {age, conditions}){
        // todo calc risk rate
        // todo calc weight
        // todo return {duration = 0, {outcomes: Map({typelabel: weight}) }
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

        return {negative:outcomes};
    }

    _duration({duration:{hours,errors}},{age,conditions}){
        let duration = hours;
        let error = errors[Math.floor(Math.random()*errors.length)];
        // increase the error considering age and conditions (always slower, thus error is abs)
        error += (Math.abs(error) * (this._ageingCost(age) + this._conditionsCost(conditions)) );
        return duration * error ;
    }

    _outcomes({rate,weight,type},decision,{age,conditions}){
        // calc the outcomes
        let contingencyCosts = this._ageingCost(age) + this._conditionsCost(conditions);

        // default no outcomes
        let outcome = {};
        outcome[type] = 0;

        // if benefits then conditions and age lower the benefit and reduce the rate
        if(decision === 'benefits'){
            // make it a negative value to subtract to benefits
            contingencyCosts = -contingencyCosts;
        }
        // if over the rate, then no outcome
        if(Math.random() > rate + (contingencyCosts * rate) ){
            return outcome;
        }
        // else, update weight of outcome
        outcome[type] = weight + (contingencyCosts * weight);

        return outcome;
    }

    static _ageingCost(age){
        const threshold = 50;
        // if age > threshold then 1% each year above the threshold
        return (age - threshold) > 0 ? (age - threshold)/100 : 0;
    }
    static _conditionsCost(conditions){
        // todo improve
        // 1% each condition
        return conditions.length/100;
    }
}