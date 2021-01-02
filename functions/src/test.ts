// function myFilter(t1, t2, id1, id2) {
//     const map1 = {};
//     const map2 = {};
//     t1.forEach((el) => map1[el[id1]] = el);
//     t2.forEach((el) => map2[el[id2]] = el);

//     // console.log(map1);
//     // console.log(map2);

//     for (const prop in map1) {
//         if (map2[prop] !== undefined) {
//             map2[prop]['suspens'] = false;
//             for (const prp in map2[prop]) {
//                 console.log('** ', prp);
//                 map1[prop][prp] = map2[prop][prp];
//             }
//         } else {
//             map1[prop]['suspens'] = true;
//         }
//     }

//     const match = {...map1};
//     const suspens1 = {...map1};

//     for (const prop in map1) {
//         if (map1[prop]['suspens'] === true) {
//             delete match[prop];
//         } else {
//             delete suspens1[prop];
//         }
//     }

//     const suspens2 = map2;

//     for (const prop in map2) {
//         if (map2[prop]['suspens'] === false) {
//             delete suspens2[prop];
//         }
//     }

//     for (const prop in suspens2) {
//         suspens2[prop]['suspens'] = true;
//     }

//     const result = {
//         match: match,
//         suspens1: suspens1,
//         suspens2: suspens2
//     };

//     console.log(result);
// }

// const tab1 = [
//     {
//         ref: "cs1234",
//         nom: "Sune",
//         montant: 3000
//     },
//     {
//         ref: "rg4567",
//         nom: "Ndong'ho",
//         montant: 2000
//     },
//     {
//         ref: "ml7890",
//         nom: "Signe",
//         montant: 5000
//     }
// ];
// const tab2 = [
//     {
//         mat: "cs1234",
//         prénom: "Cabrel",
//         montant: 3000
//     },
//     {
//         mat: "rg4567",
//         Prénom: "Glenn",
//         montant: 2000
//     },
//     {
//         mat: "my7890",
//         Prénom: "Yvan",
//         montant: 5000
//     }
// ];

// myFilter(tab1,tab2, "ref", "mat");




















