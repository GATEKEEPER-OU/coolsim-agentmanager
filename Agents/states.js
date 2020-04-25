const {rate:Rate} = require('../Utils');
// agent's states
// state: ['active','independent','dependent','death']
// label: name and key
// decline / improve {from: [array of states], factors}
//      factors: [array ] {factor, type, severity, rate}
//          factor: 'condition', 'age'
//          type: of condition or null for age
//          severity: float for condition, integer (age)
//          rate: probability to get caught in this new state
//      expected use: decline: > severity, improve < severity
// limit: age to skipp to the next state
// conditions: list of conditions to trigger this status
//          {state,type,severity,rate}
//          type: ['mental','social','physical','behavioural']
// rate: probability of having a state
// type (optional): default, rate = 1 - sum of all other

let states = [
    {label:'death',rate:0,
        decline:{
            from:['active','independent','dependent'],
            factors: [
                {
                    factor:'condition',
                    type: 'physical',
                    severity: 0.7,
                    rate:0.005
                },
                {
                    factor:'age',
                    type:null,
                    severity: 70,
                    rate:0.001
                },
                {
                    factor:'age',
                    type:null,
                    age: 80,
                    rate:0.005
                },
                {
                    factor:'age',
                    type:null,
                    age: 100,
                    rate:0.01
                },
            ]
        }
    },
    {label:'dependent',limit:120,rate:0.1,
        decline: {
            from:['active','independent'],
            factors: [
                {
                    factor:'condition',
                    type: 'physical',
                    severity: 0.9,
                    rate: 0.01
                },
                {
                    factor:'condition',
                    type: 'behavioural',
                    severity: 7,
                    rate: 0.005
                },
                {
                    factor:'condition',
                    type: 'mental',
                    severity: 7,
                    rate: 0.01
                },
                {
                    factor:'age',
                    type:null,
                    age: 80,
                    rate:0.5
                },
                {
                    factor:'age',
                    type:null,
                    age: 100,
                    rate:1
                },
            ]
        }
    },
    {label:'independent',limit:120,rate:0.3,
        improve:{
            from:['dependent'],
            factors: [
                {
                    factor:'condition',
                    type: 'mental',
                    severity: 0.5,
                    rate:0.01
                }
            ]
        },
        decline: {
            from:['active'],
            factors: [
                {
                    factor:'condition',
                    type: 'behavioural',
                    severity: 7,
                    rate: 0.01
                },
                {
                    factor:'condition',
                    type: 'social',
                    severity: 7,
                    rate: 0.01
                },
                {
                    factor:'age',
                    type: null,
                    severity: 70,
                    rate: 0.1
                },

            ]
        }
    },
    {label:'active',limit:120,type:'default', prev:['independent'],
        improve: {
            from: ['independent'],
            factors: [
                {
                    factor:'condition',
                    type: 'mental',
                    severity: 0.3,
                    rate: 0.01
                },
                {
                    factor:'condition',
                    type: 'mental',
                    severity: 0.3,
                    rate: 0.01
                },
            ]
        }
    }
];

// calc default
states = Rate.defaultRate(states);


module.exports = states;