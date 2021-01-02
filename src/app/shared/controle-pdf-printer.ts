import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { User } from '../models/user';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export class ControlePdfPrinter {

    controles: any[][];

    user: User;
    // anycontroles: any[];

    days: any[] = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    months: any[] = ['Janvier', 'Février', 'Mars',
        'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    monthtoconsider: number;
    datetoconsider: Date = undefined;

    constructor() { }

    setControles(splitControles: any[][]) {
        this.controles = splitControles;
    }

    setUser(user: User) {
        this.user = user;
    }

    setMonthToConsider(monthtoconsider: number) {
        this.monthtoconsider = monthtoconsider;
    }

    setDateToConsider(datetoconsider: Date) {
        this.datetoconsider = datetoconsider;
    }

    // setServiceExecutions(anycontroles: any[]) {
    //     this.anycontroles = anycontroles;
    // }

    init() {

    }

    // printJson() {
    //     const temp = this.anycontroles.map(any => {
    //         return any.toObject();
    //     });

    //     const tsk = this.controles.map(execlist => {
    //         return execlist.map(exec => {
    //             return exec.toObject();
    //         });
    //     });

    //     console.log(this.controles.length);
    //     console.log(tsk.length);

    //     console.log(JSON.stringify(tsk[0]));
    //     console.log(JSON.stringify(tsk[1]));
    //     console.log(JSON.stringify(tsk[2]));

    //     // console.log(temp);
    // }

    generatePdf() {

        pdfMake.createPdf(this.documentDefinition()).open();

    }

    compute(tempcontroles) {
        let somme = 0;
        tempcontroles.forEach(dailylist => {
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

        // this.controles = splitControles.default;

        // this.randomize();

        const totalanys = this.compute(this.controles);

        const controletables = this.controles.map((day) => {
            const controlelines = day.map((controle, index) => {
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
                        text: (controle.date.toDate() as Date).getHours() + ':' + (controle.date.toDate() as Date).getMinutes(),
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
                                text: this.days[dt.getDay()] + ' ' + dt.toLocaleDateString(),
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
                                    text: this.datetoconsider === undefined ?
                                         'rapport du mois de ' + this.months[this.monthtoconsider - 1]
                                         : 'rapport du ' + this.datetoconsider.toLocaleDateString(),
                                    alignment: 'left',
                                    colSpan: 2,
                                    border: [false, false, false, true],
                                },
                                {}
                            ],
                        ]
                    }
                },

                this.controles.length > 0 ? {
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
                ...controletables.map(t => {
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

}