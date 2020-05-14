import Agents from "./index.js";



runs(2,1);


async function runs(users,days) {
    console.time("All activities");
    let a = new Agents({simulation:123});
    try {
        console.time("user generation");
        await a.init(users);
        console.timeEnd("user generation");
        console.time("simulation");
        for(let day= 0; day < days; day++){
            let summary = await a.run();
            console.log(`Day ${day+1}, collected reports from ${summary.length} agents`);
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


