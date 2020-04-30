// monitor is a function that takes as input the agent status
// monitor generate messages, logs, etc. as response
// for instance, a wearable is monitor that is able to track bio-signals and generate actions

export default MONITOR = [
    {
        label:"social monitoring",
        rate:0.05,
        test:{
            fields:["status","label"],
            value:"dependent",
            operator:"==="
        },
        action:{
            type:"message",
            fields:["address"],
            payload: {
                section:"status",
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