import Agent from "./Agents/index.js";
import Bootstrap from "../Bootstrap/index.js";
import Store from "../Store/index.js";
import * as _ from "lodash";
import uniqid from "uniqid";
import Utils from "../Utils/index.js";
const Time = Utils.time;

export default class Agents{
    constructor({simulation = uniqid("sim-")}){
        this.agents = [];
        this.finals = [];
        this.simulation = simulation.toString();
        this.store = new Store("simulation",{simulation:this.simulation});
        this.day = 0;
        // todo create clock
        this.clock = new Time.Clock('hour');
    }

    get list(){
        return this.agents;
    }


    async run(events = []){

        return this._run(events).then(async res=>{
            // wait for the clock to finish
            await this._tillTomorrow();
            return res;
        });

    }

    _run(events){
        // console.log("1",events);
        return new Promise( async (resolve, reject)=> {
            let agtPromises = [];
            // console.log("2",this.agents);
            this.agents.forEach(agt => {
                agtPromises.push(agt.dailyRoutine(events));
            });
            Promise.allSettled(agtPromises).then( async results=>{
                // console.log("results of the day",results);
                // prepare summary
                let summary = results.map(result=>{
                    let {value, status} = result;
                    let r = {
                        agent: value.agent,
                        status: value.state.status,
                    };
                    // console.log("report",r);
                    // check if agent reached its final state, e.g. death
                    if(value.state.status.type === "final" || status !== "fulfilled"){
                        // exclude agent that are final form the list
                        this._toFinal(value.agent);
                    }
                    return r;
                });

                let doc = {
                    summary,
                    day: this.day,
                    simulation:this.simulation
                };
                await this.store.save("details",doc);
                this.day++;
                resolve(summary);
            }).catch(err=>reject(err));
        });
    }



    // return array of agents
    async init(num,clock,board){
        let agents = [];

        for(let i = 0; i < num; i++){
            // todo gender & age distribution

            let agent = await this._init(
                {simulation:this.simulation},
                clock,
                board);
            // console.log("agent",agent);
            agents.push(agent);
        }
        this.agents = this.agents.concat(agents);
        return agents;
    }


    async getData(){
        return this.store.readBySection("details");
    }

    async closeUp() {
        // closeup simulation and agents
        let agtPromises = [];
        this.agents.forEach(agt => {
            agtPromises.push(agt.closeUp());
        });
        // returns a combined promise of all agent and simulation
        return Promise.allSettled([
            this.store.cleanUp({simulation:this.simulation}),
            Promise.allSettled(agtPromises)
        ]);
    }
    // init one user
    async _init(agent,clock,board) {

        // todo get basic info to pass to agent constructor

        // console.log("user's description",r);
        return new Agent(agent,clock,board);

    }

    // remove an agent from agents and places it in the final list
    _toFinal(id){
        // remove by id
        this.finals.concat(_.remove(this.agents, (e)=>e.id===id));
    }

    // returns a promise that is resolved tomorrow
    _tillTomorrow(){
        // console.log("wait until",this.clock.tillTomorrow);
        return new Promise(resolve=>{
            setTimeout(()=>{ resolve("tomorrow") },
                this.clock.tillTomorrow);
        })
    }

}



