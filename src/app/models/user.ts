export class User {
    id?: string;
    email: string;
    password?: string;
    firstname: string;
    lastname: string;
    projects?: string[];
    status?: boolean;
    fonction?: number;
    modules?: string[];

    alltasks?: number;
    donetasks?: number;
    performance?: number;
    timestamp?: any;

    evaluation ?= false;
    notes?: any[] = [];
    finalnote ?= 100;
    total ?= 100;

    discipline ?= [];
}
