import Bootstrap from '../../configuration/index.js';
import Utils from '../../utilities/index.js';

const ACTIONS = Bootstrap.user.ACTIONS;

const Costs = Utils.cost;
const Rate = Utils.rate;
const Time = Utils.time;

// actions have a cost and risk factor related to the agent's state
// agents get the daily list and choose which actions to carry on and which not
// class Actions.remind() returns a list of suggested actions of the day
// class Actions.outcomes() returns the outcome of performed and skipped actions
export default class Actions {
  HOURS = 24;
  ACTIONS = ACTIONS;
  constructor(age = 30) {
    this.age = age;
  }
  set setAge(age) {
    this.age = age;
  }
  get list() {
    return this.ACTIONS;
  };
  static get getActions() { return ACTIONS; }

  // calc list of suggested actions of the day
  remind(conditions) {
    return Array.from(this.list.reduce((partial, action) => {
      // check if it falls in the list
      // modifier 1 add rate, -1 remove rate
      let modifier = 0;
      switch (action.type) {
        case 'physical':
          modifier = 1;
          break;
        case 'self':
          modifier = 0;
          break;
        case 'socialization':
          modifier = -1;
          break;
        case 'culture':
          modifier = -1;
          break;
        case 'health':
          modifier = 1;
          break;
        default: // basic
          modifier = 1;
      }
      if (!Rate.check(action.rate, this.age, conditions, modifier)) {
        return partial;
      }
      // add the action to the list
      partial.add(Object.assign({}, action));
      return partial;
    }, new Set()));
  }

  // calc of outcomes
  outcomes(acts = [], skips = [], conditions = [], hours = 0) {
    if (acts instanceof Set) {
      acts = Array.from(acts);
    } else if (acts instanceof Map) {
      acts = Array.from(acts)
    }

    // console.log('asdaaaaaaaaaa',skips);
    if (!skips) { skips = []; }
    if (skips instanceof Set) {
      skips = Array.from(skips);
    } else if (acts instanceof Map) {
      skips = Array.from(skips)
    }

    // evaluate acts
    let { furtherSkips, positive, time, duration } = this._acting(acts, conditions, hours);
    // console.log('check check check check',skips,furtherSkips);
    // evaluate skips
    let { negative } = this._skipping(skips.concat(furtherSkips), conditions);
    // return outcome and time spent
    return { positive, negative, time, duration };
  }

  // internal methods
  _acting(acts, conditions, hours) {
    // calc outcomes and further skips based on the calc of durations and benefits
    return acts.reduce((partial, action) => {
      // check if there is still time to act
      let duration = Time.duration(action.duration, conditions);
      if (partial.time + duration > this.HOURS - hours) {

        // no time to carry out this action
        partial.furtherSkips.push(action);
        return partial;
      }
      // update spent time
      partial.time += duration;
      // calc of benefits
      let outcomes = this._outcomes(action.benefits, 'benefits', conditions);
      // update outcomes
      // for each type of benefit
      for (let outcome in outcomes) {
        // benefit value
        let value = outcomes[outcome];
        // if there is already a key in the map
        if (partial.positive.has(outcome)) {
          // add prior value to the current one
          value += partial.positive.get(outcome);
        }
        // update value of the type of outcome
        partial.positive.set(outcome, value);
        partial.duration.set(action.label, duration);
      }
      return partial;
    },
      {
        positive: new Map(),
        duration: new Map(),
        furtherSkips: [],
        time: 0
      });
  }

  // evaluate outcomes of skipped actions
  _skipping(skips, conditions = []) {
    // calc the risks related to the skips (action not performed)
    let outcomes = skips.reduce((partial, skip) => {
      // calc of new risks
      let actionOutcomes = this._outcomes(skip.risks, 'risks', conditions);
      // update outcomes
      // for each type of benefit
      for (let outcome in actionOutcomes) {
        // benefit value
        let value = actionOutcomes[outcome];
        // if there is already a key in the map
        if (partial.has(outcome)) {
          // add prior value to the current one
          value += partial.get(outcome);
        }
        // update value of the type of outcome
        partial.set(outcome, value);
      }
      return partial;
    }, new Map());
    // returns negative outcomes
    return { negative: outcomes };
  }

  // calculate rate of an outcome
  _outcomes(events, decision, conditions) {
    // set modifier
    let modifier = 1;

    // if benefits then conditions and age lower the benefit and reduce the rate
    if (decision === 'benefits') {
      // make it a negative value to subtract to benefits
      modifier = -1;
    }

    //calc returns array [{type:weight}, ... ]
    return events.reduce((partial, { rate, weight, type }) => {
      let cost = Costs.weight(rate, weight, this.age, conditions, modifier);
      // else, update weight of outcome
      partial[type] = !partial[type] ? cost : partial[type] + cost;

      return partial;
    }, {});
  }
}