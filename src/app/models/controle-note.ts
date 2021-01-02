import * as uuid from 'uuid';

export class ControleNote {

    who: string = '';
    whoname: string = '';
    doneby: string = '';
    donebyid: string = '';
    date: any = new Date();
    criteria: {
        [key: string]: boolean
    } = {
        ponctualite: true,
        motivation: true,
        accueil: true,
        organisation: true,
        procedure: true
    };
    note = 5;
    comment: any = 'RAS';
    total = 5;
    savedId = uuid.v4();
    agence = '';

    toJSON() {
        const val: { [key: string]: any } = {};
        // tslint:disable-next-line: forin
        for (const prop in this) {
            if (prop !== 'toJSON') { val[prop] = this[prop]; }
        }

        let total = 0;

        for (const prop in val.criteria) {
            if (val.criteria[prop] === true) {
                total = total + 1;
            }
        }

        val.total = total;

        return val;
    }

}
