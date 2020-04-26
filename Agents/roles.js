import {rate as Rate} from '../Utils/index.js';
// agent's roles
// each agent can have a role a time
// roles: ['gp','nurse','social_worker','community_worker','ward','neighbour']
// label: name and key
// rate: probability of having someone with the role
// skills: [array] of skills a role has as requirement
// type: default => ratio is 1 - sum of all other ratios

let roles = [
    {label:'gp',rate:0.001,skills:['health visit','first aid','nutrition','calling']},
    {label:'nurse',rate:0.005,skills:['health visit','first aid','nutrition','calling']},
    {label:'social worker',rate:0.001,skills:['counseling','nutrition','calling']},
    {label:'community worker',rate:0.01,skills:['counseling','calling']},
    {label:'ward',rate:0.1,skills:['first aid','calling']},
    {label:'neighbour',type:'default'}
];

// calc default
roles = Rate.defaultRate(roles);

export const ROLES = roles;