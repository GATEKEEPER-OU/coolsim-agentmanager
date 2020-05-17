import Bootstrap from "../../Bootstrap/index.js";
import Utils from "../../Utils/index.js";
import _ from "lodash";
const Rate = Utils.rate;


export default class Status{
    STATUS = Bootstrap.user.STATUS;



    constructor(status){
        this.current = status;

        this.final = status;
    }

    check(age,conditions = []){
        if(!age && isNaN(age)){throw new Error(`Age mandatory, got ${age}`)}
        if(!conditions && !Array.isArray(conditions)){throw new Error(`Conditions mandatory, got ${conditions}`)}

        if(this.final){
            return
        }

        // console.log(`check status from being "${current}" among the list \n`,STATUS);
        // get list of status which allow current status to transit from
        let declineList = this.STATUS
            .filter(e => this._checkFrom(e,'decline',this.current) )
            .filter(e => this._checkFactors(e.decline.factors) );
        // console.log(`Am i declining?\n`,declineList);

        let improveList = this.STATUS
            .filter(e => this._checkFrom(e,'improve',this.current) )
            .filter(e => this._checkFactors(e.improve.factors) );
        // console.log(`Am i improving?\n`,improveList);

        // check decline
        if(declineList.length > 0){
            // console.log("decline",declineList[0].label);
            this.current = declineList[0].label;
        }
        // check improvement
        else if(improveList.length > 0){
            // console.log("improvement",improveList[0].label);
            this.current = improveList[0].label;
        }


        return this.current;
    }


    set current(status){
        if(this.final){return}
        // console.log("~",status);
        if(!status){
            this._current = Rate.pickOne(this.STATUS);
        } else {
            let r = _.find(this.STATUS,["label",status]);
            if(!r){
                throw new Error(`Unknown status ${status}`)
            }
            this._current = r;
        }

        this.final = this._current;
    }
    get current(){
        return this._current.label;
    }


    set final(status){
        this._final = (status.type && status.type === "final") || false;
    }
    get final(){
        return this._final;
    }

    _checkFrom(e,field,status){
        // same state
        if(e.label === status){return false;}
        // check it is a decline and include current state in the from list
        if(!e || !e[field] || !e[field].from){
            return false;
        }
        return new Set(e[field].from).has(status);
    }

    _checkFactors(factors,age,conditions=[]){
        return factors.reduce((partial,f)=>{
            // check requirements
            if(f.factor === 'age' && age < f.severity){
                return false;
            }else if(f.type === 'condition' && !_.find(conditions,["label",f.type]) ){
                return false;
            }
            // test rate
            return (partial && Rate.test(f.rate) );

        },true);
    }
}