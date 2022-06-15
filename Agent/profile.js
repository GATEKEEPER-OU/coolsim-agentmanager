import Bootstrap from "../../configuration/index.js";
import Utils from "../../utilities/index.js";

import uniqid from 'uniqid';

const Rate = Utils.rate;
const USER = Bootstrap.user;

export default class Profile{
    PROFILE = USER.PROFILE;
    STATUS = USER.STATUS;
    ROLES = USER.ROLES;
    SKILLS = USER.SKILLS;
    DIST = Utils.Distribution;

    constructor(){
        this.profileGenerator = this._profile();
    }

    get profile(){
        return this.profileGenerator.next().value;
    }

    * _profile () {
        while(true) {
            let profile = {
                id:uniqid("agent-")
            };
            this.PROFILE.forEach(field=>{
                let {label,type,correction} = field;
                // generate type of random
                let num = type === "normal" ? this.DIST.normal() : this.DIST.uniform();
                // apply correction and set the field
                profile[label] = correction(num);
            });
            //
            profile.status = (Rate.pickOne(this.STATUS)).label;
            // init role
            profile.role = (Rate.pickOne(this.ROLES)).label;

            profile.skills = this.SKILLS.filter(s=>(Rate.test(s.rate)).label);

            yield profile;
        }
    }


    // find a role
    getRole(role){
        if(!role){ throw new Error(`Role mandatory, got ${role}`); }

        let roles = this.ROLES.filter(entry => (entry.label===role) );

        if(roles.length < 1){ throw new Error(`Unknown role ${role}`); }

        return roles[0].label;
    }


    getSkills(skills){
        // init skills
        let skillSet;
        if(!Array.isArray(skills)){throw new Error(`Skills must be an array, got ${skills}`);}

        let agentSkills = new Set(skills);
        // generate new conditions
        skillSet = this.SKILLS.filter(skill=> agentSkills.has(skill.label) );

        return skillSet;
    }

}