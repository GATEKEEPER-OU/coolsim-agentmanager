import Agent from "./Agent/index.js";
import Store from "../store/index.js";
import * as _ from "lodash";
import uniqid from "uniqid";
import Utils from "../utilities/index.js";
const Time = Utils.time;

export default class Agents{

    CONCURRENCY_LIMIT = 800;

    constructor({
                    simulation = uniqid("sim-"),
                    speed = "hour",
                    sync = true,
                    save = false
    }){
        this.agents = [];
        this.simulation = simulation.toString();
        this.save = save;


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
                try {
                    await this.store.details.save({
                        _id: this.simulation + "-day-" + this.day,
                        simulation: this.simulation,
                        day: this.day,
                        events,
                        results: res.reduce((r, v) => {
                            let {status, age, final, stats} = v;

                            // final
                            if (final) {
                                r.final++;
                            }
                            // status
                            if (!r[status]) {
                                r[status] = 1;
                            } else {
                                r[status]++;
                            }

                            r.age += age / res.length;

                            // stats
                            Object.keys(stats).forEach(e => {
                                if (!r.stats) {
                                    r.stats = {};
                                }
                                if (!r.stats[e]) {
                                    r.stats[e] = 0;
                                }
                                r.stats[e] += stats[e].level / res.length;
                            });

                            return r;
                        }, {final: 0, age: 0})
                    });
                }catch (err){
                    console.error("Error saving agents' day",err);
                }
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

        if(this.save){
            let store = await new Store({type:"diary", simulation:this.simulation});
            // console.log("store",store);
            this.store = {
                details :  store
            };
        }

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


    async journal(){
        if(this.store){
            return this.store.read();
        }
        return Promise.reject("Don't keep a journal, sorry");
    }

    async closeUp() {
        // closeup simulation and agents
        let promises = [this._closeUpAgents()];

        if(this.store){
            promises.concat(Object.keys(this.store).map(e=> this.store[e].cleanUp({simulation:this.simulation}) ));
        }

        // returns a combined promise of all agent and simulation
        return Promise.allSettled(promises).catch(err=>console.error(err));
    }


    async _closeUpAgents(){
        const total = this.agents.length;
        // Enhance arguments array to have an index of the argument at hand
        const args = Array(total).fill().map((_, index) => ({ index }));

        const result = new Array(total);
        const promises = new Array(this.CONCURRENCY_LIMIT);
        // console.log("asd",argsCopy);


        const task = async (arg) => {
            return this.agents[arg.index].closeUp();
        };

        const chainNext = async (p) => {
            // console.log(argsCopy.length);
            if (args.length) {
                const arg = args.shift();
                return p.then(() => {
                    // Store the result into the array upon Promise completion
                    const operationPromise = task(arg);

                    return chainNext(operationPromise);
                }).catch(err=>console.error(err));
            }
            return p;
        };

        // init first batch saturating the limit for concurrency
        for(let i =0; i < this.CONCURRENCY_LIMIT; i++){
            if (args.length) {
                let arg = args.shift();

                promises[arg.index] = task(arg);
            }
        }

        try{
            await Promise.allSettled(promises.map(chainNext));
            // console.log("end of run",result);
            return result;

        }catch (err){
            console.error("ERROR _closeUpAgents",err);
            throw new Error(err);
        }
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



