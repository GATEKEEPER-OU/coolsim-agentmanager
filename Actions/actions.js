// todo list of actions
// partially related to: https://ec.europa.eu/eip/ageing/sites/eipaha/files/results_attachments/city4age_d2.06_riskmodel_v2.0.pdf
// type: ['physical','self','basic','socialization','culture','health']
// rate to be selected in the daily list,
// e.g rate = 1 daily mandatory activity, such as sleeping
//      rate = 0.7 (5/7) workday activity such as working
//      rate = 0.14 weekly activity, such as grocery or house keeping
//      rate = 0.07 biweekly activity, such as participate to a community meeting
//      rate = 0.03 monthly activity, such as GP visit
// risk: representing the risk of not acting as cause of a new condition, {rate, weight, type}
//       rate: probability of triggering a worsening
//       weight: value to add to the severity or permanence of a condition
//       type: category of risk ['mental','social','physical','behavioural']
// benefit: representing the benefit of acting as cause of removing an existing condition, {rate, weight, type}
//       rate: probability of triggering an improvement
//       weight: value to remove to the severity or permanence of a condition
//       type: category of benefit ['mental','social','physical','behavioural']
// duration:  duration in hours and errors (array of rates representing how much the duration can deviate [0.1,-0.1])

const ACTIONS = [
    // dailies
    {
        label:'study',
        type:'culture',
        rate:0.3,
        risks:[ { rate:0.3, weight:0.1, type:'behavioural' } ],
        benefits:[
                { rate:0.3, weight:0.1, type:'behavioural' },
                { rate:0.05, weight:0.2, type:'socialization' },
                { rate:0.05, weight:0.2, type:'mind' },
            ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'sleep',
        type:'self',
        rate:1,
        risks:[ { rate:0.3, weight:0.1, type:'physical' } ],
        benefits:[ { rate:0.05, weight:0.05, type:'physical' } ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'rest',
        type:'self',
        rate:1,
        risks:[ { rate:0.3, weight:0.1, type:'physical' } ],
        benefits:[ { rate:0.05, weight:0.05, type:'physical' } ],
        duration:{ hours:1, errors:[-0.3,0.2] }
    },
    {
        label:'eat',
        type:'self',
        rate:1,
        risks:[ { rate:0.3, weight:0.1, type:'physical' } ],
        benefits:[ { rate:0.05, weight:0.05, type:'physical' } ],
        duration:{ hours:1, errors:[-0.3,0.2] }
    },
    {
        label:'toilet',
        type:'self',
        rate:1,
        risks:[ { rate:0.3, weight:0.1, type:'physical' } ],
        benefits:[ ],
        duration:{ hours:0.5, errors:[-0.3,0.2] }
    },
    {
        label:'bathing',
        type:'self',
        rate:1,
        risks:[ { rate:0.3, weight:0.1, type:'physical' } ],
        benefits:[ ],
        duration:{ hours:0.5, errors:[-0.3,0.2] }
    },
    {
        label:'going out',
        type:'self',
        rate:1,
        risks:[
            { rate:0.1, weight:0.1, type:'social' },
            { rate:0.1, weight:0.1, type:'physical' },
            { rate:0.1, weight:0.1, type:'mental' }
            ],
        benefits:[
            { rate:0.1, weight:0.1, type:'social' },
            { rate:0.1, weight:0.1, type:'physical' },
            { rate:0.1, weight:0.1, type:'mental' }
            ],
        duration:{ hours:2, errors:[-0.3,0.2] }
    },
    {
        label:'cook',
        type:'self',
        rate:1,
        risks:[
            { rate:0.3, weight:0.1, type:'physical' },
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'physical' },
            { rate:0.05, weight:0.05, type:'behavioural' }
            ],
        duration:{ hours:1, errors:[-0.3,0.2] }
    },
    {
        label:'grooming',
        type:'self',
        rate:1,
        risks:[
            { rate:0.3, weight:0.1, type:'behavioural' },
            { rate:0.3, weight:0.1, type:'social' }
        ],
        benefits:[
            { rate:0.3, weight:0.1, type:'behavioural' },
            { rate:0.3, weight:0.1, type:'social' }
            ],
        duration:{ hours:0.5, errors:[-0.3,0.2] }
    },
    {
        label:'housekeeping',
        type:'basic',
        rate:0.5,
        risks:[
            { rate:0.3, weight:0.1, type:'health' },
            { rate:0.3, weight:0.1, type:'behavioural' }
        ],
        benefits:[
            { rate:0.3, weight:0.1, type:'health' },
            { rate:0.3, weight:0.1, type:'behavioural' }
        ],
        duration:{ hours: 1.5, errors:[-0.3,0.2] }
    },
    {
        label:'working',
        type:'basic',
        rate:0.7,
        risks:[
            { rate:0.1, weight:0.1, type:'behavioural' },
            { rate:0.1, weight:0.1, type:'social' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'behavioural' },
            { rate:0.05, weight:0.05, type:'social' }
            ],
        duration:{ hours: 6, errors:[-0.5,0.1] }
    },
    {
        label:'exercises',
        type:'self',
        rate:0.5,
        risks:[
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'behavioural' },
            { rate:0.05, weight:0.05, type:'body' }
            ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'reading',
        type:'self',
        rate:0.5,
        risks:[
            { rate:0.3, weight:0.1, type:'mind' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'mind' }
            ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'entertainment',
        type:'self',
        rate:0.5,
        risks:[
            { rate:0.3, weight:0.1, type:'mind' },
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'mind' }
            ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    // weeklies
    {
        label:'laundry',
        type:'basic',
        rate:0.2,
        risks:[
            { rate:0.05, weight:0.1, type:'physical' },
            { rate:0.3, weight:0.1, type:'behavioural' }
        ],
        benefits:[
            { rate:0.05, weight:0.05, type:'body' },
            { rate:0.3, weight:0.1, type:'social' }
        ],
        duration:{ hours:2, errors:[-0.3,0.2] }
    },
    {
        label:'visit',
        type:'socialization',
        rate:0.25,
        risks:[
            { rate:0.3, weight:0.1, type:'social' },
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'social' },
            { rate:0.05, weight:0.05, type:'behavioural' }
        ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'grocery',
        type:'basic',
        rate:0.25,
        risks:[
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'social' },
            { rate:0.05, weight:0.05, type:'behavioural' }
        ],
        duration:{ hours:2, errors:[-0.3,0.2] }
    },
    // monthlies
    {
        label:'check-up',
        type:'health',
        rate:0.03,
        risks:[
            { rate:0.3, weight:0.1, type:'body' },
            { rate:0.3, weight:0.1, type:'mental' }
            ],
        benefits:[ { rate:0.05, weight:0.05, type:'behavioural' } ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
    {
        label:'vacation',
        type:'self',
        rate:0.03,
        risks:[
            { rate:0.3, weight:0.1, type:'physical' },
            { rate:0.3, weight:0.1, type:'behavioural' }
            ],
        benefits:[
            { rate:0.05, weight:0.05, type:'behavioural' },
            { rate:0.05, weight:0.05, type:'social' },
            { rate:0.05, weight:0.05, type:'mental' }
            ],
        duration:{ hours:8, errors:[-0.3,0.2] }
    },
];

export default ACTIONS;