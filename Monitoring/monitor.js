// monitor is a function that takes as input the agent status
// monitor generate messages, logs, etc. as response
// for instance, a wearable is monitor that is able to track bio-signals and generate actions

const MONITOR = [
    {
        label:"log",
        rate:1,
        test:{
            rate:0,
            fields:[]
        },
        action:{
            type:"store",
            section:"logs"
        }
    },
    {
        label:"social monitoring",
        rate:1,
        test:{
            rate:0.05,
            fields:["status","label"],
            value:"dependent",
            operator:"==="
        },
        action:{
            type:"message",
            fields:["address"],
            payload: {
                message: [
                    {
                        addressee: "nurse",
                        content: "dependent",

                    }
                ]
            }
        }
    }
];


export default MONITOR;