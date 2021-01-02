// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const cors = require('cors')({ origin: true });


// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.resetDiscipline = functions.pubsub.schedule('30 0 1 * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        return db.collection('users').get().then((userCollection: any[]) => {
            const promisechain: Promise<any>[] = [];
            userCollection.forEach((user: any) => {
                // const FieldValue = admin.firestore.FieldValue;
                const userdata = user.data();
                if (userdata.discipline) {
                    const disci = userdata.discipline.map((dsc: any) => {
                        const d = dsc;
                        d['formerpenalty'] = d.penalty;
                        d.penalty = 0;
                        return d;
                    })
                    console.log(disci);
                    const resetfields = () => {
                        return db.collection('users').doc(user.id).update({
                            discipline: disci
                        });
                    };
                    promisechain.push(resetfields());
                }

            });

            return Promise.all(promisechain).then(() => {
                return "status: okay";
            })
        });

    });


exports.startMailProcess = functions.https.onCall(async (parameters: any, context: any) => {

    const mail = parameters.mail;

    mail.date = new Date(mail.date);
    mail.deadline = new Date(mail.deadline);

    // Get a new write batch
    const batch = db.batch();

    const uid = uuidv4();

    const template = {
        ApprovedBy: "",
        ApprovedByName: "",
        ApprovedByEmail: "",
        CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
        CreatedByName: "Archivaxi LOGIN",
        HourTime: "15:39",
        ProjectTitle: "",
        WorkedWith: "",
        WorkedWithName: "",
        WorkedWithEmail: "",
        assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
        assignedToName: "Archivaxi LOGIN",
        assignedToEmail: "archivaxi@gmail.com",
        assignerId: "",
        assignerName: "",
        assignerEmail: "",
        completed: false,
        dayOrder: 2,
        dayofweek: 3,
        description: "",
        every: 1,
        fonction: 0,
        label: "Brancher son onduleur, au mur patienter quelques minutes et allumer l'onduleur",
        monthday: 15,
        monthlyOption: "STRAIGHTDATE",
        period: "WEEK",
        progress: 0,
        projectId: "",
        projectStatus: true,
        repeat: false,
        startingMonth: 7,
        status: "undone",
        subtasks: [],
        subtasksNumber: 0,
        taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
        toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
        weekdays: [1, 2, 3, 4, 5, 6],
        congesstate: false
    };

    const task: any = template;

    const lpad = (str: string, padString: string, length: number) => {
        let strg = str;
        while (strg.length < length)
            strg = padString + strg;
        return strg;
    }

    const now = new Date();
    const hours = now.getHours() + 1;
    const HourTime = lpad(hours.toString(), '0', 2) + ':' + lpad(now.getMinutes().toString(), '0', 2);

    task.CreatedBy = mail.by;
    task.CreatedByName = mail.byName;
    task.HourTime = HourTime;
    task.assignedTo = mail.to;
    task.assignedToEmail = mail.toEmail;
    task.assignedToName = mail.toName;
    task.label = 'Moi, ' + mail.toName + ', reconnais avoir lu le mail de ' + mail.motif + ' qui m\'a été envoyé';
    task.repeat = false;

    task['creationDate'] = now;
    task['deadline'] = now;
    task['startingDate'] = now;
    task['startingYear'] = now;

    task.taskid = uid;

    task.fonction = mail.toFunction;
    task.congesstate = false;

    mail['taskid'] = uid;

    // Set the value of 'NYC'
    const nycRef = db.collection('mailbox').doc(uid);
    batch.set(nycRef, mail);

    // Update the population of 'SF'
    const sfRef = db.collection('tasks').doc(uid);
    batch.set(sfRef, task);

    const rfRef = db.collection('users').doc(mail.to);
    const discipline = mail.discipline;
    delete mail['discipline'];

    discipline.push(mail);
    console.log(discipline);
    batch.update(rfRef, {
        discipline: discipline
    });

    const nfRef = db.collection('notifications').doc(uid);
    const notif = mail;
    batch.set(nfRef, notif);

    // Commit the batch
    await batch.commit();

    console.log('Tout s\'est bien passé');

    return 'Tout s\'est bien passé';

});


// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.getStats = functions.region('us-central1').https.onCall((parameters: any, context: any) => {

    const getNumber = async (beginningDate: Date, endingDate: Date) => {

        const snapshot = await db.collection('ittrans')
            // .where('code', '==', 'EFT')
            .where('Date', '>=', beginningDate)
            .where('Date', '<=', endingDate)
            .get();

        console.log('---');
        // const relevant = snapshot.docs.map((element) => element.data());

        console.log(snapshot.size);

        const template = {
            'NOMBRE': 0,
            'VOLUME': 0,
            'FRAIS': 0,
            'TVA': 0,
            'COM. PRINC.': 0,
            'AUTRE COM.': 0,
            'TOT. COM TTC': 0,
            'TOT. COM HT': 0,
            'REV./TR': 0,
            'TX/RENT.': 0
        };

        const tls: any = {
            'EMG': {
                'VOLUME': 'Base Amt',
                'FRAIS': 'Fee Amt',
                'TVA': 'TVA',
                'COM. PRINC.': 'AFBComm',
                'AUTRE COM.': 'ITComm'
            },
            'RMG': {
                'VOLUME': 'Base Amt',
                'FRAIS': 'Fee Amt',
                'TVA': 'TVA',
                'COM. PRINC.': 'AFBComm',
                'AUTRE COM.': 'ITComm'
            },
            'AMG': {
                'VOLUME': 'Base Amt',
                'FRAIS': 'Fee Amt',
                'TVA': 'TVA',
                'COM. PRINC.': 'AFBComm',
                'AUTRE COM.': 'ITComm'
            },
            'EWU': {
                'VOLUME': 'principal',
                'FRAIS': 'charges',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'RWU': {
                'VOLUME': 'principal',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'AWU': {
                'VOLUME': 'principal',
                'FRAIS': 'charges',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ERIA': {
                'VOLUME': 'Sent Amount',
                'FRAIS': 'Customer Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'RRIA': {
                'VOLUME': 'Payment Amount',
                'FRAIS': 'Customer Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ARIA': {
                'VOLUME': 'Sent Amount',
                'FRAIS': 'Customer Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ERT': {
                'VOLUME': 'Send Amount',
                'FRAIS': 'Total Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'RRT': {
                'VOLUME': 'Receiving Amount',
                'FRAIS': 'Total Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ART': {
                'VOLUME': 'Send Amount',
                'FRAIS': 'Total Fee',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'EFT': {
                'VOLUME': 'MONTANT',
                'FRAIS': 'FRAIS ',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'RFT': {
                'VOLUME': 'MONTANT',
                'FRAIS': 'FRAIS ',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'AFT': {
                'VOLUME': 'MONTANT',
                'FRAIS': 'FRAIS ',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'DOM': {
                'VOLUME': 'Debit',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ROM': {
                'VOLUME': 'Credit',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'DMM': {
                'VOLUME': 'Montant',
                'FRAIS': 'Frais',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'RMM': {
                'VOLUME': 'Montant',
                'FRAIS': 'Frais',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ENEO': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'CDE': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'CANALPLUS': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'MTN': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'ORANGE': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'NEXTTEL': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'CAMTEL': {
                'VOLUME': 'Total (collected)',
                'FRAIS': 'Service Charge Company',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
            'DHL': {
                'VOLUME': 'charges',
                'FRAIS': 'charges',
                'TVA': 'TVA',
                'COM. PRINC.': 'HTComm'
            },
        };

        const result: any = {};

        snapshot.forEach((element: any) => {
            const data: any = element.data();

            // console.log(data);

            if (data['code']) {

                if (!result[data['code']]) {
                    result[data['code']] = { ...template };
                }

                result[data['code']]['NOMBRE'] = result[data['code']]['NOMBRE'] + 1;
                result[data['code']]['VOLUME'] = result[data['code']]['VOLUME'] + Math.abs(data[tls[data['code']]['VOLUME']]);

                if (tls[data['code']]['FRAIS'] && data[tls[data['code']]['FRAIS']]) {
                    result[data['code']]['FRAIS'] = result[data['code']]['FRAIS'] + data[tls[data['code']]['FRAIS']];
                } else {
                    result[data['code']]['FRAIS'] = 0;
                }

                result[data['code']]['TVA'] = result[data['code']]['TVA'] + data[tls[data['code']]['TVA']];

                result[data['code']]['COM. PRINC.'] = result[data['code']]['COM. PRINC.'] + data[tls[data['code']]['COM. PRINC.']];

                if (tls[data['code']]['AUTRE COM.']) {
                    result[data['code']]['AUTRE COM.'] = result[data['code']]['AUTRE COM.'] + data[tls[data['code']]['AUTRE COM.']];
                } else {
                    result[data['code']]['AUTRE COM.'] = 0;
                }

                result[data['code']]['TOT. COM HT'] = result[data['code']]['COM. PRINC.'] + result[data['code']]['AUTRE COM.'];

                result[data['code']]['TOT. COM TTC'] = result[data['code']]['TOT. COM HT'] + result[data['code']]['TVA'];

                result[data['code']]['REV./TR'] = result[data['code']]['TOT. COM HT'] / result[data['code']]['NOMBRE'];
                result[data['code']]['TX/RENT.'] = result[data['code']]['TOT. COM HT'] * 100 / result[data['code']]['VOLUME'];
            }

        });

        console.log(result);

        return result;

    }

    console.log(parameters.beginningDate, ' ', parameters.endingDate);

    return getNumber(new Date(parameters.beginningDate), new Date(parameters.endingDate));

});


// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.getRecursiveCashITTrans = functions.region('us-central1').https.onCall((data: any, context: any) => {
    const dealprogress = (request: any) => {
        const promise: Promise<any> = new Promise((resolve, reject) => {
            const con = mysql.createConnection({
                host: '51.38.124.57',
                user: 'aucxence',
                password: '@aucXence2o2oIT!',
                database: 'cashitproduction',
                dateStrings: true,
                port: 3306
            });
            con.connect((err: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                con.query(request, (error: any, hebdo: any, fields: any) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    con.end();
                    resolve(hebdo);
                });
            });
        });

        return promise;
    }

    const date1: Date = new Date(data.date1);
    const date2: Date = new Date(data.date2);

    const nb = Math.ceil(((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) / 4);

    let debut = new Date(date1);
    debut.setHours(0, 0, 0, 0);

    const proms: any[] = [];

    const final: any[] = [];

    for (let i = 0; i < nb; i++) {
        let end = new Date(debut);
        if (i !== nb - 1) {
            end.setDate(end.getDate() + 3);
        } else {
            end = new Date(date2);
        }

        end.setHours(23, 59, 0, 0);

        let req = data.request;

        console.log('> ', req, ' <');

        req = req.replace('1?1', `'${debut.toISOString()}'`);
        req = req.replace('2?2', `'${end.toISOString()}'`);

        

        proms.push(dealprogress(req).then((x) => {
            console.log('~~~~~~> ', 'Succès', ' <~~~~~~');
            x.forEach((y: any) => {
                final.push(y);
            })
        }));

        debut = new Date(end);
        debut.setDate(debut.getDate() + 1);
        debut.setHours(0, 0, 0, 0);
    }

    return new Promise((resolve, reject) => {
        Promise.all(proms)
            .then(() => {
                resolve(final);
            })
            .catch((e) => {
                reject(e);
            });
    });

});

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.getCashITTrans = functions.region('us-central1').https.onCall((data: any, context: any) => {
    const promise: Promise<any> = new Promise((resolve, reject) => {
        const con = mysql.createConnection({
            host: '51.38.124.57',
            user: 'aucxence',
            password: '@aucXence2o2oIT!',
            database: 'cashitproduction',
            dateStrings: true,
            port: 3306
        });
        con.connect((err: any) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log(data.request);
            con.query(data.request, (error: any, hebdo: any, fields: any) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                con.end();
                resolve(hebdo);
            });
        });
    });

    return promise;

});

exports.sendControleQualitatif = functions.pubsub.schedule('0 12 * * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        const documentDefinition = (controles: any) => {

            // controles = splitControles.default;

            // randomize();

            const controletables = controles.map((day: any) => {
                const controlelines = day.map((controle: any, index: number) => {
                    return [
                        {
                            text: day.length - index,
                            alignment: 'left',
                        },
                        {
                            text: controle.whoname + ' - ' + controle.agence,
                            alignment: 'left',
                        },
                        {
                            text: controle.doneby,
                            alignment: 'left',
                        },
                        {
                            text: (controle.date.toDate()).getHours() + ':' + (controle.date.toDate()).getMinutes(),
                            alignment: 'left',
                        },
                        {
                            text: controle.note + '/' + controle.total,
                            alignment: 'right',
                            noWrap: true
                        }
                    ];
                });

                const dt = new Date(day[0].date.toDate());

                const deftable = {
                    style: 'tableExample',
                    table: {
                        widths: ['auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {
                                    text: dt.toLocaleDateString(),
                                    alignment: 'center',
                                    colSpan: 5,
                                    style: 'tableHeader'
                                },
                                {},
                                {},
                                {},
                                {}
                            ],
                            ...controlelines,
                        ]
                    },
                };

                return deftable;
            });

            // console.log(controletables);

            // automatically writes a json files

            const def = {
                content: [

                    {
                        text: 'Imprimé le ' + new Date().toLocaleDateString(),
                        alignment: 'right',
                        fontSize: 15
                    },

                    {
                        style: 'tableExample2',
                        text: ''

                        // pageBreak: 'after'
                    },

                    {
                        text: 'Rapport des Controles qualitatifs',
                        style: 'header',
                        decoration: 'underline',
                        fontSize: 25,
                        alignment: 'center'
                    },

                    {
                        style: 'tableExample',
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    {
                                        text: 'rapport du ' + new Date().toLocaleDateString(),
                                        alignment: 'left',
                                        colSpan: 2,
                                        border: [false, false, false, true],
                                    },
                                    {}
                                ],
                            ]
                        }
                    },

                    controles.length > 0 ? {
                        style: 'tableExample',
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: 'I- Détails des contrôles effectués',
                                        alignment: 'center',
                                        border: [false, false, false, true],
                                        fontSize: 25
                                    }
                                ]
                            ]
                        }
                    } : '',
                    ...controletables.map((t: any) => {
                        return [t,
                            {
                                style: 'tableExample2',
                                // pageBreak: 'after'
                                text: ''
                            }];
                    }),

                    // {
                    //     text: '',
                    //     alignment: 'center',
                    //     border: [false, false, false, false],
                    //     pageBreak: doneanys > 0 ? 'after' : ''
                    // },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 30]
                    },
                    tableExample2: {
                        margin: [0, 5, 0, 10]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    font: 'Roboto'
                }
            };

            return def;
        }

        function generatePDF(docDefinition: any) {
            const fonts = {
                Roboto: {
                    normal: 'fonts/roboto/Roboto-Regular.ttf',
                    bold: 'fonts/roboto/Roboto-Medium.ttf',
                    italics: 'fonts/roboto/Roboto-Italic.ttf',
                    bolditalics: 'fonts/roboto/Roboto-MediumItalic.ttf'
                }
            };

            const PdfPrinter = require('pdfmake');
            const printer = new PdfPrinter(fonts);

            console.log('get past the fonts issue');

            // const doc = new pdfkit();

            const bucket = admin.storage().bucket();

            const filename = `rapports Controle Qualitatif ${new Date().toLocaleString()}.pdf`;

            const file = bucket.file(filename);

            console.log(filename);

            const bucketFileStream = file.createWriteStream();

            // const buffers = [];

            const pdfDoc = printer.createPdfKitDocument(docDefinition);

            console.log('create the file');

            const p = new Promise((resolve, reject) => {
                pdfDoc.on("end", function () {
                    // resolve(buffers);
                    resolve(file.createReadStream())
                });
                pdfDoc.on("error", function () {
                    reject();
                });
            });

            pdfDoc.pipe(bucketFileStream);

            console.log('write in the file');

            // pdfDoc.on('data', buffers.push.bind(buffers));
            // //Add Document Text and stuff

            pdfDoc.end();
            return p.then(function (stream) {
                console.log('try 1');
                return sendMail(stream);
                // file.getSignedUrl({
                //     action: 'read',
                //     expires: '03-09-2491'
                //   }).then(signedUrls => {
                //     // signedUrls[0] contains the file's public URL
                //     console.log(signedUrls[0]);
                //   });
            });
        }

        function sendMail(buffers: any) {

            console.log('send email');

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                // port: 587,
                // secure: false,
                port: 465,
                secure: true,
                // requireTLS: true,
                auth: {
                    user: 'instanttransfermanager@gmail.com',
                    pass: 'instransfer'
                }
            });

            const mailOptions = {
                from: 'instanttransfermanager@gmail.com',
                // to: 'instant.transfer@yahoo.fr, gaetan.nkema@instant-transfer.com,sylvin.njiha@instant-transfer.com,aucxence@yahoo.fr',
                to: 'aucxence@yahoo.fr',
                subject: 'Controles Qualitatifs',
                text: 'Rapport des contrôles qualitatifs de la semaine\n\n' + 'Le Task Manager vous soumet par ce mail un rapport des contrôles qualitatifs effectués cette semaine.\n' +
                    '\n\nCordialement',
                attachments: [{
                    filename: `rapports Controle Qualitatif ${new Date().toLocaleString()}.pdf`,
                    content: buffers,
                    contentType: 'application/pdf'
                }]
            };

            return setTimeout(() => {
                return transporter.sendMail(mailOptions, function (error1: any, info1: any) {
                    if (error1) {
                        console.log(error1);
                    } else {
                        console.log('Email sent: ' + info1.response);
                    }
                });
            }, 10000)
        }

        const redefineHebdoControles = () => {

            // console.log(':::::> ' + monthyear);

            const curr = new Date(); // get current date
            const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
            const last = first + 6; // last day is the first day + 6

            const firstday = new Date(curr.setDate(first));
            const lastday = new Date(curr.setDate(last));


            const bgn = new Date(firstday);
            bgn.setHours(0, 0, 0, 0);

            const end = new Date(lastday);
            end.setHours(24, 0, 0, 0);

            return db.collection('controles')
                .where('date', '>=', bgn)
                .where('date', '<=', end)
                .get()
                .then((executs: any) => {
                    const hebdocontroles: any[] = [];
                    executs.forEach((exec: any) => {
                        const execintask = exec.data();
                        hebdocontroles.push(execintask);
                    });

                    // console.log(hebdocontroles);

                    const splitHebdoControles = hebdoinit(firstday, lastday, hebdocontroles);

                    const docdef = documentDefinition(splitHebdoControles);

                    console.log('ok ok');

                    return generatePDF(docdef);
                });

        }

        const hebdoinit = (beg: Date, end: Date, hebdocontroles: any[]) => {
            let i = 0;

            const basis = end;
            basis.setHours(0, 0, 0, 0);

            const date1 = beg;
            date1.setHours(0, 0, 0, 0);
            const date2 = end;
            date2.setHours(0, 0, 0, 0);

            // tslint:disable-next-line: constiable-name
            const Difference_In_Days = ((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)) + 1;

            // console.log('--> ' + Difference_In_Days);

            let j = 0;

            let splitHebdoControles: any[] = [];

            for (i = 0; i < Difference_In_Days; i++) {
                // console.log('++> ' + i);

                splitHebdoControles.push([]);
                // console.log(hebdocontroles[j].date.toDate() + ' to be compared with ' + basis);
                while (hebdocontroles[j] && hebdocontroles[j].date.toDate().getTime() > basis.getTime() && j < hebdocontroles.length) {
                    // console.log('--> j = ' + j);

                    splitHebdoControles[i].push(hebdocontroles[j]);
                    j++;
                    if (j === hebdocontroles.length) { break; }
                }
                if (j === hebdocontroles.length) { break; }
                basis.setDate(basis.getDate() - 1);
            }

            splitHebdoControles = splitHebdoControles.filter((tasklist) => {
                // console.log(tasklist.length > 0 ? tasklist[0].deadline : '');
                return tasklist.length > 0;
            });

            return splitHebdoControles;
        }

        redefineHebdoControles();
    });


exports.handleConges = functions.pubsub.schedule('45 23 * * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        const rescheduleAfterBreak = (taskathand: any, returnDate: any): any => {

            taskathand.startingDate = returnDate;

            if (taskathand.repeat === true) {
                const docdata = taskathand;

                // ---- check periodicity and reset deadline and starting_date

                // 1. Tâches journalières
                if (docdata.period === 'DAY') {

                    // coté client

                    const d1 = new Date(taskathand.startingDate);
                    // d1.setHours(0, 0, 0, 0);
                    const d2 = new Date();
                    // d2.setHours(0, 0, 0, 0);

                    const d = d2.getTime() > d1.getTime() ? d2 : d1;

                    const nextschedulingday = d;

                    return nextschedulingday;

                }

                // 2. Tâches hebdomadaires
                else if (docdata.period === 'WEEK') {

                    const nextschedulingday = docdata.weekdays.map((day: number) => {
                        // find next available day
                        const d1 = new Date(taskathand.startingDate);
                        // d1.setHours(0, 0, 0, 0);
                        const d2 = new Date();
                        // d2.setHours(0, 0, 0, 0);

                        const d = d2.getTime() > d1.getTime() ? d2 : d1;

                        if (d.getDay() <= day) {
                            // not yet on that day
                            // console.log('==> Option 1 with ' + day)
                            d.setDate(d.getDate() + (1 - d.getDay()) % 7 + day - 1);
                        } else {
                            // past that day
                            // console.log('==> Option 2 with ' + day)
                            d.setDate(d.getDate() + (7 - d.getDay()) % 7 + day + 7 * (docdata.every - 1));
                        }

                        return d;
                    }).sort((a: number, d: number) => {
                        return a - d;
                    })[0];

                    // console.log('--------------->  ' + nextschedulingday);

                    taskathand.deadline = nextschedulingday;

                    return nextschedulingday;

                }

                // 3. Tâches Mensuelles
                else if (docdata.period === 'MONTH') {

                    taskathand.startingMonth = returnDate.getMonth();

                    let nextschedulingday;

                    if (docdata.monthlyOption === 'STRAIGHTDATE') {

                        let d1: Date;

                        const lastday = new Date(new Date().getFullYear(), taskathand.startingMonth, 0);

                        // console.log('ok : ' + lastday);

                        let d11: Date;

                        // console.log('comparaison : ' + taskathand.monthday + ' - ' + lastday.getDate());

                        if (taskathand.monthday <= lastday.getDate()) {
                            d11 = new Date(new Date().getFullYear(), taskathand.startingMonth - 1, taskathand.monthday)
                        } else {
                            d11 = new Date(lastday);
                        }

                        // d11.setHours(0, 0, 0, 0);

                        const d12 = new Date();
                        // d12.setHours(0, 0, 0, 0);

                        // console.log('monthday ' + taskathand.monthday);

                        // console.log('d1 = ' + d11);
                        // console.log('d2 = ' + d12);



                        if (d11.getTime() - d12.getTime() >= 0) {
                            d1 = d11;
                        } else {
                            const d11check = d11;
                            d11check.setMonth(d11check.getMonth() + 1 * taskathand.every);
                            // console.log(d11check);
                            while (d11check.getTime() < d12.getTime()) {
                                d11check.setMonth(d11check.getMonth() + 1 * taskathand.every);
                                // console.log(d11check);
                            }
                            d1 = d11check;
                        }

                        nextschedulingday = d1;

                        taskathand.deadline = nextschedulingday;

                        return nextschedulingday;

                        // console.log('-------------- >  ' + nextschedulingday);

                    } else {
                        const getSpecificdays = (x: number, y: number) => {

                            const d = new Date(new Date().getFullYear(), y, 1);
                            const month = (d.getMonth());
                            // const year = d.getFullYear();

                            // if (month > 11) {
                            //   year++;
                            //   month = month % 12
                            // }
                            // console.log(`${1} - ${month} - ${year}`);
                            const mondays = [];

                            // d = new Date(year, month, 1);

                            let count = 0;

                            while (d.getDay().toString() !== x.toString()) {
                                // console.log(d.getDay() + ' ?= ' + x + ' === ' + (d.getDay().toString() === x.toString()))
                                d.setDate(d.getDate() + 1);
                                count = count + 1;
                                if (count === 10) { break; }
                            }

                            // Get all the other Mondays in the month
                            while (d.getMonth() === month) {
                                mondays.push(new Date(d));
                                d.setDate(d.getDate() + 7);
                            }

                            return mondays;
                        };

                        let relevantdays = getSpecificdays(docdata.dayofweek, taskathand.startingMonth - 1);

                        console.log('relevants days are: ' + relevantdays);

                        if (docdata.dayOrder > relevantdays.length) {
                            nextschedulingday = relevantdays[relevantdays.length - 1];
                        } else {
                            nextschedulingday = relevantdays[docdata.dayOrder - 1];
                        }

                        console.log('exit date 1: ' + nextschedulingday);

                        const dateoftoday = new Date();
                        // dateoftoday.setHours(0, 0, 0, 0);

                        while (nextschedulingday.getTime() < dateoftoday.getTime()) {
                            relevantdays = getSpecificdays(docdata.dayofweek, taskathand.startingMonth - 1 + 1 * taskathand.every);
                            if (docdata.dayOrder > relevantdays.length) {
                                nextschedulingday = relevantdays[relevantdays.length - 1];
                            } else {
                                nextschedulingday = relevantdays[docdata.dayOrder - 1];
                            }
                        }

                        taskathand.deadline = nextschedulingday;

                        return nextschedulingday;

                    }
                }

                // 4. Yearly Tasks
                else if (docdata.period === 'YEAR') {

                    taskathand.startingYear = returnDate.getFullYear();

                    const d1 = new Date(taskathand.startingYear);
                    // d1.setHours(0, 0, 0, 0);
                    const d2 = new Date();
                    // d2.setHours(0, 0, 0, 0);

                    while (d2.getTime() > d1.getTime()) {
                        d1.setFullYear(d1.getFullYear() + 1 * taskathand.every);
                    }

                    const today = d1;
                    const nextschedulingday = today;

                    // console.log('-> ' + nextschedulingday);

                    // nextschedulingday.setFullYear(today.getFullYear() + 1 * docdata.every); annulé coté client

                    // console.log('+> ' + nextschedulingday);

                    taskathand.deadline = nextschedulingday;

                    return nextschedulingday;
                }

                // console.log(taskathand.nextOccurrence);
            } else {
                const nextschedulingday = new Date();
                taskathand.deadline = nextschedulingday;

                return nextschedulingday;
            }
        }

        const b = new Date();
        b.setDate(b.getDate());
        b.setHours(0, 0, 0, 0);

        const e = new Date()
        e.setDate(e.getDate());
        e.setHours(23, 59, 0, 0);

        return db.collection('conges')
            .where('success', '==', false)
            .where('startingDate', '>=', b)
            .where('startingDate', '<', e)
            .get()
            .then((congessnapshot: any) => {

                const promises: any[] = [];

                congessnapshot.forEach((conge: any) => {
                    const congedata = conge.data();
                    const going = congedata.startingDate.toDate();
                    const returning = congedata.returnDate.toDate();

                    promises.push(db.collection('tasks')
                        .where('assignedTo', '==', congedata.employeID)
                        // .where('repeat', '==', true)
                        .where('deadline', '>=', going)
                        .where('deadline', '<', returning)
                        .where('congesstate', '==', false)
                        .get()
                        .then((taskSnapshot: any) => {

                            const taskspromises: Promise<any>[] = [];

                            taskSnapshot.forEach((task: any) => {
                                const taskdata = task.data();

                                taskdata.deadline = rescheduleAfterBreak(taskdata, congedata.returnDate.toDate());

                                taskspromises.push(db.collection('tasks').doc(task.id).update({ deadline: taskdata.deadline, congesstate: true }));
                            });

                            return Promise.all(taskspromises).then(() => {
                                return db.collection('conges').doc(conge.id).update({ success: true });
                            });

                        }));

                });

                return Promise.all(promises).then(() => {
                    return "tout a été bien géré";
                })
            })

    });

exports.returnFromConges = functions.pubsub.schedule('45 20 * * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {
        const b = new Date();
        b.setDate(b.getDate());
        b.setHours(0, 0, 0, 0);

        const e = new Date()
        e.setDate(e.getDate());
        e.setHours(23, 59, 0, 0);

        return db.collection('conges')
            .where('success', '==', true)
            .where('returnDate', '>=', b)
            .where('returnDate', '<', e)
            .get()
            .then((congessnapshot: any) => {

                const promises: any[] = [];

                congessnapshot.forEach((conge: any) => {
                    const congedata = conge.data();
                    const going = congedata.startingDate.toDate();
                    const returning = congedata.returnDate.toDate();

                    promises.push(db.collection('tasks')
                        .where('assignedTo', '==', congedata.employeID)
                        // .where('repeat', '==', true)
                        .where('deadline', '>=', going)
                        .where('deadline', '<', returning)
                        .where('congesstate', '==', true)
                        .get()
                        .then((taskSnapshot: any) => {

                            const taskspromises: Promise<any>[] = [];

                            taskSnapshot.forEach((task: any) => {
                                taskspromises.push(db.collection('tasks').doc(task.id).update({ congesstate: false }));
                            });

                            return Promise.all(taskspromises).then(() => {
                                return db.collection('conges').doc(conge.id).update({ success: false });
                            });

                        }));

                });

                return Promise.all(promises).then(() => {
                    return "tout a été bien géré";
                })
            });
    });

exports.prepareforConges = functions.https.onCall((data: any, context: any) => {
    return db.collection('tasks')
        .where('assignedTo', '==', data.assignedTo)
        .where('repeat', '==', true)
        .get()
        .then((taskSnapshot: any) => {

            const promises: any[] = [];

            taskSnapshot.forEach((task: any) => {
                promises.push(db.collection('tasks').doc(task.id).update({ congesstate: false }));
            });

            return Promise.all(promises).then(() => {
                return "okay";
            });

        });
});

exports.makeSendPDF = functions.pubsub.schedule('10 0 * * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        return pdfandmail().catch((ex: any) => console.log(ex));

        function pdfandmail() {
            const b = new Date();
            const e = new Date();

            // const days: any[] = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            const months = ['Janvier', 'Février', 'Mars',
                'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

            if (new Date().getDate() > 4) {
                b.setDate(1);
                b.setHours(0, 0, 0, 0); // The first of the month

                e.setMonth(e.getMonth() + 1);
                e.setDate(0);
                e.setHours(23, 59, 0, 0); // The last day of the month
            } else {
                b.setMonth(b.getMonth() - 1);
                b.setDate(1);
                b.setHours(0, 0, 0, 0); // The first of the last month

                e.setDate(0);
                e.setHours(23, 59, 0, 0); // The last day of the last month
            }

            console.log(b + ' <::::::> ' + e);

            return db.collection('users').where('evaluation', '==', true).get().then((userCollection: any) => {
                let userlines: any[] = [];
                userCollection.forEach((user: any) => {
                    userlines.push(user.data());
                });

                let alltasks = 0;
                let donetasks = 0;

                const relevantDate = new Date();
                relevantDate.setDate(relevantDate.getDate() - 1);

                userlines = userlines.map(user => {
                    alltasks = alltasks + user.alltasks;
                    donetasks = donetasks + user.donetasks;

                    let disc: number = 0;

                    if (user.discipline) {
                        user.discipline.forEach((d: any) => {
                            disc = disc + d.penalty;
                        })
                    }

                    return [
                        {
                            text: user.firstname + ' ' + user.lastname,
                            alignment: 'left',
                        },
                        {
                            text: user.performance.toString().slice(0, 4) + ' %',
                            alignment: 'right',
                            noWrap: true
                        },
                        {
                            text: (user.finalnote !== 0 && user.finalnote !== 100) ?
                                user.finalnote.toString() + ' / ' + user.total.toString() :
                                '',
                            alignment: 'right',
                            noWrap: true
                        },
                        {
                            text: (user.discipline === undefined || user.discipline.length === 0) ?
                                '' :
                                '-' + disc.toString() + '%',
                            alignment: 'right',
                            noWrap: true
                        },
                        {
                            text: (user.finalnote !== 0 && user.finalnote !== 100) ?
                                (user.aftercontrole - disc).toString().slice(0, 4) + ' %'
                                : (user.performance - disc).toString().slice(0, 4) + ' %',
                            alignment: 'right',
                            noWrap: true
                        }
                    ];
                });

                const userstable = {
                    style: 'tableExample',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {
                                    text: userlines.length.toString() + ' personnes évaluées',
                                    alignment: 'center',
                                    colSpan: 5,
                                    style: 'tableHeader'
                                },
                                {},
                                {},
                                {},
                                {}
                            ],
                            [
                                {
                                    text: 'Nom et Prénom',
                                    alignment: 'left',
                                },
                                {
                                    text: 'Note de base',
                                    alignment: 'right',
                                    noWrap: true
                                },
                                {
                                    text: 'Contr. Qual',
                                    alignment: 'right',
                                    noWrap: true
                                },
                                {
                                    text: 'Sanctions',
                                    alignment: 'right',
                                    noWrap: true
                                },
                                {
                                    text: 'Note Finale',
                                    alignment: 'right',
                                    noWrap: true
                                }
                            ],
                            ...userlines, // because 'map' puts arrays in an array
                        ]
                    },
                };

                const docDefinition = {
                    content: [

                        {
                            text: 'Imprimé le ' + new Date().toLocaleDateString(),
                            alignment: 'right',
                            fontSize: 15
                        },

                        {
                            style: 'tableExample2',
                            text: ''

                            // pageBreak: 'after'
                        },

                        {
                            text: 'Rapport d\'Evaluation',
                            style: 'header',
                            decoration: 'underline',
                            fontSize: 32,
                            alignment: 'center'
                        },

                        {
                            style: 'tableExample',
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            text: 'Résumé et Performance Générale',
                                            alignment: 'center',
                                            border: [false, false, false, true],
                                            fontSize: 22
                                        }
                                    ]
                                ]
                            }
                        },
                        {
                            style: 'tableExample',
                            table: {
                                widths: ['*', '*'],
                                body: [
                                    [
                                        {
                                            text: 'Mois d\'' + months[relevantDate.getMonth()],
                                            alignment: 'left',
                                            colSpan: 2,
                                            border: [false, false, false, true],
                                        },
                                        {}
                                    ],
                                    [
                                        {
                                            text: 'Evaluation générale',
                                            alignment: 'left',
                                            border: [false, false, false, true],
                                        },
                                        {
                                            text: userlines.length.toString() + ' personnes évaluées',
                                            alignment: 'right',
                                            border: [false, false, false, true],
                                        }
                                    ],
                                    [
                                        {
                                            text: 'Nombre de tâches',
                                            alignment: 'left',
                                            border: [false, false, false, true],
                                        },
                                        {
                                            text: alltasks.toString() + ' tâches',
                                            alignment: 'right',
                                            border: [false, false, false, true]
                                        }
                                    ],
                                    [
                                        {
                                            text: 'Nombre de tâches faites',
                                            alignment: 'left',
                                            border: [false, false, false, true],
                                        },
                                        {
                                            text: donetasks.toString() + ' tâches faîtes',
                                            alignment: 'right',
                                            border: [false, false, false, true]
                                        }
                                    ],
                                    [
                                        {
                                            text: 'Nombre de tâches non faîtes',
                                            alignment: 'left',
                                            border: [false, false, false, true],
                                        },
                                        {
                                            text: (alltasks - donetasks).toString() + ' tâches non faîtes',
                                            alignment: 'right',
                                            border: [false, false, false, true]
                                        }
                                    ],
                                    [
                                        {
                                            text: 'Performance générale',
                                            alignment: 'left',
                                            border: [false, false, false, true]
                                        },
                                        {
                                            text: (donetasks * 100 / alltasks).toString().slice(0, 5) + '%',
                                            alignment: 'right',
                                            border: [false, false, false, true],
                                        }
                                    ]
                                ]
                            }
                        },
                        userstable,
                    ],
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            margin: [0, 0, 0, 10]
                        },
                        subheader: {
                            fontSize: 16,
                            bold: true,
                            margin: [0, 10, 0, 5]
                        },
                        tableExample: {
                            margin: [0, 5, 0, 30]
                        },
                        tableExample2: {
                            margin: [0, 5, 0, 10]
                        },
                        tableHeader: {
                            bold: true,
                            fontSize: 13,
                            color: 'black'
                        }
                    }
                };

                return generatePDF(docDefinition).catch(el => console.log(el));

            });
        }

        function generatePDF(docDefinition: any) {
            const fonts = {
                Roboto: {
                    normal: 'fonts/roboto/Roboto-Regular.ttf',
                    bold: 'fonts/roboto/Roboto-Medium.ttf',
                    italics: 'fonts/roboto/Roboto-Italic.ttf',
                    bolditalics: 'fonts/roboto/Roboto-MediumItalic.ttf'
                }
            };

            const PdfPrinter = require('pdfmake');
            const printer = new PdfPrinter(fonts);

            console.log('get past the fonts issue');

            // const doc = new pdfkit();

            const bucket = admin.storage().bucket();

            const filename = `rapport de tâches ${Date.now()}.pdf`;

            const file = bucket.file(filename);

            console.log(filename);

            const bucketFileStream = file.createWriteStream();

            // const buffers = [];



            const pdfDoc = printer.createPdfKitDocument(docDefinition);

            console.log('create the file');

            const p = new Promise((resolve, reject) => {
                pdfDoc.on("end", function () {
                    // resolve(buffers);
                    resolve(file.createReadStream())
                });
                pdfDoc.on("error", function () {
                    reject();
                });
            });

            pdfDoc.pipe(bucketFileStream);

            console.log('write in the file');

            // pdfDoc.on('data', buffers.push.bind(buffers));
            // //Add Document Text and stuff

            pdfDoc.end();
            return p.then(function (stream) {
                console.log('try 1');
                return sendMail(stream);
                // file.getSignedUrl({
                //     action: 'read',
                //     expires: '03-09-2491'
                //   }).then(signedUrls => {
                //     // signedUrls[0] contains the file's public URL
                //     console.log(signedUrls[0]);
                //   });
            });
        }
        function sendMail(buffers: any) {

            console.log('send email');

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                // port: 587,
                // secure: false,
                port: 465,
                secure: true,
                // requireTLS: true,
                auth: {
                    user: 'instanttransfermanager@gmail.com',
                    pass: 'instransfer'
                }
            });

            const mailOptions = {
                from: 'instanttransfermanager@gmail.com',
                to: 'instant.transfer@yahoo.fr, gaetan.nkema@instant-transfer.com,sylvin.njiha@instant-transfer.com,aucxence@yahoo.fr',
                subject: 'rapport de tâches',
                text: 'Rapport d\'entreprise\n\n' + 'Le Task Manager vous soumet par ce mail un rapport de performances des employés.\n' +
                    '\n\nCordialement',
                attachments: [{
                    filename: 'rapport de taches.pdf',
                    content: buffers,
                    contentType: 'application/pdf'
                }]
            };

            return setTimeout(() => {
                return transporter.sendMail(mailOptions, function (error1: any, info1: any) {
                    if (error1) {
                        console.log(error1);
                    } else {
                        console.log('Email sent: ' + info1.response);
                    }
                });
            }, 10000)
        }

    });


exports.increaseCount = functions.firestore
    .document('executions/{execId}').onCreate((snapshot: any, context: any) => { // I know this works because I have tested this multiple times

        const exec = snapshot.data();

        const alltasks: number = exec.alltasks + 1;
        const donetasks: number = (exec.status === 'done') ? exec.donetasks + 1 : exec.donetasks;
        const performance = (alltasks > 0) ? (donetasks * 100) / alltasks : 0;

        const FieldValue = admin.firestore.FieldValue;

        db.collection('users').doc(exec.assignedTo).update({
            alltasks,
            donetasks,
            performance,
            timestamp: FieldValue.serverTimestamp()
        });
    });

exports.resetPerformancesData = functions.pubsub.schedule('30 0 1 * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context: any) => {

        return db.collection('users').get().then((userCollection: any[]) => {
            const promisechain: Promise<any>[] = [];
            userCollection.forEach((user: any) => {
                const FieldValue = admin.firestore.FieldValue;
                const userdata = user.data();
                const values = {
                    alltasks: 0,
                    donetasks: 0,
                    performance: 0,
                    aftercontrole: 0,
                    timestamp: FieldValue.serverTimestamp()
                };

                const resetfields = (newvalues: any) => {
                    return db.collection('users').doc(userdata.id).update(newvalues);
                };
                promisechain.push(resetfields(values));
            });

            return Promise.all(promisechain).then(() => {
                return "status: okay";
            })
        });

    });

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.createBetterNotification = functions.firestore
    .document('tasks/{taskId}').onWrite((change: any, context: any) => { // I know this works because I have tested this multiple times

        let task: any;
        let type: string = ''

        if (!change.after.exists) {
            // deletion
            type = 'delete';
            task = change.before.data();
        } else if (!change.before.exists) {
            // creation
            type = 'create';
            task = change.after.data();

            console.log(task);

            if (task.assignedTo.length > 0 && task.assignerId.length > 0 && task.assignedTo !== task.assignerId) {
                let email: string;

                db.collection('users').doc(task.assignedTo).get()
                    .then((doc: any) => {
                        email = doc.data().email;
                        // console.log('==>' + email);

                        const transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            auth: {
                                user: 'instanttransfermanager@gmail.com',
                                pass: 'instransfer'
                            }
                        });

                        const mailOptions = {
                            from: 'instanttransfermanager@gmail.com',
                            to: email,
                            subject: task.label,
                            text: 'Notifications Système\n\n' + task.assignedToName +
                                ' vient de vous affecter une tâche: ' +
                                task.label + '.\n\nPrière de vous connecter à la plateforme pour en savoir davantage.' +
                                '\n\nCordialement'
                        };

                        transporter.sendMail(mailOptions, function (error: any, info: any) {
                            if (error) {
                                // console.log(error);
                            } else {
                                // console.log('Email sent: ' + info.response);
                            }
                        });
                    })
            }

        } else {
            // update
            type = 'update';
            task = change.after.data();
        }

        const lpad = (str: string, padString: string, length: number) => {
            let strg = str;
            while (strg.length < length)
                strg = padString + strg;
            return strg;
        }

        const now = new Date();
        const hours = lpad((now.getHours() + 1).toString(), '0', 2);
        const HourTime = hours + ':' + lpad(now.getMinutes().toString(), '0', 2);

        return db.collection('notifications').add({
            CreatedBy: task.CreatedBy,
            CreatedByName: task.CreatedByName,
            HourTime: HourTime,
            WorkedWith: task.WorkedWith || '',
            WorkedWithName: task.WorkedWithName || '',
            assignedTo: task.assignedTo || '',
            assignedToName: task.assignedToName || '',
            creationDate: now,
            discardedBy: [],
            label: task.label,
            seenBy: [
                task.CreatedBy
            ],
            status: 'public',
            subtasksNumber: task.subtasksNumber,
            taskid: context.params.taskId,
            toShowTo: task.toShowTo || [],
            type: type
        }).then((ref: any) => {
            return {
                code: '200',
                message: `ajout de la notif ${task.label} réussi`
            };
        }).catch((err: any) => {
            return {
                code: err.code,
                message: err.message
            };
        })

    });

exports.setPerformances = functions.pubsub.schedule('30 23 * * *') // 23h30 là bas pour 04h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun(async (context: any) => {


        const getUsers: () => Promise<any> = async () => {
            try {
                return new Promise(async (resolve, reject) => {
                    const usr = await db.collection('users').get();
                    resolve(usr);
                });
            } catch (err) {
                console.log(err);
            }
        };

        const getExecutions: () => Promise<any> = async () => {
            try {
                return new Promise(async (resolve, reject) => {
                    const usrexecs = await db.collection('executions')
                        .where('deadline', '>=', b)
                        .where('deadline', '<', e).get();
                    resolve(usrexecs);
                });
            } catch (err) {
                console.log(err);
            }
        };

        const b = new Date();
        const e = new Date()

        if (new Date().getDate() > 1) {
            b.setDate(1);
            b.setHours(0, 0, 0, 0); // The first of the month

            e.setMonth(e.getMonth() + 1);
            e.setDate(0);
            e.setHours(23, 59, 0, 0); // The last day of the month
        } else {
            b.setMonth(b.getMonth() - 1);
            b.setDate(1);
            b.setHours(0, 0, 0, 0); // The first of the last month

            e.setDate(0);
            e.setHours(23, 59, 0, 0); // The last day of the last month
        }

        console.log(b + ' <::::::> ' + e);

        const userCollection = await getUsers();

        const execCollection = await getExecutions();

        return new Promise((resolve, reject) => {
            let execs: any[] = execCollection.docs.map((ex: any) => ex.data());

            const promisechain: Promise<any>[] = [];

            userCollection.forEach((user: any) => {

                const userdata = user.data();
                console.log('user : ' + userdata.lastname);


                const mytasks = execs.filter((task: any) => {
                    return task.assignedTo === userdata.id;
                });

                execs = execs.filter((task) => {
                    return mytasks.indexOf(task) < 0;
                })

                const mydonetasks = mytasks.filter((task: any) => {
                    return task.status === 'done';
                });

                const alltasks: number = mytasks.length;
                const donetasks: number = mydonetasks.length;

                const performance = alltasks > 0 ? (donetasks * 100) / alltasks : 0;

                let aftercontrole = performance;

                if (userdata.total !== 100 && userdata.total !== 0 && userdata.finalnote !== 100 && userdata.finalnote !== 0) {
                    aftercontrole = performance * 0.75 + (userdata.finalnote * 100 / userdata.total) * 0.25
                }

                const FieldValue = admin.firestore.FieldValue;

                console.log(`::> ${userdata.lastname} ${userdata.firstname} : ${donetasks} / ${alltasks} = ${performance}`)

                const tobeupdated = {
                    alltasks,
                    donetasks,
                    performance,
                    aftercontrole,
                    timestamp: FieldValue.serverTimestamp()
                };

                const updating = (tobeupdat: any) => {
                    return new Promise(async (ok, ko) => {
                        try {
                            await db.collection('users').doc(userdata.id).update(tobeupdat);
                            ok('super');
                        } catch (z) {
                            ko(z);
                        }
                    })

                }

                // promisechain = promisechain.then(updating(tobeupdated)).catch((els: any) => console.log(els));
                promisechain.push(updating(tobeupdated));

            });

            Promise.all(promisechain).then(() => {
                resolve("okay for setting performances");
            }).catch(err => {
                reject(err);
            });
        })

        // return db.collection('users').get().then((userCollection: any[]) => {
        //     return db.collection('executions')
        //         .where('deadline', '>=', b)
        //         .where('deadline', '<', e).get().then(((execCollection: any) => {


        //         }));


        // }).then(() => {
        //     console.log('travail fini proprement');
        // });

    });

exports.ScheduledResetYesterday = functions.pubsub.schedule('*/30 15-16 * * *') // 17h30 là bas pour 22h30 ici
    .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
    .onRun(async (context: any) => {

        const b = new Date();
        b.setDate(b.getDate());
        b.setHours(0, 0, 0, 0);

        const e = new Date()
        e.setDate(e.getDate());
        e.setHours(23, 59, 0, 0);

        return new Promise(async (resolve, reject) => {
            const taskCollection = db.collection('tasks').where('deadline', '>=', b)
                .where('deadline', '<', e)
                .where('repeat', '==', true);

            //We define an async function
            async function getMergeData() {
                console.log('======> commit 1');
                const done = taskCollection.where('status', '==', 'done').get();
                const undone = taskCollection.where('status', '==', 'undone').get();
                const ongoing = taskCollection.where('status', '==', 'ongoing').get();
                const late = taskCollection.where('status', '==', 'late').get();


                const [doneQuerySnapshot, undoneQuerySnapshot, ongoingQuerySnapshot, lateQuerySnapshot] = await Promise.all([
                    done,
                    undone,
                    ongoing,
                    late
                ]);

                const donearray = doneQuerySnapshot.docs;
                const undonearray = undoneQuerySnapshot.docs;
                const ongoingarray = ongoingQuerySnapshot.docs;
                const latearray = lateQuerySnapshot.docs;

                const partialmerge = donearray.concat(undonearray);
                const partialmerge2 = partialmerge.concat(ongoingarray);
                const finalmerge = partialmerge2.concat(latearray);

                console.log('======> commit 2');
                return finalmerge;
            }

            const rescheduleServer = (docdata: any) => {

                console.log('======> commit n- 1');

                docdata.deadline = docdata.deadline.toDate();

                // 1. Tâches journalières - j'approuve √ (ne peut pas être faux)
                if (docdata.period === 'DAY') {

                    const deadline = new Date(docdata.deadline);
                    deadline.setDate(deadline.getDate() + 1 * docdata.every); // rescheduling to every other day later

                    return deadline;
                }

                // 2. Tâches hebdomadaires
                else if (docdata.period === 'WEEK') { // To check ✗ and make sure it's okay. It should be though

                    const weeklydeadline = docdata.weekdays.map((day: number) => { // turn weekdays into specific dates
                        const deadline = new Date(docdata.deadline);

                        if (deadline.getDay() < day) {
                            // not yet on that day
                            deadline.setDate(deadline.getDate() + (1 - deadline.getDay()) % 7 + day - 1); // the next 'day' of this week
                        } else {
                            // past that day
                            deadline.setDate(deadline.getDate() + (7 - deadline.getDay()) % 7 + day + 7 * (docdata.every - 1));
                        }

                        return deadline;
                    }).sort((a: number, d: number) => {
                        return a - d;
                    })[0]; // I sort dates to get the minimum knowing that all dates will stand after today because of my algorithm above

                    return weeklydeadline;

                }

                // 3. Tâches Mensuelles
                else if (docdata.period === 'MONTH') { // - j'approuve √ (ne peut pas être faux)

                    let monthlydeadline = new Date(docdata.deadline);

                    if (docdata.monthlyOption === 'STRAIGHTDATE') { // If the monthly option is a straight date out of the calendar every other month

                        monthlydeadline.setMonth(monthlydeadline.getMonth() + 1 * docdata.every);
                        // Simple: I go straight to the next 'every' month in line and put my deadline there
                        if (docdata.monthday === 32) { // then I know I want the last day of the month
                            monthlydeadline.setMonth(monthlydeadline.getMonth() + 1);
                            monthlydeadline.setDate(0) // this will give me the last day of THIS month. 
                        }

                        return monthlydeadline;
                    } else { // if the monthly option is a fonction of the day of the week given a certain periodicity
                        const getSpecificdays = (x: number, y: number) => {

                            const d = new Date(new Date().getFullYear(), y, 1); // get the first day of the month
                            const month = (d.getMonth());
                            // const year = d.getFullYear();

                            // if (month > 11) {
                            //   year++;
                            //   month = month % 12
                            // }
                            // console.log(`${1} - ${month} - ${year}`);
                            const mondays = [];

                            // d = new Date(year, month, 1);

                            let count = 0;

                            while (d.getDay().toString() !== x.toString()) { // This whole loop yields the first day 'x' (for instance Monday) of the month
                                // console.log(d.getDay() + ' ?= ' + x + ' === ' + (d.getDay().toString() === x.toString()))
                                d.setDate(d.getDate() + 1);
                                count = count + 1;
                                if (count === 10) { break; } // to avoid infinite loop - just in case - security - this loop should NEVER loop more than 7 times
                                // as a week has seven days
                            }

                            // Get all the other Mondays in the month
                            while (d.getMonth() === month) {
                                mondays.push(new Date(d));
                                d.setDate(d.getDate() + 7); // add the days 'x' (for instance the wednesdays of the month)
                            }

                            return mondays;
                        };

                        const relevantdays = getSpecificdays(docdata.dayofweek, monthlydeadline.getMonth() + 1 * docdata.every);

                        // console.log('relevants days are: ' + relevantdays);

                        if (docdata.dayOrder > relevantdays.length) { // the last day 'x' of the month
                            monthlydeadline = relevantdays[relevantdays.length - 1];
                        } else { // any other order
                            monthlydeadline = relevantdays[docdata.dayOrder - 1];
                        }

                        return monthlydeadline;
                    }
                }

                // 4. Yearly Tasks
                else if (docdata.period === 'YEAR') { //  - j'approuve √ (ne peut pas être faux)

                    const yearlydeadline = new Date(docdata.deadline);
                    yearlydeadline.setFullYear(yearlydeadline.getFullYear() + 1 * docdata.every);

                    return yearlydeadline;
                }
            }

            const finalupdate = (doc: any) => {
                return new Promise((ok, ko) => {
                    const docdata = doc.data();
                    const olddocdata = doc.data();

                    console.log(`${docdata.assignedToName} travaille sur ${docdata.label}`);

                    // ---- update tasks and subtasks status
                    docdata.completed = false;
                    docdata.progress = 0;
                    docdata.status = 'undone';

                    // console.log('======> commit Y');

                    if (docdata.subtasksNumber > 0) {
                        const newsubtasks = docdata.subtasks;

                        for (let i = 0; i < docdata.subtasks.length || 0; i++) {
                            newsubtasks[i].completed = false
                        }

                        docdata.subtasks = newsubtasks;
                    }

                    // figure out the deadline
                    docdata.deadline = rescheduleServer(docdata);

                    // save the old for monthly performance purposes

                    // Get a new write batch
                    const batch = db.batch();

                    // Set the value of 'NYC'
                    const nycRef = db.collection('executions').doc(uuidv4());
                    batch.set(nycRef, {
                        ...olddocdata,
                        taskid: docdata.taskid
                    });

                    // Update the population of 'SF'
                    const sfRef = db.collection('tasks').doc(docdata.taskid);
                    batch.update(sfRef, docdata);

                    // Commit the batch
                    batch.commit().then(() => {
                        ok('ok');
                    }).catch((exp: any) => ko(exp))
                })
            }

            const sendMail = () => {

                return new Promise((res, rej) => {
                    console.log('send email');

                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        // port: 587,
                        // secure: false,
                        port: 465,
                        secure: true,
                        // requireTLS: true,
                        auth: {
                            user: 'instanttransfermanager@gmail.com',
                            pass: 'instransfer'
                        }
                    });

                    const mailOptions = {
                        from: 'instanttransfermanager@gmail.com',
                        to: 'aucxence@yahoo.fr',
                        subject: 'Réinitialisation des tâches',
                        text: 'Correcte'
                    };

                    transporter.sendMail(mailOptions, function (error1: any, info1: any) {
                        if (error1) {
                            console.log(error1);
                            rej(error1);
                        } else {
                            console.log('Email sent: ' + info1.response);
                            res('Email sent: ' + info1.response);
                        }
                    });
                });
            }

            const snapshot = await getMergeData();

            const promiseChain: Promise<any>[] = [];

            console.log(`Nous avons ${snapshot.length} tâches à traiter`)

            let indx = 0;

            snapshot.forEach((doc: any) => {
                indx = indx + 1;
                console.log(`-----> Tache n°${indx} <-----`)
                // promiseChain = promiseChain.then();
                promiseChain.push(finalupdate(doc));
            });

            Promise.all(promiseChain).then(() => {
                sendMail()
                    .then(() => {
                        resolve(true)
                    })
                    .catch((el) => reject(el));

            }).catch((err) => {
                reject(err);
            });


        });

    });

exports.createItessesTasks = functions.https.onCall((data: any, context: any) => { // I know this works because I've tested it. So 100% approval - √

    const promise = new Promise((resolve, reject) => {

        const template = {
            ApprovedBy: "",
            ApprovedByName: "",
            ApprovedByEmail: "",
            CreatedBy: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            CreatedByName: "Archivaxi LOGIN",
            HourTime: "15:39",
            ProjectTitle: "",
            WorkedWith: "",
            WorkedWithName: "",
            WorkedWithEmail: "",
            assignedTo: "PUrHOGrYHKgco8InACrJKHzsmWh2",
            assignedToName: "Archivaxi LOGIN",
            assignedToEmail: "archivaxi@gmail.com",
            assignerId: "",
            assignerName: "",
            assignerEmail: "",
            completed: false,
            creationDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            dayOrder: 2,
            dayofweek: 3,
            deadline: "Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            description: "",
            every: 1,
            fonction: 0,
            label: "Brancher son onduleur, au mur patienter quelques minutes et allumer l'onduleur",
            monthday: 15,
            monthlyOption: "STRAIGHTDATE",
            period: "WEEK",
            progress: 0,
            projectId: "",
            projectStatus: true,
            repeat: true,
            startingDate: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            startingMonth: 7,
            startingYear: "Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)",
            status: "undone",
            subtasks: [],
            subtasksNumber: 0,
            taskid: "baa46b29-7d3b-4419-b3da-d9a8f45497d6",
            toShowTo: ["PUrHOGrYHKgco8InACrJKHzsmWh2", "bFunwx9k4YTe2XwI3sX1LweAKYv1", "KqFFTZQ2C4UhZtNZ2kyyRFXl8We2", "stGE4fV9iOVdpl3ofnlRmQmglJd2", "ZVw8R7wlywd0RzGrF7aaljJ8IV33", "be9CNvPS6dT4bwXVX7rHeEspf6E3", "sY4UFXWbJhRKxI9x4s4d2gfja2b2", "UdSPApWWxAPtzMb5vH7snMzUFn93", "cKhbmC6rmbX74AJuDauih399NwU2"],
            weekdays: [1, 2, 3, 4, 5, 6],
            congesstate: false
        };

        const labels = [
            'ARRIVER DANS LE POINT DE VENTE AVANT 7H',
            'PAYER TOUS LES CLIENTS AVEC LES RECUS CASH-IT',
            'MAINTENIR SA CAISSE CASH-IT A JOUR EN TOUT TEMPS',
            'FAIRE LE BILLETAGE DE TOUTES LES ESPECES EN CAISSE',
            'FAIRE UN BON RANGEMENT DES PIECES COMPTABLES',

            'ENVOI DU RAPPORT CASH IT EN LIGNE',
            'ENVOI DU RAPPORT MONEYGRAM PAR MAIL',
            'ENVOI DU RAPPORT WESTERN UNION PAR MAIL',
            'ENVOI DU RAPPORT RAPID TRANSFER PAR MAIL',
            'ENVOI DU RAPPORT RIA PAR MAIL',

            'ENVOI DU RAPPORT SMALL WORLD PAR MAIL',
            'ENVOI DU RAPPORT FLASH TRANSFER PAR MAIL',
            'ENVOI DU RAPPORT SMOBILPAY PAR MAIL',
            'ENVOI DES SOLDES PAR MAIL',
            'COCHER LE TASK MANAGER AVEC INTEGRITE'
        ];

        const tasks = [];

        const n = labels.length;

        for (let i = 0; i < n; i++) {
            const tmpt = { ...template };
            tmpt['label'] = labels[n - 1 - i];
            tasks.push(tmpt);
        }

        const lpad = (str: string, padString: string, length: number) => {
            let strg = str;
            while (strg.length < length)
                strg = padString + strg;
            return strg;
        }

        const promiseChain: Promise<any>[] = [];

        tasks.forEach((task: any) => {
            const now = new Date();
            const hours = now.getHours() + 1;
            const HourTime = lpad(hours.toString(), '0', 2) + ':' + lpad(now.getMinutes().toString(), '0', 2);

            task.CreatedBy = data.CreatedBy;
            task.CreatedByName = data.CreatedByName;
            task.HourTime = HourTime;
            task.assignedTo = data.CreatedBy;
            task.assignedToName = data.CreatedByName;
            task.creationDate = now;
            task.deadline = now;
            task.startingDate = now;
            task.startingYear = now;
            task.taskid = uuidv4();
            task.fonction = data.fonction;
            task.congesstate = false;

            promiseChain.push(db.collection('tasks').doc(task.taskid).set(task));
        });

        Promise.all(promiseChain).then(() => {
            resolve("okay... all tasks created well");
        }).catch((err) => {
            reject(err);
        });
    });

    return promise;

});