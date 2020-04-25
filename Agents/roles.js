// agent's roles
// each agent can have a role a time
// roles: ['gp','nurse','social_worker','community_worker','ward','neighbour']
// label: name and key
// ratio: probability of having someone with the role
// type: default => ratio is 1 - sum of all other ratios

let roles = [
    {label:'gp',ratio:0.0001},
    {label:'nurse',ratio:0.005},
    {label:'social worker',ratio:0.001},
    {label:'community worker',ratio:0.01},
    {label:'ward',ratio:0.1},
    {label:'neighbour',type:'default'}
];

// set default ratio
let total = roles.reduce((sum,role)=> {
    if (role.ratio && !isNaN(role.ratio)) {
        return role.ratio + sum;
    }
    return sum;
},0);
roles.filter(role=>!!role.type)[0].ratio = 1 - total;

module.exports = roles;