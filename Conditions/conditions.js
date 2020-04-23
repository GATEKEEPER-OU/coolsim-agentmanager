// list of conditions
// label: '', e.g. depression
// type: ['mental','social','physical','behavioural']
// duration: ['temporary','permanent','chronic'] // temporary can only get better, permanent can only get worse, chronic cannot be deleted
// severity: 0 - 1 // 0 - 0.3 light, 0.3 - 0.6 mild, 0.6 - 1 sever
// progression: {
//      scale: a time scale, e.g. 'day' 'month' ,
//      rate: 0 to 1, // probability of weight increment
//      weight: -1 to 1, // gets more or less severe and how much over time
// }

exports.list = () => [
    { label:'depression', type: 'mental', duration:'chronic', severity:0.5, progression: {
        scale: 'day',
        rate: 0.2,
        weight: 0.2,
        }
    },
    { label:'paranoia', type: 'mental', duration:'chronic', severity:0.5, progression: {
        scale: 'day',
        rate: 0.2,
        weight: 0.2,
        }
    },
    { label:'diabetes', type: 'physical', duration:'chronic', severity:0.3, progression: {
        scale: 'day',
        rate: 0.1,
        weight: 0.01,
        }
    },
    { label:'isolation', type: 'behavioral', duration:'temporary', severity:0.1, progression: {
        scale: 'month',
        rate: 0.1,
        weight: 0.05,
        }
    },
    { label:'self-isolation', type: 'behavioral', duration:'temporary', severity:0.1, progression: {
        scale: 'month',
        rate: 0.1,
        weight: 0.05,
        }
    },
    { label:'loneliness', type: 'mental', duration:'temporary', severity:0.2, progression: {
        scale: 'month',
        rate: 0.1,
        weight: 0.05,
        }
    },
    { label:'eat disorder', type: 'behavioural', duration:'chronic', severity:0.2, progression: {
        scale: 'month',
        rate: 0.01,
        weight: 0.05,
        }
    },
    { label:'metabolic disorder', type: 'health', duration:'chronic', severity:0.3, progression: {
        scale: 'month',
        rate: 0.01,
        weight: 0.05,
        }
    },
    { label:'rheumatic diseases', type: 'health', duration:'chronic', severity:0.5, progression: {
        scale: 'month',
        rate: 0.01,
        weight: 0.05,
        }
    },
    { label:'exhaustion', type: 'health', duration:'temporary', severity:0.1, progression: {
        scale: 'day',
        rate: 0.01,
        weight: 0.05,
        }
    },
    { label:'cancer', type: 'health', duration:'chronic', severity:0.8, progression: {
        scale: 'monthly',
        rate: 0.3,
        weight: 0.5,
        }
    },
    { label:'heart disease', type: 'health', duration:'chronic', severity:0.6, progression: {
        scale: 'weekly',
        rate: 0.1,
        weight: 0.1,
        }
    },
    { label:'flu', type: 'health', duration:'temporary', severity:0.4, progression: {
        scale: 'day',
        rate: 0.1,
        weight: -0.1,
        }
    },
    { label:'injury', type: 'health', duration:'temporary', severity:0.4, progression: {
        scale: 'day',
        rate: 0.1,
        weight: -0.1,
        }
    },
    { label:'impairment', type: 'health', duration:'permanent', severity:0.5, progression: {
        scale: 'month',
        rate: 0.05,
        weight: 0.01,
        }
    },
    { label:'dementia', type: 'health', duration:'permanent', severity:0.7, progression: {
        scale: 'month',
        rate: 0.1,
        weight: 0.1,
        }
    }
];
