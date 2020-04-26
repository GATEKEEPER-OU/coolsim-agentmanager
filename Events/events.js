// list of events
// events have a label,
// starting: how often it can happen
// spreading: rate of diffusion
// duration: number of days
// ending: rate of ending of the event
// outcomes: array [ {} ]
// effects: [ {label // key of the outcome, source // [action,condition] rate // overriding the source rate} ]
export const EVENTS = [
    {
        label:'seasonal flu',
        starting:0.008,
        spreading:0.2,
        ending:0.03,
        effects:[
                {label: 'flu',source: 'condition',rate:0.2}
            ]
    },
    {
        label:'accident',
        starting:0.1,
        spreading:0.05,
        ending:1,
        effects:[
            {label:'concussion',source: 'condition',rate:0.3},
            {label:'breaking',source: 'condition',rate:0.3},
            {label:'bleeding',source: 'condition',rate:0.3}
        ]
    },
    {
        label:'food festival',
        starting:1,
        spreading:0.3,
        ending:0.1,
        effects:[
            {label:'eat',source: 'action',rate:0.3},
            {label:'visit',source: 'action',rate:1},
            {label:'entertainment', source:'action', rate:1}
        ]
    },
    {
        label:'pandemic outbreak',
        starting:1,
        spreading:0.3,
        ending:0.1,
        effects:[
                {label:'flu',source: 'condition',rate:0.3}
            ]
        }
];