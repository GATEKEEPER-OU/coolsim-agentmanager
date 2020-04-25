// agent's skills
// label: name and key
// ratio: probability of having a skill
// roles: default for a set of roles
// effects:[array] what can cause to a subject
//         {label, source (list of effect), ratio (override the origin ratio}

module.exports = [
    {label:'health visit',ratio:0.1,
        roles: ['gp','nurse','ward'],
        effects:[
            {label:'check-up',source:'action',rate:1},
            {label:'visit',source: 'action', rate:1},
            {label:'exercise',source:'action', rate:0.5}
        ]
    },
    {label:'first aid',ratio:0.1,
        roles: ['gp','nurse','ward'],
        effects:[
            {label:'check-up',source:'action',rate:0.8}
        ]
    },
    {label:'counseling', ratio:0.05,
        roles: ['social worker','community worker'],
        effects:[
            {label:'visit',source: 'action', rate:1},
            {label:'check-up',source:'action',rate:0.5}
        ]
    },
    {label:'driving', ratio:0.3,
        effects:[
            {label:'going out',source: 'action', rate:1},
            {label:'grocery',source: 'action', rate:0.6},
        ]
    },
    {label:'fitness', ratio:0.05,
        effects:[
            {label:'exercises', source:'action',rate:1},
            {label:'entertainment', source:'action', rate:0.3},
            {label:'visit',source: 'action', rate:0.3},
        ]
    },
    {label:'nutrition', ratio:0.05,
        roles: ['gp','nurse','social_worker'],
        effects:[
            {label:'eat',source:'action',rate:1},
            {label:'cooking',source:'action',rate:1}
        ]
    },
    {label:'cleaning', ratio:0.3,
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
    {label:'running errands', ratio:0.95,
        effects:[
            {label:'eat',source: 'action',rate:0.3},
            {label:'visit',source: 'action', rate:1}
        ]
    },
    {label:'calling', ratio:0.95, roles: ['gp','nurse','ward','social worker','community worker'],
        effects:[
            {label:'entertainment',source:'action',rate:1},
            {label:'visit',source:'action',rate:0.8}
        ]
    },
    {label:'cooking', ratio:0.3,
        effects:[
            {label:'eat',source: 'action',rate:1},
            {label:'visit',source: 'action', rate:0.3}
        ]
    },
];