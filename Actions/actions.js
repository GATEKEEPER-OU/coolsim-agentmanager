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
//       type: category of risk
// benefit: representing the benefit of acting as cause of removing an existing condition, {rate, weight, type}
//       rate: probability of triggering an improvement
//       weight: value to remove to the severity or permanence of a condition
//       type: category of benefit
// duration:  duration in hours and errors (array of rates representing how much the duration can deviate [0.1,-0.1])

exports.actions = [
  {
    label:'sleep',
    type:'health',
    rate:1,
    risk:{
      rate:0.3,
      weight:0.1,
      type:'health'
    },
    benefit:{
      rate:0.05,
      weight:0.05,
      type:'health'
    },
    duration:{
      hours:8,
      errors:[-0.3,0.2]
    }
  },
  {
    label:'rest',
    type:'health',
    rate:1,
    risk:{
      rate:0.3,
      weight:0.1,
      type:'health'
    },
    benefit:{
      rate:0.05,
      weight:0.05,
      type:'health'
    },
    duration:{
      hours:1,
      errors:[-0.3,0.2]
    }
  },
  {
    label:'eat',
    type:'self',
    rate:1,
    risk:{
      rate:0.1,
      weight:0.1,
      type:'health'
    },
    benefit:{
      rate:0.05,
      weight:0.05,
      type:'health'
    },
    duration:{
      hours:1.5,
      errors:[-0.3,0.2]
    }
  },
  {
    label:'eat',
    type:'self',
    rate:1,
    risk:{
      rate:0.1,
      weight:0.1,
      type:'health'
    },
    benefit:{
      rate:0.05,
      weight:0.05,
      type:'health'
    },
    duration:{
      hours:1.5,
      errors:[-0.3,0.2]
    }
  }
];