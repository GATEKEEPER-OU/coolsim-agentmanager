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

import Utils from '../../Utils/index.js';
import Bootstrap from "../../Bootstrap/index.js";

const CONDITIONS = Bootstrap.user.CONDITIONS;

const Costs = Utils.cost;
const Rate = Utils.rate;
const toArray = Utils.toArray;
const mergeObjects = Utils.mergeObjects;

export default class Conditions{
    CONDITIONS = CONDITIONS;
    constructor({age=30,conditions=[]}){

        this.age = age;

        let prior = toArray(conditions);
        // check prior conditions or generate some
        if(!prior || !Array.isArray(prior) || prior.length < 1){
            // generate new conditions
            prior = this.CONDITIONS.filter(c=>Rate.check(c.rate,this.age));
        }
        this.conditionsMap = prior.reduce((partial,condition)=>{
            partial.set(condition.label,Object.assign({},condition) );
            return partial;
        },new Map());
        // console.log(this.conditionsMap);

        this.conditionTypes = new Set(CONDITIONS.map(v=>v.type));
    }

    set setAge(age){
        this.age = age;
    }
    get conditionsByType(){
        let res = this.types.reduce((r,v)=>{
            r[v] = {
                label:v,
                list:[],
                severity:0,
                level:1
            };
            return r;
        },{});
        let conds = Array.from(this.conditionsMap.keys()).reduce((r,v)=>{
            let {label,type,severity} = this.conditionsMap.get(v);
            r[type].list.push(label);
            r[type].severity += severity;
            r[type].level = 1 - r[type].severity;
            return r;
        },res);
        // console.log("conditions by type",conds);
        return conds;
    }
    get status (){
        return Array.from(this.conditionsMap.values());
    };
    get types(){return Array.from(this.conditionTypes)}

    get stats(){
        let c = this.conditionsByType;
        // calc stats
        return Object.keys( c ).reduce((p,k)=>{
            p[k] = {
                conditions: c[k].list,
                severity: c[k].severity,
                level: c[k].level
            };
            return p;
        },{});
    }

    static get getConditions(){return CONDITIONS;}
    static get getTypes(){ return Array.from(new Set(CONDITIONS.map(v=>v.type)) ) }


    // calc of updates of conditions, given a positive and negative outcomes
    // returns new events caused by the negative effect of outcomes
    // returns emerging events from the update
    assess( positive = new Map (), negative = new Map() ){
        if(positive instanceof Array){
            positive = new Map(positive);
        }
        if(negative instanceof Array){
            negative = new Map(negative);
        }

        let emergingIssues = [];
        // update each condition
        this.conditionsMap.forEach((condition,key) => {
            let type = condition.type;
            let {rate, weight} = condition.progression;
            // impact of progression
            let updates = [];
            // calc
            updates.push( Costs.weight(rate, weight, this.age, this.conditionsMap) );
            // impact of Outcomes
            updates.push( this._effects(type, positive, 'positive') );
            updates.push( this._effects(type, negative, 'negative') );
            // update events emerging from the update
            emergingIssues = emergingIssues.concat( this._update(key,updates) );
        });

        // consolidate emerging issues in one object
        // [{type,weight}]
        let issues = emergingIssues.reduce((partial,issue)=>{
            return mergeObjects(partial,issue);
        },{});
        // returns issues {key:weight}
        return issues;
    }

    // add a list of conditions to the current ones
    add(conditions){
        if(!conditions || !Array.isArray(conditions) ){
            return false;
        }
        conditions.forEach((value) => this.conditionsMap.set(value.label,value) );
        return true;
    }

    // check if a condition is among the current ones
    has(condition){
        let name = condition;
        if(typeof condition !== 'string' && condition.label){
            name = condition.label
        }

        return this.conditionsMap.has(name);
    }

    // convert issues to conditions
    // {type:weight}
    addIssues(issues){
        let issuesCopy = Object.assign({},issues);
        // logic: not in current and of a type included isues
        let newConditions = this.CONDITIONS.reduce((partial,condition)=>{
            // if it is of a type included in issues
            let type = condition.type;
            if(!issues[type]){return partial;}
            // if it is not current
            if(this.conditionsMap.has(condition.label)){return partial;}
            let severity = issues[condition.type];
            if(severity>1){
                issues[condition.type] = severity - 1;
                severity = 1;
            }
            let newCondition = Object.assign({},condition,{severity});
            // update conditions
            this.conditionsMap.set(condition.label,newCondition);
            // prepare results
            partial.push(newCondition);
            return partial;
        },[]);
        // console.log('emerging conditions',newConditions);
        return newConditions;
    }

    // retrieve effect of outcomes
    _effects(type, outcomes, effect){
        // check each condition
        if( outcomes.has(effect.type) ){
            let modifier = effect === 'positive' ? -1 : 1;
            return ( modifier * outcomes.get(type) );
        }
        return 0;
    }


    // update conditions with age and pre-existing conditions
    _update(key, updates) {
        let condition = Object.assign({},this.conditionsMap.get(key));
        let duration = condition.duration;
        // calc update considering logic of duration
        let update = updates.reduce((partial, num)=>{
            // console.log('===========',duration,num,partial);
            switch (duration) {
                case 'permanent':
                    if (num < 0) {
                        // if not degenerating then discard
                        return partial;
                    }
                    return partial + num;
                case 'temporary':
                   if (num > 0) {
                        // if not is improving then discard
                        return partial;
                    }
                    return partial + num;
                    break;
                default: // chronic
                // update new weight but never deleted;
                //     console.log("???????????????",(partial + num));
                    return partial + num;
            }
        },0);

        // check if requires other changes and save
        return this._checkAndSave(key, condition, update);
    }

    //
    _checkAndSave(key, condition, update) {
        // console.log("------------",key,condition,update);

        let events = [];
        // remove temporary condition if weight <= 0
        if (condition.duration === 'temporary' && condition.weight <= 0) {
            this.conditionsMap.delete(key);
            return events;
        }

        // if weight > 1 update duration
        // temporary > chronic > permanent
        if( (condition.severity + update) > 1 ){
            let delta = condition.weight + update - 1;
            events.push({type:condition.type,weight:delta});
            switch(condition.duration){
                case 'chronic':
                    condition.duration = 'permanent';
                    break;
                case 'temporary':
                    condition.duration = 'chronic';
                default:
                    condition.severity = 1;
            }
        }

        // default, update weight
        condition.severity += update;
        // add severity level
        condition.severityLevel = Rate.rateToSeverity(condition.severity);


        // save new state of condition
        this.conditionsMap.set(key,condition);
        return events;
    }
}