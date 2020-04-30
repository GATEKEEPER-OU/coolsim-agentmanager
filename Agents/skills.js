// agent's skills
// label: name and key
// rate: probability of having a skill
// ending: probability to end the effect
// roles: default for a set of roles
// effects:[array] what can cause to a subject
//         {label, source (list of effect), ratio (override the origin ratio}

export default SKILLS = [
    {label:'health visit',rate:0.1,ending:0.1,
        roles: ['gp','nurse'],
        effects:[
            {label:'check-up',source:'action',rate:1},
            {label:'visit',source: 'action', rate:1},
            {label:'exercise',source:'action', rate:0.5}
        ]
    },
    {label:'first aid',rate:0.1,ending:0.5,
        roles: ['gp','nurse','ward'],
        effects:[
            {label:'check-up',source:'action',rate:0.8}
        ]
    },
    {label:'counseling', rate:0.05,ending:0.1,
        roles: ['social worker','community worker'],
        effects:[
            {label:'visit',source: 'action', rate:1},
            {label:'check-up',source:'action',rate:0.5}
        ]
    },
    {label:'driving', rate:0.3,ending:1,
        effects:[
            {label:'going out',source: 'action', rate:1},
            {label:'grocery',source: 'action', rate:0.6},
        ]
    },
    {label:'fitness', rate:0.05,ending:1,
        effects:[
            {label:'exercises', source:'action',rate:1},
            {label:'entertainment', source:'action', rate:0.3},
            {label:'visit',source: 'action', rate:0.3},
        ]
    },
    {label:'nutrition', rate:0.05,ending:0.1,
        roles: ['gp','nurse','social_worker'],
        effects:[
            {label:'eat',source:'action',rate:1},
            {label:'cooking',source:'action',rate:1}
        ]
    },
    {label:'cleaning', rate:0.3,ending:0.2,
        effects:[
            {label:'housekeeping',source:'action', rate:1},
            {label:'laundry',source: 'action', rate:1},
            {label:'visit',source: 'action', rate:0.8},
            {label:'grooming',source: 'action', rate:0.2},
            {label:'cooking',source: 'action', rate:0.2},
            {label:'bathing',source: 'action', rate:0.2},
            {label:'toilet',source: 'action', rate:0.2},
        ]
    },
    {label:'running errands', rate:0.95,ending:1,
        effects:[
            {label:'eat',source: 'action',rate:0.3},
            {label:'visit',source: 'action', rate:1}
        ]
    },
    {label:'calling', rate:0.95, ending:1,
        roles: ['gp','nurse','ward','social worker','community worker'],
        effects:[
            {label:'entertainment',source:'action',rate:1},
            {label:'visit',source:'action',rate:0.8}
        ]
    },
    {label:'cooking', rate:0.3,ending:0.5,
        effects:[
            {label:'eat',source: 'action',rate:1},
            {label:'visit',source: 'action', rate:0.3}
        ]
    },
];