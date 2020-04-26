import {EVENTS} from './events.js';
import {rate as Rate} from '../Utils/index.js';
import {Actions} from '../Actions/index.js';
import {Conditions} from '../Conditions/index.js';

// manager of events
// each simulation should have one instance
export class Events {

    constructor(clock){
        if(!clock){ throw new Error('clock required'); }
        this.clock = clock;
        this.current = null;

        this.EVENTS = EVENTS;
        this.ACTIONS = Actions.getActions;
        this.CONDITIONS = Conditions.getConditions;

        // build list of active and idle events
        this.idles = this.EVENTS.reduce((partial,event)=>{
            return partial.add(event.label);
        },new Set());
        this.actives = new Set();

        // build effects library
        let effectsList = [];

            // build label maps
        this.eventsMap = this.EVENTS.reduce((partial,event)=>{
            //update effects list
            effectsList = effectsList.concat(event.effects);
            return partial.set(event.label,event);
        },new Map());
        this.actionsMap = this.ACTIONS.reduce((partial,event)=>{
            return partial.set(event.label,event);
        },new Map());
        this.conditionsMap = this.CONDITIONS.reduce((partial,event)=>{
            return partial.set(event.label,event);
        },new Map());

        this.effectsMap = this._initEffectsMap(effectsList);
    }

    today(){
        // check today events
        // if today is a new day
        if(!this.current || this.current !== this.date){
            this.current = this.date;

            // call sunrise to update idle and active lists
            this._sunrise();
        }

        // calc if agent is joining using spreading rate
        let yourEventsList = Array.from(this.actives)
            .map(e=>this.eventsMap.get(e))
            .filter(e => Rate.test(e.spreading));

        // console.log('today events... ',yourEventsList.map(e=>e.label));
        // calc effects of joining
        let results = yourEventsList.map((event)=>{

            // create a copy
            let result = Object.assign({},event);

            // calc effects for the agent
            let effectsList = event.effects.filter(e=>e.rate);
            // no effects, ignore
            if(effectsList.length > 0){
                // {label:'concussion',source: 'condition',rate:0.3}
                let effects = effectsList.reduce((partial,effect)=>{
                    // add action and condition
                    partial[effect.source].push(Object.assign({},this.effectsMap.get(effect.label)) );
                    return partial;
                },{action:[],condition:[]});
                Object.assign(result,{action:effects.action, condition: effects.condition} );
            }

            return result;
        });
        results.forEach(e=>console.log(e));
        // console.log('agent events',results);
        return results;
    }


    get date(){
        return this.clock.date;
    }

    _sunrise(){
        // check if idle event are triggered
        let actives = this._checkEvents(this.idles, 'starting');
        // check if active event have ended
        let idles = this._checkEvents(this.actives, 'ending');
        // update lists
        this._updateList(this.idles, idles,actives);
        this._updateList(this.actives, actives,idles);

        // console.log('idles',idles);
        // console.log('actives',actives);
    }
    _checkEvents(list, field){
        let otherList = new Set();
        list.forEach(name=>{
            let trigger = this.eventsMap.get(name)[field];
            if( Rate.test(trigger) ){
                otherList.add(name);
            }
        });
        return otherList;
    }
    _updateList(list,add,remove){
        // add add set and remove remove set
        add.forEach(key=>list.add(key));
        remove.forEach(key=>list.delete(key));
    }

    _initEffectsMap(effectsList){
        return effectsList.reduce((partial,effect)=>{
            // check if the source is given
            if(!effect.source){
                console.error(`ERROR: Missing source definition for the effect ${effect.label}`);
                return partial;
            }

            let sourceMap = this.conditionsMap;
            if (effect.source === 'action'){
                sourceMap = this.actionsMap;
            }

            // check if i can find it in the list
            if(!sourceMap.has(effect.label)){
                console.error(`ERROR: Missing ${effect.label} from list of ${effect.source}`);
                return partial;
            }

            // copy effect
            let result = Object.assign( {},
                sourceMap.get(effect.label));

            // check if ratio is given
            if(effect.ratio){
                result.ratio =  effect.ratio;
            }

            return partial.set(result.label,result);
        },new Map());
    }

};