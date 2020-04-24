const EVENTS = require('./events');
const {rate: Rate} = require('../Utils');
const Actions = require('../Actions');
const Conditions = require('../Conditions');

// manager of events
// each simulation should have one instance
class Events {

    constructor(){
        this.EVENTS = EVENTS;
        this.events = this.EVENTS.reduce((partial,event)=>{
            return partial.set(event.label,event);
        },new Map);
        this.ACTIONS = Actions.getActions;
        this.CONDITIONS = Conditions.getConditions;
        this.idles = this.EVENTS.reduce((partial,event)=>{
            return partial.add(event.label);
        },new Set());
        this.actives = new Set();
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
        let {actions,conditions} = Array.from(actives).reduce((partial,active)=>{
            let event = this.events.get(active);
            // console.log('~~~~~~~',active,event);
            event.outcomes.forEach(outcome=>{
                let effects = outcome.effects;
                if(outcome.source === 'action'){
                    let newActions = this._getFromList(this.ACTIONS,new Set(effects));
                   partial.actions = partial.actions.concat(...newActions);
                }else{
                    let newConditions = this._getFromList(this.CONDITIONS,new Set(effects));
                    partial.conditions = partial.actions.concat(...newConditions);
                }
                return partial
            });

            }, { actions:[], conditions:[] });

        return { actions, conditions };
    }
    _checkEvents(list, field){
        console.log(list);
        let otherList = new Set();
        list.forEach(name=>{
            let trigger = this.events.get(name)[field];
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
    // source of elements, set,
    _getFromList(source,set){

        return source.reduce((partial,element)=>{
            // if not in the set
            if(!set.has(element.label)){return partial;}
            // is in the set, therefore override rate
            let newValue = this.EVENTS[element.label].spreading;
            // copy condition and update rate
            let newElement = Object.assign({},element,{rate: newValue});
            return partial.concat(newElement);
        },[])
    }
};
module.exports = Events;


// todo test
let events = new Events();

console.log('.....',events.sunrise());