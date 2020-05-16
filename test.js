import Agents from "./index.js";
import Task from "task.js";



runs(100000,365);


async function runs(users,days) {
    console.time("All activities");
    let a = new Agents({simulation:123, speed:"day", sync:false});
    let t = new Task({
        maxWorkers:8,
        workerTaskConcurrency: 1
    });
    try {
        console.time("user generation");
        await a.init(users);
        console.timeEnd("user generation");
        console.time("simulation");
        for(let day= 0; day < days; day++){
            console.time(`Day ${day+1}`);
            let summary = await a.run();
            console.timeEnd(`Day ${day+1}`);
            console.log(`Collected reports from ${summary.length} agents`);
        }
        console.timeEnd("simulation");
        // let d = await a.getData();
        // console.log("local data",d.length);
        // await a.closeUp();
    }catch (err){
        console.error(err);
    }
    console.timeEnd("All activities")
}


// heavyTasks();


async function heavyTasks() {

    let t = new Task({
        maxWorkers:8,
        workerTaskConcurrency: 1,
        initialize: () => {
            global.workHard = async () => {
                const concurrencyLimit = 800;
                const total = 200000;
                let listOfArguments = Array(total).fill("yo");
                // console.log("asdasd",listOfArguments);
                // Enhance arguments array to have an index of the argument at hand
                const argsCopy = [].concat(listOfArguments.map((value, index) => ({value: `yo ${index}`, index })));
                const result = new Array(listOfArguments.length);
                const promises = new Array(concurrencyLimit);
                for(let i =0; i < concurrencyLimit; i++){
                    let arg = argsCopy.shift();
                    // console.log("arg",argsCopy);
                    promises[arg.index] = asyncOperation(arg.value).then(r => { result[arg.index] = r; });
                }
                // Recursively chain the next Promise to the currently executed Promise
                function chainNext(p) {
                    if (argsCopy.length) {
                        const arg = argsCopy.shift();
                        return p.then(() => {
                            // Store the result into the array upon Promise completion
                            const operationPromise = asyncOperation(arg.value).then(r => { result[arg.index] = r; });
                            return chainNext(operationPromise);
                        });
                    }
                    return p;
                }

                function asyncOperation(value) {
                    return new Promise((resolve)=>{
                        setTimeout(()=>{resolve(value)},Math.floor(1*Math.random()) );
                    })
                }

                await Promise.allSettled(promises.map(chainNext));
                return result;
            }
        }
    });

    console.time("time");
    Promise.allSettled(
        [
            t.run(_=> workHard() ),
            t.run(_=> workHard() ),
            t.run(_=> workHard() ),
            t.run(_=> workHard() ),
            t.run(_=> workHard() ),
            t.run(_=> workHard() ),
            t.run(_=> workHard() )
        ]
    ).then(res=>{
        t.terminate()
        console.timeEnd("time");
        console.log("Results", res.length);
    });
}



