import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Task } from '../models/task';
import { AuthService } from './auth.service';
import { User } from '../models/user';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export class PdfPrinter {

    execs: Task[][];

    doneexecs: Task[][];
    undoneexecs: Task[][];

    user: User;
    // taskexecs: Task[];

    days: any[] = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    months: any[] = ['Janvier', 'Février', 'Mars',
        'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    monthtoconsider: number;
    datetoconsider: Date = undefined;

    constructor() { }

    setExecs(splitexecs: Task[][]) {
        this.execs = splitexecs;
    }

    setUser(user: User) {
        this.user = user;
    }

    setMonthToConsider(monthtoconsider: number) {
        this.monthtoconsider = monthtoconsider;
    }

    setDateToConsider(datetoconsider: Date) {
        this.datetoconsider = this.datetoconsider;
    }

    // setServiceExecutions(taskexecs: Task[]) {
    //     this.taskexecs = taskexecs;
    // }

    init() {
        this.doneexecs = this.execs.map((dailylist) => {
            return dailylist.filter((tache) => {
                return tache.status === 'done';
            });
        }).filter((dailylist) => {
            return dailylist.length > 0;
        });
        this.undoneexecs = this.execs.map((dailylist) => {
            return dailylist.filter((tache) => {
                return tache.status !== 'done';
            });
        }).filter((dailylist) => {
            return dailylist.length > 0;
        });
    }

    // printJson() {
    //     const temp = this.taskexecs.map(task => {
    //         return task.toObject();
    //     });

    //     const tsk = this.execs.map(execlist => {
    //         return execlist.map(exec => {
    //             return exec.toObject();
    //         });
    //     });

    //     console.log(this.execs.length);
    //     console.log(tsk.length);

    //     console.log(JSON.stringify(tsk[0]));
    //     console.log(JSON.stringify(tsk[1]));
    //     console.log(JSON.stringify(tsk[2]));

    //     // console.log(temp);
    // }

    generatePdf() {
        
        pdfMake.createPdf(this.documentDefinition()).open();

    }

    compute(tempexecs) {
        let somme = 0;
        tempexecs.forEach(dailylist => {
            somme = somme + dailylist.length;
        });
        return somme;
    }

    private documentDefinition() {

        pdfMake.fonts = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-Italic.ttf'
            },
            Courier: {
                normal: 'Courier',
                bold: 'Courier-Bold',
                italics: 'Courier-Oblique',
                bolditalics: 'Courier-BoldOblique'
            },
            Helvetica: {
                normal: 'Helvetica.ttf',
                bold: 'Helvetica-Bold.ttf',
                italics: 'Helvetica-Oblique.ttf',
                bolditalics: 'Helvetica-BoldOblique.ttf'
            },
            Times: {
                normal: 'Times-Roman',
                bold: 'Times-Bold',
                italics: 'Times-Italic',
                bolditalics: 'Times-BoldItalic'
            },
            Symbol: {
                normal: 'Symbol'
            },
            ZapfDingbats: {
                normal: 'ZapfDingbats'
            }
        };

        // this.execs = splitexecs.default;

        // this.randomize();

        this.init();

        const totaltasks = this.compute(this.execs);
        const donetasks = this.compute(this.doneexecs);

        const undonetables = this.undoneexecs.map(execution => {
            const tasklines = execution.map(task => {
                return [
                    {
                        text: task.label,
                        alignment: 'left',
                    },
                    {
                        text: 'non fait',
                        alignment: 'right',
                        noWrap: true
                    }
                ];
            });

            const dt = new Date(execution[0].deadline);

            const deftable = {
                style: 'tableExample',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            {
                                text: this.days[dt.getDay()] + ' ' + dt.toLocaleDateString(),
                                alignment: 'center',
                                colSpan: 2,
                                style: 'tableHeader'
                            },
                            {}
                        ],
                        ...tasklines,
                    ]
                },
            };

            return deftable;
        });

        let bigdt: Date;

        const donetables = this.doneexecs.map(execution => {
            const tasklines = execution.map(task => {
                return [
                    {
                        text: task.label,
                        alignment: 'left',
                    },
                    {
                        text: 'fait',
                        alignment: 'right',
                        noWrap: true
                    }
                ];
            });

            const dt = new Date(execution[0].deadline);

            const deftable = {
                style: 'tableExample',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            {
                                text: this.days[dt.getDay()] + ' ' + dt.toLocaleDateString(),
                                alignment: 'center',
                                colSpan: 2,
                                style: 'tableHeader'
                            },
                            {}
                        ],
                        ...tasklines,
                    ]
                },
            };

            return deftable;
        });

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
                                    text: 'Résumé et Performance',
                                    alignment: 'center',
                                    border: [false, false, false, true],
                                    fontSize: 25
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
                                    text: 'Mois d\'' + this.months[this.monthtoconsider - 1],
                                    alignment: 'left',
                                    colSpan: 2,
                                    border: [false, false, false, true],
                                },
                                {}
                            ],
                            [
                                {
                                    text: this.user.firstname + ' ' + this.user.lastname,
                                    alignment: 'left',
                                    border: [false, false, false, true],
                                },
                                {
                                    text: this.execs.length === 1 ?
                                        this.days[this.execs[0][0].deadline.getDay()] + ' ' + this.execs[0][0].deadline.toLocaleDateString()
                                        : new Date().toISOString().slice(0, 10),
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
                                    text: totaltasks.toString() + ' tâches',
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
                                    text: (totaltasks - donetasks).toString() + ' tâches non faîtes',
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
                                    text: (donetasks * 100 / totaltasks).toString().slice(0, 5) + '%',
                                    alignment: 'right',
                                    border: [false, false, false, true],
                                }
                            ]
                        ]
                    }
                },
                (totaltasks - donetasks > 0) ? {
                    style: 'tableExample',
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: 'I- Détails des ' + (totaltasks - donetasks).toString() + ' tâches non faites',
                                    alignment: 'center',
                                    border: [false, false, false, true],
                                    fontSize: 25
                                }
                            ]
                        ]
                    }
                } : '',
                ...undonetables.map(t => {
                    return [t, 
                        {
                        style: 'tableExample2',
                        // pageBreak: 'after'
                        text: ''
                    }];
                }),

                {
                    text: '',
                    alignment: 'center',
                    border: [false, false, false, false],
                    pageBreak: donetasks > 0 ? 'after' : ''
                },

                donetasks > 0 ? {
                    style: 'tableExample',
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: 'II- Détails des ' + donetasks.toString() + ' tâches faites',
                                    alignment: 'center',
                                    border: [false, false, false, true],
                                    fontSize: 25
                                }
                            ]
                        ]
                    }
                } : '',
                ...donetables.map(t => {
                    return [t, {
                        style: 'tableExample2',
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: '',
                                        alignment: 'center',
                                        border: [false, false, false, false],
                                    }
                                ]
                            ]
                        },

                        // pageBreak: 'after'
                    }];
                })
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

}