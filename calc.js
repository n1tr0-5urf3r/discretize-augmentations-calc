function calc() {
    const result = calc_internal();

    const elem = document.getElementById("result");

    elem.innerText = JSON.stringify(result, null, "\t");
}


function calc_internal() {
    let aug = document.getElementById("aug").value;
    let relics = document.getElementById("relics").value;
    let pristine = document.getElementById("prelics").value;
    let matrices = document.getElementById("matrices").value;
    let journals = document.getElementById("journals").value;
    let pages = document.getElementById("pages").value;
    let cm100 = document.getElementById("cm100").checked;
    let cm99 = document.getElementById("cm99").checked;
    let cm98 = document.getElementById("cm98").checked;
    let t4 = document.getElementById("t4").checked;
    let recs = document.getElementById("recs").checked;
    let weeklyT4 = document.getElementById("weeklyT4").checked;
    let conv = document.getElementById("conv").checked;

    let result = calculate(
        {
            relics: relics,
            pristines: pristine,
            matrices: matrices,
            augment: aug,
            journals: journals,
            pages: pages,
            cm100: cm100,
            cm99: cm99,
            cm98: cm98,
            t4s: t4,
            weekly: weeklyT4,
            recs: recs,
            convertPots: conv,
        });

    return result
}

const MIST_ATTUNEMENTS = [
    {
        id: 299,
        name: 'Mist Attunement 1',
        title: 'Fractal Savant',
        relics: 25000,
        pristines: 0,
        matrices: 75,
        journals: 8,
    },
    {
        id: 297,
        name: 'Mist Attunement 2',
        title: 'Fractal Prodigy',
        relics: 35000,
        pristines: 1200,
        matrices: 150,
        journals: 0,
    },
    {
        id: 296,
        name: 'Mist Attunement 3',
        title: 'Fractal Champion',
        relics: 45000,
        pristines: 0,
        matrices: 225,
        journals: 16,
    },
    {
        id: 298,
        name: 'Mist Attunement 4',
        title: 'Fractal God',
        relics: 55000,
        pristines: 2000,
        matrices: 300,
        journals: 0,
    },
];

function div(a, b) {
    if (typeof a !== 'number') {
        console.log(a);
        return 0;
    }
    if (typeof b !== 'number') {
        return 0;
    }

    return Math.floor(a / b);
}

function m_to_r(t_r, t_m, gain_r, augment, matrix_by_day, r_to_m_t) {
    let r_time_overload_t = 0;
    if (div(t_r.v, (gain_r + augment)) < div(t_m.v, matrix_by_day)) {
        r_time_overload_t = div(t_m.v, matrix_by_day) - div(t_r.v, (gain_r + augment));
    } else {
        r_time_overload_t = 0;
    }

    if (t_m.v !== 0) {
        r_to_m_t.v += div((t_m.v * r_time_overload_t), div(t_m.v, matrix_by_day));
        t_r.v += (t_m.v * r_time_overload_t) / (t_m.v / matrix_by_day) * 15;
        t_m.v -= r_to_m_t.v;
    }
}

function resteAppreAchat(
    norm_dura_t,
    t_r,
    t_p,
    t_m,
    t_j,
    gain_r,
    pristines_by_day,
    matrix_by_day,
    pages_by_day,
    augment_base_gain,
    tier,
    reste_r,
    reste_p,
    reste_m,
    reste_j,
) {
    if (norm_dura_t > div(t_r, gain_r + augment_base_gain * tier)) {
        reste_r.v +=
            (gain_r + augment_base_gain * tier) *
            (norm_dura_t - div(t_r, gain_r + augment_base_gain * tier));
    }

    if (norm_dura_t > div(t_p, pristines_by_day)) {
        reste_p.v += pristines_by_day * (norm_dura_t - div(t_p, pristines_by_day));
    }

    if (norm_dura_t > div(t_m, matrix_by_day)) {
        reste_m.v += matrix_by_day * (norm_dura_t - div(t_m, matrix_by_day));
    }

    if (norm_dura_t > div(t_j, pages_by_day)) {
        reste_j.v += pages_by_day * (norm_dura_t - div(t_j, pages_by_day));
    }
}

function timeMiniTier(
    t_r,
    t_p,
    t_m,
    t_j,
    gain_r,
    pristines_by_day,
    matrix_by_day,
    pages_by_day,
    augment_base_gain,
    tier,
) {
    let norm_dura_t = 0;

    if (div(t_r, gain_r) > div(t_p, pristines_by_day)) {
        norm_dura_t = div(t_r, gain_r + tier * augment_base_gain);
    } else {
        norm_dura_t = div(t_p, pristines_by_day);
    }

    if (norm_dura_t < div(t_m, matrix_by_day)) {
        norm_dura_t = div(t_m, matrix_by_day);
    }

    if (norm_dura_t < div(t_j, pages_by_day)) {
        norm_dura_t = div(t_j, pages_by_day);
    }

    return norm_dura_t;
}

function coutMoinReste(t_r, reste) {
    let x = t_r - reste.v;

    if (x <= 0) {
        reste.v -= t_r;
        t_r = 0;
    } else {
        t_r -= reste.v;
        reste.v = 0;
    }
    return t_r;
}

const calculate = ({
                       relics: rawRelics,
                       pristines: rawPristines,
                       matrices: rawMatrices,
                       augment: rawAugment,
                       journals: rawJournals,
                       pages: rawPages,
                       cm100: raw100,
                       cm99: raw99,
                       cm98: raw98,
                       t4s: rawT4,
                       recs: rawRecs,
                       weekly: rawWeekly,
                       convertPots: rawConvertPots,
                   }) => {
    let relics = rawRelics;
    let pristines = rawPristines;
    let matrix = rawMatrices;
    let journals = rawJournals;
    let pages = rawPages + rawJournals * 28;
    let augment = rawAugment;

    let cm100 = raw100;
    let cm99 = raw99;
    let cm98 = raw98;
    let t4 = rawT4;
    let recs = rawRecs;
    let weekly = rawWeekly;
    let convert_pots = rawConvertPots;

    /* Output declaration */

    // total tier cost
    let total_cost_t1_r = MIST_ATTUNEMENTS[0].relics;
    let total_cost_t1_p = MIST_ATTUNEMENTS[0].pristines;
    let total_cost_t1_m = MIST_ATTUNEMENTS[0].matrices;
    let total_cost_t1_j = MIST_ATTUNEMENTS[0].journals;
    let total_cost_t2_r = total_cost_t1_r + MIST_ATTUNEMENTS[1].relics;
    let total_cost_t2_p = total_cost_t1_p + MIST_ATTUNEMENTS[1].pristines;
    let total_cost_t2_m = total_cost_t1_m + MIST_ATTUNEMENTS[1].matrices;
    let total_cost_t2_j = total_cost_t1_j + MIST_ATTUNEMENTS[1].journals;
    let total_cost_t3_r = total_cost_t2_r + MIST_ATTUNEMENTS[2].relics;
    let total_cost_t3_p = total_cost_t2_p + MIST_ATTUNEMENTS[2].pristines;
    let total_cost_t3_m = total_cost_t2_m + MIST_ATTUNEMENTS[2].matrices;
    let total_cost_t3_j = total_cost_t2_j + MIST_ATTUNEMENTS[2].journals;
    let total_cost_t4_r = total_cost_t3_r + MIST_ATTUNEMENTS[3].relics;
    let total_cost_t4_p = total_cost_t3_p + MIST_ATTUNEMENTS[3].pristines;
    let total_cost_t4_m = total_cost_t3_m + MIST_ATTUNEMENTS[3].matrices;
    let total_cost_t4_j = total_cost_t3_j + MIST_ATTUNEMENTS[3].journals;

    // Gain per day
    let relics_by_day =
        cm100 * (139 + augment * 5) +
        cm99 * (159 + augment * 5) +
        cm98 * (159 + augment * 5) +
        t4 * (54 + augment * 15) +
        recs * (34 + augment * 11) +
        weekly * 7 +
        convert_pots * 48;
    let pristines_by_day = cm100 * 2 + cm99 * 2 + cm98 * 2 + t4 * 12 + recs * 3;
    let matrix_by_day = cm100 * 1 + cm99 * 1 + cm98 * 1;
    let pages_by_day =
        cm100 * 1 + cm99 * 1 + cm98 * 1 + recs * 3 + weekly * 0.285714285714285;

    // normal duration
    let norm_dura_t1_r, norm_dura_t1_p, norm_dura_t1_m, norm_dura_t1_j = 0;
    let norm_dura_t2_r, norm_dura_t2_p, norm_dura_t2_m, norm_dura_t2_j = 0;
    let norm_dura_t3_r, norm_dura_t3_p, norm_dura_t3_m, norm_dura_t3_j = 0;
    let norm_dura_t4_r, norm_dura_t4_p, norm_dura_t4_m, norm_dura_t4_j = 0;

    // ideal conversions
    let p_to_r_t1 = 0;
    let r_to_m_t1 = {v: 0};
    let p_to_r_t2 = 0;
    let r_to_m_t2 = {v: 0};
    let p_to_r_t3 = 0;
    let r_to_m_t3 = {v: 0};
    let p_to_r_t4 = 0;
    let r_to_m_t4 = {v: 0};

    // ideal duration
    let t1_time = 0;
    let t2_time = 0;
    let t3_time = 0;
    let t4_time = 0;

    /* calculation declaration */

    // gain des augmentation de chaque tier (r)
    let augment_by_day_t1 = (cm100 * 5 + cm99 * 5 + cm98 * 5 + t4 * 15 + recs * 11);
    let augment_by_day_t2 = 2 * (cm100 * 5 + cm99 * 5 + cm98 * 5 + t4 * 15 + recs * 11);
    let augment_by_day_t3 = 3 * (cm100 * 5 + cm99 * 5 + cm98 * 5 + t4 * 15 + recs * 11);
    let augment_by_day = augment * (cm100 * 5 + cm99 * 5 + cm98 * 5 + t4 * 15 + recs * 11);
    let augment_base_gain = cm100 * 5 + cm99 * 5 + cm98 * 5 + t4 * 15 + recs * 11;

    // relics par jour
    let gain_r = relics_by_day - augment_by_day;

    // coup des tier (les journal sont en pages)
    let t1_r = {v: MIST_ATTUNEMENTS[0].relics};
    let t2_r = {v: MIST_ATTUNEMENTS[1].relics};
    let t3_r = {v: MIST_ATTUNEMENTS[2].relics};
    let t4_r = {v: MIST_ATTUNEMENTS[3].relics};
    let t1_p = {v: MIST_ATTUNEMENTS[0].pristines};
    let t2_p = {v: MIST_ATTUNEMENTS[1].pristines};
    let t3_p = {v: MIST_ATTUNEMENTS[2].pristines};
    let t4_p = {v: MIST_ATTUNEMENTS[3].pristines};
    let t1_m = {v: MIST_ATTUNEMENTS[0].matrices};
    let t2_m = {v: MIST_ATTUNEMENTS[1].matrices};
    let t3_m = {v: MIST_ATTUNEMENTS[2].matrices};
    let t4_m = {v: MIST_ATTUNEMENTS[3].matrices};
    let t1_j = {v: MIST_ATTUNEMENTS[0].journals * 28};
    let t2_j = {v: MIST_ATTUNEMENTS[1].journals * 28};
    let t3_j = {v: MIST_ATTUNEMENTS[2].journals * 28};
    let t4_j = {v: MIST_ATTUNEMENTS[3].journals * 28};

    // relics que l'on a déjà et les reste a l'achat
    // pack into an object so we can keep those values accross different functions since js doesnt know "references"
    let reste_r = {v: relics};
    let reste_p = {v: pristines};
    let reste_m = {v: matrix};
    let reste_j = {v: pages};

    // normal duration pour affichage
    norm_dura_t1_r = div(MIST_ATTUNEMENTS[0].relics, relics_by_day);
    norm_dura_t1_p = div(MIST_ATTUNEMENTS[0].pristines, pristines_by_day);
    norm_dura_t1_m = div(MIST_ATTUNEMENTS[0].matrices, matrix_by_day);
    norm_dura_t1_j = div(MIST_ATTUNEMENTS[0].journals, pages_by_day);
    norm_dura_t2_r = div(MIST_ATTUNEMENTS[1].relics, relics_by_day);
    norm_dura_t2_p = div(MIST_ATTUNEMENTS[1].pristines, pristines_by_day);
    norm_dura_t2_m = div(MIST_ATTUNEMENTS[1].matrices, matrix_by_day);
    norm_dura_t2_j = div(MIST_ATTUNEMENTS[1].journals, pages_by_day);
    norm_dura_t3_r = div(MIST_ATTUNEMENTS[2].relics, relics_by_day);
    norm_dura_t3_p = div(MIST_ATTUNEMENTS[2].pristines, pristines_by_day);
    norm_dura_t3_m = div(MIST_ATTUNEMENTS[2].matrices, matrix_by_day);
    norm_dura_t3_j = div(MIST_ATTUNEMENTS[2].journals, pages_by_day);
    norm_dura_t4_r = div(MIST_ATTUNEMENTS[3].relics, relics_by_day);
    norm_dura_t4_p = div(MIST_ATTUNEMENTS[3].pristines, pristines_by_day);
    norm_dura_t4_m = div(MIST_ATTUNEMENTS[3].matrices, matrix_by_day);
    norm_dura_t4_j = div(MIST_ATTUNEMENTS[3].journals, pages_by_day);


    // augmentation déjà acheter

    //augmentation déjà acheter
    if (augment === 1) {
        t1_r.v = 0;
        t1_p.v = 0;
        t1_m.v = 0;
        t1_j.v = 0;
        norm_dura_t1_r = 0;
        norm_dura_t1_p = 0;
        norm_dura_t1_m = 0;
        norm_dura_t1_j = 0;
    }
    else if (augment === 2) {
        t1_r.v = 0;
        t1_p.v = 0;
        t1_m.v = 0;
        t1_j.v = 0;
        t2_r.v = 0;
        t2_p.v = 0;
        t2_m.v = 0;
        t2_j.v = 0;
        norm_dura_t1_r = 0;
        norm_dura_t1_p = 0;
        norm_dura_t1_m = 0;
        norm_dura_t1_j = 0;
        norm_dura_t2_r = 0;
        norm_dura_t2_p = 0;
        norm_dura_t2_m = 0;
        norm_dura_t2_j = 0;
    }
    else if (augment === 3) {
        t1_r.v = 0;
        t1_p.v = 0;
        t1_m.v = 0;
        t1_j.v = 0;
        t2_r.v = 0;
        t2_p.v = 0;
        t2_m.v = 0;
        t2_j.v = 0;
        t3_r.v = 0;
        t3_p.v = 0;
        t3_m.v = 0;
        t3_j.v = 0;
        norm_dura_t1_r = 0;
        norm_dura_t1_p = 0;
        norm_dura_t1_m = 0;
        norm_dura_t1_j = 0;
        norm_dura_t2_r = 0;
        norm_dura_t2_p = 0;
        norm_dura_t2_m = 0;
        norm_dura_t2_j = 0;
        norm_dura_t3_r = 0;
        norm_dura_t3_p = 0;
        norm_dura_t3_m = 0;
        norm_dura_t3_j = 0;
    }
    else if (augment === 4) {
        t1_r.v = 0;
        t1_p.v = 0;
        t1_m.v = 0;
        t1_j.v = 0;
        t2_r.v = 0;
        t2_p.v = 0;
        t2_m.v = 0;
        t2_j.v = 0;
        t3_r.v = 0;
        t3_p.v = 0;
        t3_m.v = 0;
        t3_j.v = 0;
        t4_r.v = 0;
        t4_p.v = 0;
        t4_m.v = 0;
        t4_j.v = 0;
        norm_dura_t1_r = 0;
        norm_dura_t1_p = 0;
        norm_dura_t1_m = 0;
        norm_dura_t1_j = 0;
        norm_dura_t2_r = 0;
        norm_dura_t2_p = 0;
        norm_dura_t2_m = 0;
        norm_dura_t2_j = 0;
        norm_dura_t3_r = 0;
        norm_dura_t3_p = 0;
        norm_dura_t3_m = 0;
        norm_dura_t3_j = 0;
        norm_dura_t4_r = 0;
        norm_dura_t4_p = 0;
        norm_dura_t4_m = 0;
        norm_dura_t4_j = 0;
    }

    // décremente les resource que l'on posséde
    t1_r.v = coutMoinReste(t1_r.v, reste_r);
    t1_p.v = coutMoinReste(t1_p.v, reste_p);
    t1_m.v = coutMoinReste(t1_m.v, reste_m);
    t1_j.v = coutMoinReste(t1_j.v, reste_j);

    t2_r.v = coutMoinReste(t2_r.v, reste_r);
    t2_p.v = coutMoinReste(t2_p.v, reste_p);
    t2_m.v = coutMoinReste(t2_m.v, reste_m);
    t2_j.v = coutMoinReste(t2_j.v, reste_j);

    t3_r.v = coutMoinReste(t3_r.v, reste_r);
    t3_p.v = coutMoinReste(t3_p.v, reste_p);
    t3_m.v = coutMoinReste(t3_m.v, reste_m);
    t3_j.v = coutMoinReste(t3_j.v, reste_j);
    //gg

    t4_r.v = coutMoinReste(t4_r.v, reste_r);
    t4_p.v = coutMoinReste(t4_p.v, reste_p);
    t4_m.v = coutMoinReste(t4_m.v, reste_m);
    t4_j.v = coutMoinReste(t4_j.v, reste_j);

    /* Calcul */
    let p_to_r_time_overload_t4 = 0;
    let p_to_r_time_overload_t3 = 0;
    let p_to_r_time_overload_t2 = 0;
    let p_to_r_time_overload_t1 = 0;
    let p_time_overload_t4 = 0;
    let p_time_overload_t3 = 0;
    let p_time_overload_t2 = 0;

    /* --------------------------------------------------------------------Si m > r--------------------------------------------------------------------------*/

    // Si time m > time r ## si oui m time - r time = r time overload ## si non r time overload = 0

    // réajuste les coup des tier pour que ça prenne en compte les m time overload des tier
    /*
      cout | time
    180  | 60
         | 50

    180 - x = reste * 15
    */

    m_to_r(t4_r, t4_m, gain_r, augment_by_day_t3, matrix_by_day, r_to_m_t4);
    m_to_r(t3_r, t3_m, gain_r, augment_by_day_t2, matrix_by_day, r_to_m_t3);
    m_to_r(t2_r, t2_m, gain_r, augment_by_day_t1, matrix_by_day, r_to_m_t2);
    m_to_r(t1_r, t1_m, gain_r, 0, matrix_by_day, r_to_m_t1);

    // ##
    if (t2_m.v !== 0) {
        r_to_m_t1.v = div(t1_m.v * p_to_r_time_overload_t1, div(t1_m.v, matrix_by_day));
        t1_r.v += div(t1_m.v * p_to_r_time_overload_t1, div(t1_m.v, matrix_by_day)) * 15;
        t1_m.v -= r_to_m_t1.v;
    }

    /* --------------------------------------------------------------------Si p > r--------------------------------------------------------------------------*/

    if (augment !== 3 && augment !== 4) {
        // regarde si r time < p time ## si oui r time - p time = p time overload ## si non p time overload = 0
        if (
            div(t4_r.v, gain_r + augment_by_day_t3) < div(t4_p.v, pristines_by_day) &&
            augment < 3
        ) {
            p_time_overload_t4 =
                div(t4_p.v, pristines_by_day) - div(t4_r.v, gain_r + augment_by_day_t3);
        } else {
            p_time_overload_t4 = 0;
        }

        // réajuste les coup des tier pour que ça prenne en compte les p time overload des tier
        t4_p.v -= p_time_overload_t4 * pristines_by_day;
        t3_p.v += p_time_overload_t4 * pristines_by_day;

        if (augment !== 2) {
            // #
            if (
                div(t3_r.v, gain_r + augment_by_day_t2) < div(t3_p.v, pristines_by_day) &&
                augment < 2
            ) {
                p_time_overload_t3 =
                    div(t3_p.v, pristines_by_day) - div(t3_r.v, gain_r + augment_by_day_t2);
            } else {
                p_time_overload_t3 = 0;
            }

            // ##
            t3_p.v -= p_time_overload_t3 * pristines_by_day;
            t2_p.v += p_time_overload_t3 * pristines_by_day;

            if (augment !== 1) {
                // #
                if (
                    div(t2_r.v, gain_r + augment_by_day_t1) < div(t2_p.v, pristines_by_day) &&
                    augment < 1
                ) {
                    p_time_overload_t2 =
                        div(t2_p.v, pristines_by_day) - div(t2_r.v, gain_r + augment_by_day_t1);
                } else {
                    p_time_overload_t4 = 0;
                }

                // ##
                t2_p.v -= p_time_overload_t2 * pristines_by_day;
                t1_p.v += p_time_overload_t2 * pristines_by_day;
            }
        }
    }

    /* --------------------------------------------------------------------Si r > p--------------------------------------------------------------------------*/

    // regarde si p time < r time
    // gain de r pend le gain des p = t1_r - (gain_r * t1_p,pristines_by_day)   #####
    // p_to_r_time_overload = (gain de r pend le gain des p),(gain_r + pristines_by_day * 15)
    // faut trouvé le temps q'il reste avec le gain des relic est de pristine
    if (div(t1_p.v, pristines_by_day) < div(t1_r.v, gain_r)) {
        p_to_r_time_overload_t1 = t1_r.v - div(gain_r * t1_p.v, pristines_by_day);
        p_to_r_time_overload_t1 = div(
            p_to_r_time_overload_t1,
            gain_r + pristines_by_day * 15,
        );
    } else {
        p_to_r_time_overload_t1 = 0;
    }

    reste_r.v += p_to_r_time_overload_t1 * pristines_by_day * 15;
    p_to_r_t1 = p_to_r_time_overload_t1 * pristines_by_day;
    t1_r.v = coutMoinReste(t1_r.v, reste_r);
    t1_p.v += p_to_r_t1;

    // #
    if (div(t2_p.v, pristines_by_day) < div(t2_r.v, gain_r) ) {
        p_to_r_time_overload_t2 = t2_r.v - div(gain_r * t2_p.v, pristines_by_day);
        p_to_r_time_overload_t2 = div(
            p_to_r_time_overload_t2,
            gain_r + pristines_by_day * 15 + augment_by_day_t1,
        );
    } else {
        p_to_r_time_overload_t2 = 0;
    }

    // ##
    reste_r.v += p_to_r_time_overload_t2 * pristines_by_day * 15;
    p_to_r_t2 = p_to_r_time_overload_t2 * pristines_by_day;
    t2_r.v = coutMoinReste(t2_r.v, reste_r);
    t2_p.v += p_to_r_t2;

    // #
    if (div(t3_p.v, pristines_by_day) < div(t3_r.v, gain_r)) {
        p_to_r_time_overload_t3 = t3_r.v - div(gain_r * t3_p.v, pristines_by_day);
        p_to_r_time_overload_t3 = div(
            p_to_r_time_overload_t3,
            gain_r + pristines_by_day * 15 + augment_by_day_t2,
        );
    } else {
        p_to_r_time_overload_t3 = 0;
    }

    // ##
    reste_r.v += p_to_r_time_overload_t3 * pristines_by_day * 15;
    p_to_r_t3 = p_to_r_time_overload_t3 * pristines_by_day;
    t3_r.v = coutMoinReste(t3_r.v, reste_r);
    t3_p.v += p_to_r_t3;

    // #
    if (div(t4_p.v, pristines_by_day) < div(t4_r.v, gain_r)) {
        p_to_r_time_overload_t4 = t4_r.v - div(gain_r * t4_p.v, pristines_by_day);
        p_to_r_time_overload_t4 = div(
            p_to_r_time_overload_t4,
            gain_r + pristines_by_day * 15 + augment_by_day_t3,
        );
    } else {
        p_to_r_time_overload_t4 = 0;
    }

    // ##
    reste_r.v += p_to_r_time_overload_t4 * pristines_by_day * 15;
    p_to_r_t4 = p_to_r_time_overload_t4 * pristines_by_day;
    t4_r.v = coutMoinReste(t4_r.v, reste_r);
    t4_p.v += p_to_r_t4;



    /*--------------------------------------------------------------------Si m > r--------------------------------------------------------------------------*/


    // Si time m > time r ## si oui m time - r time = r time overload ## si non r time overload = 0

    //réajuste les coup des tier pour que ça prenne en compte les m time overload des tier
    /*
        cout | time
    180  | 60
         | 50
    180 - x = reste * 15
    */

    m_to_r(t4_r, t4_m, gain_r, augment_by_day_t3, matrix_by_day, r_to_m_t4);
    m_to_r(t3_r, t3_m, gain_r, augment_by_day_t2, matrix_by_day, r_to_m_t3);
    m_to_r(t2_r, t2_m, gain_r, augment_by_day_t1, matrix_by_day, r_to_m_t2);
    m_to_r(t1_r, t1_m, gain_r, 0, matrix_by_day, r_to_m_t1);



    /* -----------------------------------------------------------------calcul des reste---------------------------------------------------------------------*/

    // regade le reste des tier a l'achat et les met dans les tier au dessu !!

    // sort le time du tier ## atualise les reste avec les reste d'achat du tier
    let norm_dura_t1 = timeMiniTier(
        t1_r.v,
        t1_p.v,
        t1_m.v,
        t1_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        1,
    );
    resteAppreAchat(
        norm_dura_t1,
        t1_r.v,
        t1_p.v,
        t1_m.v,
        t1_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        1,
        reste_r,
        reste_p,
        reste_m,
        reste_j,
    );
    // décremente les resource que l'on a en trop

    t2_r.v = coutMoinReste(t2_r.v, reste_r);
    t2_p.v = coutMoinReste(t2_p.v, reste_p);
    t2_m.v = coutMoinReste(t2_m.v, reste_m);
    t2_j.v = coutMoinReste(t2_j.v, reste_j);

    // #
    let norm_dura_t2 = timeMiniTier(
        t2_r.v,
        t2_p.v,
        t2_m.v,
        t2_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        2,
    );
    resteAppreAchat(
        norm_dura_t2,
        t2_r.v,
        t2_p.v,
        t2_m.v,
        t2_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        2,
        reste_r,
        reste_p,
        reste_m,
        reste_j,
    );

    // ##
    t3_r.v = coutMoinReste(t3_r.v, reste_r);
    t3_p.v = coutMoinReste(t3_p.v, reste_p);
    t3_m.v = coutMoinReste(t3_m.v, reste_m);
    t3_j.v = coutMoinReste(t3_j.v, reste_j);

    // #
    let norm_dura_t3 = timeMiniTier(
        t3_r.v,
        t3_p.v,
        t3_m.v,
        t3_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        3,
    );
    resteAppreAchat(
        norm_dura_t3,
        t3_r.v,
        t3_p.v,
        t3_m.v,
        t3_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        3,
        reste_r,
        reste_p,
        reste_m,
        reste_j,
    );

    // ##
    t4_r.v = coutMoinReste(t4_r.v, reste_r);
    t4_p.v = coutMoinReste(t4_p.v, reste_p);
    t4_m.v = coutMoinReste(t4_m.v, reste_m);
    t4_j.v = coutMoinReste(t4_j.v, reste_j);

    let norm_dura_t4 = timeMiniTier(
        t4_r.v,
        t4_p.v,
        t4_m.v,
        t4_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        4,
    );

    /* -------------------------------------------------------------------final time-------------------------------------------------------------------------*/

    t1_time = timeMiniTier(
        t1_r.v,
        t1_p.v,
        t1_m.v,
        t1_j.v,
        gain_r,
        pristines_by_day,
        matrix_by_day,
        pages_by_day,
        augment_base_gain,
        1,
    );
    t2_time =
        timeMiniTier(
            t2_r.v,
            t2_p.v,
            t2_m.v,
            t2_j.v,
            gain_r,
            pristines_by_day,
            matrix_by_day,
            pages_by_day,
            augment_base_gain,
            2,
        ) + t1_time;
    t3_time =
        timeMiniTier(
            t3_r.v,
            t3_p.v,
            t3_m.v,
            t3_j.v,
            gain_r,
            pristines_by_day,
            matrix_by_day,
            pages_by_day,
            augment_base_gain,
            3,
        ) + t2_time;
    t4_time =
        timeMiniTier(
            t4_r.v,
            t4_p.v,
            t4_m.v,
            t4_j.v,
            gain_r,
            pristines_by_day,
            matrix_by_day,
            pages_by_day,
            augment_base_gain,
            4,
        ) + t3_time;

    // Store result into a nice array for easy access
    const mistAttunements = [];
    if (t1_time > 0) {
        mistAttunements.push({
            ...MIST_ATTUNEMENTS[0],
            days: t1_time,
            standard: {
                daysForRelics: norm_dura_t1_r,
                daysForJournals: norm_dura_t1_j,
                daysForMatrices: norm_dura_t1_m,
                daysForPristines: norm_dura_t1_p,
            },
            convert: {
                pristinesToRelics: p_to_r_t1,
                relicsToMatrices: r_to_m_t1.v,
                pagesToJournals: 0,
            },
            total: {
                relics: total_cost_t1_r,
                pristines: total_cost_t1_p,
                matrices: total_cost_t1_m,
                journals: total_cost_t1_j,
            },
        });
    }
    if (t2_time > 0) {
        mistAttunements.push({
            ...MIST_ATTUNEMENTS[1],
            days: t2_time,
            standard: {
                daysForRelics: norm_dura_t2_r,
                daysForJournals: norm_dura_t2_j,
                daysForMatrices: norm_dura_t2_m,
                daysForPristines: norm_dura_t2_p,
            },
            convert: {
                pristinesToRelics: p_to_r_t2,
                relicsToMatrices: r_to_m_t2.v,
                pagesToJournals: 0,
            },
            total: {
                relics: total_cost_t2_r,
                pristines: total_cost_t2_p,
                matrices: total_cost_t2_m,
                journals: total_cost_t2_j,
            },
        });
    }
    if (t3_time > 0) {
        mistAttunements.push({
            ...MIST_ATTUNEMENTS[2],
            days: t3_time,
            standard: {
                daysForRelics: norm_dura_t3_r,
                daysForJournals: norm_dura_t3_j,
                daysForMatrices: norm_dura_t3_m,
                daysForPristines: norm_dura_t3_p,
            },
            convert: {
                pristinesToRelics: p_to_r_t3,
                relicsToMatrices: r_to_m_t3.v,
                pagesToJournals: 0,
            },
            total: {
                relics: total_cost_t3_r,
                pristines: total_cost_t3_p,
                matrices: total_cost_t3_m,
                journals: total_cost_t3_j,
            },
        });
    }
    if (t4_time > 0) {
        mistAttunements.push({
            ...MIST_ATTUNEMENTS[3],
            days: t4_time,
            standard: {
                daysForRelics: norm_dura_t4_r,
                daysForJournals: norm_dura_t4_j,
                daysForMatrices: norm_dura_t4_m,
                daysForPristines: norm_dura_t4_p,
            },
            convert: {
                pristinesToRelics: p_to_r_t4,
                relicsToMatrices: r_to_m_t4.v,
                pagesToJournals: 0,
            },
            total: {
                relics: total_cost_t4_r,
                pristines: total_cost_t4_p,
                matrices: total_cost_t4_m,
                journals: total_cost_t4_j,
            },
        });
    }

    return {
        daily: {
            relics: relics_by_day,
            pristines: pristines_by_day,
            matrices: matrix_by_day,
            pages: Math.round(pages_by_day * 100) / 100,
        },
        mistAttunements: mistAttunements.reverse(),
    };
}