import Agent from "./Agents/index.js";
import Bootstrap from "../Bootstrap/index.js";
import Store from "../Store/index.js";
import * as _ from "lodash";
import uniqid from "uniqid";
import Task from 'task.js';
import Utils from "../Utils/index.js";
const Time = Utils.time;

export default class Agents{

    CONCURRENCY_LIMIT = 800;

    constructor({
                    simulation = uniqid("sim-"),
                    speed = "hour",
                    sync = true,
                    store = null
    }){
        this.agents = [];
        this.simulation = simulation.toString();
        this.store = store;
        this.day = 0;
        this.sync = sync;
        // create clock
        this.clock = new Time.Clock(speed);


    }

    get list(){
        return this.agents;
    }

    // runs the day for all agents, then saves on the store a summary
    // delays waiting for the next day
    async run(events = []){

        this.day++;

        let runPromise = this._run(events).then(async res=>{
            // if store is defined, then save
            if(this.store){
                await this.store.save({
                    simulation: this.simulation,
                    day: this.day,
                    results: res
                });
            }

            return res;
        }).catch(err=>console.error("Error run",err));

        return Promise.allSettled([
            // wait for the clock to finish
            this._tillTomorrow(),
            runPromise
        ]).then(async res=>{
            let summary = res.reduce((p,{status,value})=>{
                if(status !== "fulfilled"){return p;}
                if(value === "tomorrow"){return p;}
                return value;
            });
            if(!summary){
                throw new Error("Error: no summary of the day");
            }
            // console.log("summary",summary);
            return summary;
        })

    }




    // return array of agents
    async init(num,clock,board){
        let agents = [];

        for(let i = 0; i < num; i++){

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
    set finals(id){
        if(!this._finals){this._finals = [];}
        // remove by id
        this._finals.concat(_.remove(this.agents, (e)=>e.id===id));
    }
    get finals(){
        return this._finals;
    }

    // returns a promise that is resolved tomorrow
    _tillTomorrow(){
        // if sync with the clock disabled, then return a resolved promise
        if(!this.sync){return Promise.resolve()}

        // returns a promise which is resolved at the end of the day
        // console.log("wait until",this.clock.tillTomorrow);
        return new Promise(resolve=>{
            // console.log("waiting for...",this.clock.tillTomorrow);
            setTimeout(()=>{ resolve("tomorrow") },
                this.clock.tillTomorrow);
        })
    }


    // runs all agents balancing the number of parallel processes
    async _run(events) {
        const total = this.agents.length;
        // Enhance arguments array to have an index of the argument at hand
        const args = Array(total).fill().map((_, index) => ({ index }));

        const result = new Array(total);
        const promises = new Array(this.CONCURRENCY_LIMIT);
        // console.log("asd",argsCopy);


        const daily = async (arg) => {
            return this.agents[arg.index].dailyRoutine(events)
                .then(r => {
                    // update results
                    result[arg.index] = r;
                    // if this is the last day
                    if(r.final){
                        this.finals = r.id;
                    }
                } ).catch(err=>console.error(err));
        };
        const chainNext = async (p) => {
            // console.log(argsCopy.length);
            if (args.length) {
                const arg = args.shift();
                return p.then(() => {
                    // Store the result into the array upon Promise completion
                    const operationPromise = daily(arg);

                    return chainNext(operationPromise);
                }).catch(err=>console.error(err));
            }
            return p;
        };




        // init first batch saturating the limit for concurrency
        for(let i =0; i < this.CONCURRENCY_LIMIT; i++){
            if (args.length) {
                let arg = args.shift();

                promises[arg.index] = daily(arg);
            }
        }

        try{
            await Promise.allSettled(promises.map(chainNext));
            // console.log("end of run",result);
            return result;

        }catch (err){
            console.error("ERROR _run",err);
            throw new Error(err);
        }

    }

}



