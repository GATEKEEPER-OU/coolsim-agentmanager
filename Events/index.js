const EVENTS = require('./events');
const {rate: Rate} = require('../Utils');
const Actions = require('../Actions');
const Conditions = require('../Conditions');

// manager of events
// each simulation should have one instance
class Events {

    constructor(){
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

        this.effectsMap = effectsList.reduce((partial,effect)=>{
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

    sunrise(){
        // check if idle event are triggered
        let actives = this._checkEvents(this.idles, 'starting');
        // check if active event have ended
        let idles = this._checkEvents(this.actives, 'ending');
        // update lists
        this._updateList(this.idles,idles,actives);
        this._updateList(this.actives,actives,idles);


        // console.log('idles',idles);
        // console.log('actives',actives);
        return Array.from(actives).reduce((partial,active)=>{
            let event = this.eventsMap.get(active);
            event.effects.forEach(effect=>{
                let newEffect = Object.assign({},this.effectsMap.get(effect.label) );
                partial[effect.source]  = partial[effect.source].concat(newEffect);
            });
            return partial;
            }, { action:[], condition:[] });
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
};
module.exports = Events;
