// list of events
// events have a label,
// starting: how often it can happen
// spreading: rate of diffusion
// duration: number of days
// ending: rate of ending of the event
// outcomes: array [ {} ]
// outcome: {source:  ['condition','action'], // source of the outcome
//          effects: [ {label // key of the outcome, rate // overriding the source rate} ]
module.exports = [
    {
        label:'seasonal flu',
        starting:0.008,
        spreading:0.2,
        ending:0.03,
        outcomes:[
            {
                source: 'condition',
                effects:[
                    {label: 'flu',rate:0.2}
                ]
            }
        ]
    },
    {
        label:'accident',
        starting:0.1,
        spreading:0.05,
        ending:1,
        outcomes:[
            {
                source: 'condition',
                rate:0.3,
                effects:[
                    {label:'concussion',rate:0.3},
                    {label:'breaking',rate:0.3},
                    {label:'bleeding',rate:0.3}
                ]
            }
        ]
    }
];