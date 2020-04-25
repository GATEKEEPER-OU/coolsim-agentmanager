const Clock = require('./clock');

module.exports = {
    costs:{
        ageing: ageingCost,
        conditions: conditionsCost,
        contingency: contingencyCost,
        weight: calcWeight
    },
    rate:{
        test: testRate,
        check: checkRate,
        rateToSeverity: rateToSeverity,
        severityToRate: severityToRate
    },
    time:{
        duration,
        Clock,
        scaleToRate:scaleToRate,
        rateToScale:rateToScale
    }
};

// cost based on the age beyond a threshold
function ageingCost(age) {
    // todo improve with a non-linear function
    const threshold = 50;
    // if age > threshold then 1% each year above the threshold
    return (age - threshold) > 0 ? (age - threshold)/100 : 0;
}

// cost based on the number of conditions
function conditionsCost(conditions = 0) {
    let num = 0;
    // managing different types set, array, maps
    if(Array.isArray(conditions)){
        num += conditions.length;
    } else if(conditions instanceof Set){
        num += conditions.size;
    } else if(conditions instanceof Map){
        num += conditions.size;
    } else if(!isNaN(conditions)){
        num += parseFloat(conditions);
    }
    // todo improve with a non-linear function
    // 1% each condition
    return num/100;
}
// combines const of age and conditions
function contingencyCost(age = 0, conditions = 0) {
    return ageingCost(age) + conditionsCost(conditions);
}

function calcWeight(rate,weight,age,conditions, modifier = 1) {
    if(!checkRate(rate,age,conditions,modifier)){
        return 0
    }
    let contingency = contingencyCost(age,conditions);
    return weight + (contingency * weight * modifier);
}

// just test a rate
function testRate(rate){
    return Math.random() > rate ? false : true;
}

// rate (eg. 0.1, {age,conditions} features of user state and arrays
// modifier: 1, -1 or 0 change the logic of adding or removing contingency cost from rate
function checkRate(rate,age,conditions,modifier = 1){
    if(isNaN(modifier)){modifier = 1;}
    if(isNaN(rate)){return false;}
    // calc rate
    if( Math.random() > (rate + (contingencyCost(age,conditions) * rate * modifier) ) ){
        return false;
    }
    return true;
}


// calculate duration
// input structure of {hours, errors:[array], extra: [array of conditions]
function duration({hours, errors},conditions = 0){
    // extra can be a number or an array of conditions
    let extraCost = conditionsCost(conditions);
    let duration = parseFloat(hours);
    let error = errors[Math.floor(Math.random() * errors.length)];
    console.log('........',error);
    // increase the error considering age and conditions (always slower, thus error is abs)
    error += (Math.abs(error) + extraCost );
    console.log('-----', duration,error,duration+error);
    return duration + error ;
}

// rate 1 => day
// rate = 0.7 (5/7) workday activity such as working
// rate = 0.14 weekly activity, such as grocery or house keeping
// rate = 0.07 biweekly activity, such as participate to a community meeting
// rate = 0.03 monthly activity, such as GP visit
function scaleToRate(scale){
    switch (scale){
        case 'day':
            return 1;
        case 'workday':
            return 0.7;
        case 'week':
            return 0.15;
        case 'bi-week':
            return 0.07;
        case 'month':
            return 0.03;
        case 'season':
            return 0.008;
        case 'year':
            return 0.002;
        default:
            return 0;
    }
}
function rateToScale(rate){
    if(rate == 0) return 'never';
    if(rate <= 0.002) return 'year';
    if(rate <= 0.008) return 'season';
    if(rate <= 0.03) return 'month';
    if(rate <= 0.07) return 'bi-week';
    if(rate <= 0.15) return 'week';
    if(rate <= 0.7) return 'work-day';
    return 'day';
}

// severity: 0 - 1
// 0 - 0.33 light,
// 0.33000001 - 0.6 mild,
// 0.6 - 1 sever
function severityToRate(severity){
    switch (severity){
        case 'light':
            return Math.min(1, Math.random() * 0.33333333333 );
        case 'mild':
            return Math.min(1, Math.random() * 0.33333333333 + 0.33333333334 );
        case 'sever':
            return Math.min(1, Math.random() * 3.33333333333 + 0.66666666667 );
        default:
            return 0;
    }
}
function rateToSeverity(rate){
    if(rate == 0) return 'none';
    if(rate <= 0.035) return 'light';
    if(rate <= 0.066) return 'bi-week';
    if(rate <= 0.15) return 'week';
    if(rate <= 0.7) return 'work-day';
    return 'day';
}