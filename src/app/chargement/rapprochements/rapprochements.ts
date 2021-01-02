export function rapprocher(t1, t2, id1, id2, nml1, nml2, fttc1, fttc2, tolnml, tolfttc) {

    const map1 = {};
    const map2 = {};
    t1.forEach((el) => map1[el[id1]] = el);
    t2.forEach((el) => map2[el[id2]] = el);

    // console.log(map1);
    // console.log(map2);

    const exact_match = [];
    const errored_match = [];

    for (const prop in map1) {
        if (map2[prop] !== undefined) {

            if (map1[prop][nml1] === map2[prop][nml2]) {
                if (map1[prop][fttc1] === map2[prop][fttc2]) {
                    map1[prop]['suspens'] = false;
                    map1[prop]['comment'] = 'R.A.S';
                    map2[prop]['suspens'] = false;
                    map2[prop]['comment'] = 'R.A.S';

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else if (Math.abs(map1[prop][fttc1] - map2[prop][fttc2]) < tolfttc) {
                    map1[prop]['suspens'] = false;
                    map1[prop]['comment'] = 'Différence négligeable frais';
                    map2[prop]['suspens'] = false;
                    map2[prop]['comment'] = 'Différence négligeable frais';

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else {
                    map1[prop]['suspens'] = true;
                    map1[prop]['comment'] = 'Erreur sur les frais';
                    map2[prop]['suspens'] = true;
                    map2[prop]['comment'] = 'Erreur sur les frais';

                    errored_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                }
            } else if (Math.abs(map1[prop][nml1] - map2[prop][nml2]) < tolnml) {

                map1[prop]['comment'] = 'Différence négligeable Nominal';
                map2[prop]['comment'] = 'Différence négligeable Nominal';

                if (map1[prop][fttc1] === map2[prop][fttc2]) {
                    map1[prop]['suspens'] = false;
                    map2[prop]['suspens'] = false;

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else if (Math.abs(map1[prop][fttc1] - map2[prop][fttc2]) < tolfttc) {
                    map1[prop]['suspens'] = false;
                    map1[prop]['comment'] = map1[prop]['comment'] + ' et les frais';
                    map2[prop]['suspens'] = false;
                    map2[prop]['comment'] = map1[prop]['comment'] + ' et les frais';

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else {
                    map1[prop]['suspens'] = true;
                    map1[prop]['comment'] = 'Erreur sur les frais';
                    map2[prop]['suspens'] = true;
                    map2[prop]['comment'] = 'Erreur sur les frais';

                    errored_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    })

                    delete map1[prop];
                    delete map2[prop];
                }
            } else {
                map1[prop]['suspens'] = true;
                map1[prop]['comment'] = 'Erreur sur le Nominal';
                map2[prop]['suspens'] = true;
                map2[prop]['comment'] = 'Erreur sur le Nominal';

                errored_match.push({
                    'partenaire': map1[prop],
                    'cashit': map2[prop]
                });

                delete map1[prop];
                delete map2[prop];
            }
        } else {
            map1[prop]['suspens'] = true;
            map1[prop]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
        }
    }

    const suspens1 = { ...map1 };
    const suspens2 = { ...map2 };

    for (const prop in suspens2) {
        suspens2[prop]['suspens'] = true;
    }

    const result = {
        match: exact_match,
        inexactmatch: errored_match,
        suspens1,
        suspens2
    };

    return result;

    // console.log(result);

    // console.log('---------------- RESULTATS IDENTIQUES --------------------');

    // console.log(result.match);

    // console.log('---------------- MEME REF - PROBLEME MONTANT OU FRAIS --------------------');

    // console.log(result.inexactmatch);

    // console.log('---------------- SUSPENS TABLEAU 1 --------------------');

    // console.log(result.suspens1);

    // console.log('---------------- SUSPENS TABLEAU 2 --------------------');

    // console.log(result.suspens2);
}

// const tableau1 = [
//     {
//         ref: 'cs1234',
//         nom: 'Sune',
//         montant: 3000,
//         frais: 50
//     },
//     {
//         ref: 'rg4567',
//         nom: 'Ndong\'ho',
//         montant: 2000,
//         frais: 25
//     },
//     {
//         ref: 'ml7890',
//         nom: 'Signe',
//         montant: 5000,
//         frais: 100
//     }
// ];
// const tableau2 = [
//     {
//         mat: 'cs1234',
//         prénom: 'Cabrel',
//         nominal: 3000,
//         fee: 50
//     },
//     {
//         mat: 'rg4567',
//         Prénom: 'Glenn',
//         nominal: 2000,
//         fee: 200
//     },
//     {
//         mat: 'my7890',
//         Prénom: 'Yvan',
//         nominal: 5000,
//         fee: 100
//     }
// ];

// rapprocher(tableau1, tableau2, 'ref', 'mat', 'montant', 'nominal', 'frais', 'fee', 5, 25);