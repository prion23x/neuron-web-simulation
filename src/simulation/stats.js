import {
    cx,
    cy,
    CYTOPLASM,
    ION_POPULATION,
    ION_STATS,
    _createZeroIonDict
} from "../config/config.js";



// Development of concentration gradient calculations
// ------part 1 : defining the base functions;


//helper function to check if ion inside cytoplasm
function _isIonInsideCytoplasm(ion) {
    const dx = ion.position.x - cx;
    const dy = ion.position.y - cy;
    return dx * dx + dy * dy < CYTOPLASM.radius * CYTOPLASM.radius;
}


// --------------------| Number Related |--------------------|


// Number of all ions in total
function getTotalIonsNum() {
    return ION_POPULATION.length;
}

// Number of specific ion in total
function getTotalIonNum(ionName) {
    let count = 0;
    for (const _ion of ION_POPULATION) {
        if (_ion.name === ionName) {
            count++;
        }
    }
    return count;
}

// Number of all ions inside the cytoplasm
function getIntraIonsNum() {
    let total = 0;
    for (const ion of ION_POPULATION) {
        if (_isIonInsideCytoplasm(ion)) {
            total++;
        }
    }
    return total;
}

// Number of specific ions inside the cytoplasm
function getIntraIonNum(ionName) {
    let total = 0;
    for (const ion of ION_POPULATION) {
        if (_isIonInsideCytoplasm(ion) && ion.name === ionName) {
            total++;
        }
    }
    return total;
}

// Number of all ions outside the cytoplasm
function getExtraIonsNum() {
    return getTotalIonsNum() - getIntraIonsNum();
}

// Number of specific ions outside the cytoplasm
function getExtraIonNum(ionName) {
    return getTotalIonNum(ionName) - getIntraIonNum(ionName);
}


// --------------------| Count {} Related |--------------------|


// Count of Ions in total
function getTotalIonsCount() {
    const counts = _createZeroIonDict() // a zero dict of ions, e.g., {Na:0, K:0, etc}
    for (const ion of ION_POPULATION) {
        counts[ion.name]++;
    }
    return counts;
}

// Count of Ions inside the cytoplasm
function getIntraIonsCount() {
    const intraCounts = _createZeroIonDict() // a zero dict of ions, e.g., {Na:0, K:0, etc}
    for (const ion of ION_POPULATION) {
        if (_isIonInsideCytoplasm(ion)) {
            intraCounts[ion.name]++;
        }
    }
    return intraCounts;
}

// Count of Ions outside the cytoplasm
function getExtraIonsCount() {
    const extraCounts = _createZeroIonDict() // a zero dict of ions, e.g., {Na:0, K:0, etc}
    for (const ion of ION_POPULATION) {
        if (!_isIonInsideCytoplasm(ion)) {
            extraCounts[ion.name]++;
        }
    }
    return extraCounts;
}

// Count of Ions inside, outside, and in total (separately)
// More efficient to use than separate getExtraIonsCount() / getIntraIonsCount()
// returns {intra: ..., extra: ..., total: ...}
function getIonsCountsByLocation() {
    const intra = _createZeroIonDict();
    const extra = _createZeroIonDict();
    const total = _createZeroIonDict();

    for (const ion of ION_POPULATION) {
        total[ion.name]++;
        if (_isIonInsideCytoplasm(ion)) {
            intra[ion.name]++;
        } else {
            extra[ion.name]++;
        }
    }

    return { intra, extra, total };
}


// --------------------| Gradient Related |--------------------|


// Concentration Gradient (intra:extra) of specific ion 
// In other words, concentrationof specific ion inside the cytoplasm
// Example: 10 of Na inside and 90 outside => returns 0.1 (=10%)
export function getIonConcentrationGradient(ionName) {
    const intraNum = getIntraIonNum(ionName);
    const totalNum = getTotalIonNum(ionName);
    return intraNum / (totalNum || 1); // 1 if all inside; 0 if all outside
}

export function getIonsConcentrationGradients() {
    const counts = _createZeroIonDict();
    for (const ionName of Object.keys(counts)) {
        const intraNum = getIntraIonNum(ionName);
        const totalNum = getTotalIonNum(ionName);
        counts[ionName] = intraNum / (totalNum || 1);
    }
    return counts;
}

// Ratio of concentraion of specific ion {intra: x, extra: y} (x+y=1) 
// Example: 10 of Na inside and 90 outside => returns {intra: 0.1 , extra: 0.9} 
function getIonConcentrationRatios(ionName) {
    const intraNum = getIntraIonNum(ionName);
    const extraNum = getExtraIonNum(ionName);
    const totalNum = getTotalIonNum(ionName);
    return {
        intra: intraNum / (totalNum || 1),
        extra: extraNum / (totalNum || 1)
    }
}

export function getIonsConcentrationRatios() {
    const counts = _createZeroIonDict();
    for (const ionName of Object.keys(counts)) {
        counts[ionName] = getIonConcentrationRatios(ionName);
    }
    return counts;
}


setInterval(() => {
    ION_STATS.TOTAL_IONS_NUM = getTotalIonsNum();
    ION_STATS.INTRA_IONS_NUM = getIntraIonsNum();
    ION_STATS.EXTRA_IONS_NUM = getExtraIonsNum();

    ION_STATS.TOTAL_IONS_COUNT = getTotalIonsCount();
    ION_STATS.INTRA_IONS_COUNT = getIntraIonsCount();
    ION_STATS.EXTRA_IONS_COUNT = getExtraIonsCount();

    ION_STATS.ION_GRADIENTS = getIonsConcentrationGradients();
    ION_STATS.ION_RATIOS = getIonsConcentrationRatios();

    // console.log(getIonConcentrationGradient("Na"));
}, 200);
