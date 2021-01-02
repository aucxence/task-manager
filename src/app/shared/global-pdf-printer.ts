import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Task } from '../models/task';
import { AuthService } from './auth.service';
import { User } from '../models/user';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export class GlobalPdfPrinter {

    execs: Task[][];

    userlist: User[];

    days: any[] = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    months: any[] = ['Janvier', 'Février', 'Mars',
        'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    monthtoconsider: number;
    alltasks: number;
    donetasks: number;

    constructor() { }

    setAlltasks(alltasks) {
        this.alltasks = alltasks;
    }

    setDonetasks(donetasks) {
        this.donetasks = donetasks;
    }

    setUserList(userlist: User[]) {
        this.userlist = userlist;
    }

    setMonthToConsider(monthtoconsider: number) {
        this.monthtoconsider = monthtoconsider;
    }

    generatePdf() {

        pdfMake.createPdf(this.documentDefinition()).open();

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

        const userlines = this.userlist.map(user => {
            return [
                {
                    text: user.firstname + ' ' + user.lastname,
                    alignment: 'left',
                },
                {
                    text: user.performance.toString().slice(0, 4) + ' %',
                    alignment: 'right',
                    noWrap: true
                }
            ];
        });

        const userstable = {
            style: 'tableExample',
            table: {
                widths: ['*', 'auto'],
                body: [
                    [
                        {
                            text: this.userlist.length.toString() + ' personnes évaluées',
                            alignment: 'center',
                            colSpan: 2,
                            style: 'tableHeader'
                        },
                        {}
                    ],
                    ...userlines, // because 'map' puts arrays in an array
                ]
            },
        };

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
                                    text: 'Mois d\'' + this.months[this.monthtoconsider - 1],
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
                                    text: this.userlist.length.toString() + ' personnes évaluées',
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
                                    text: this.alltasks.toString() + ' tâches',
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
                                    text: this.donetasks.toString() + ' tâches faîtes',
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
                                    text: (this.alltasks - this.donetasks).toString() + ' tâches non faîtes',
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
                                    text: (this.donetasks * 100 / this.alltasks).toString().slice(0, 5) + '%',
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
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        return def;
    }

}
