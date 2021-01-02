import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { User } from '../models/user';

import { Response, ResponseCode } from '../models/response';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { rejects } from 'assert';
import { ControleNote } from '../models/controle-note';
import * as uuid from 'uuid';

@Injectable({ providedIn: 'root' })
export class AuthService {

  public currentUser: firebase.User;

  public user = new User();

  public fadeOut = false;

  alltasks: any[] = [];
  allusers: User[] = [];
  executions: any[] = [];
  assignedtasks: any[] = [];

  constructor(private _auth: AngularFireAuth, private _firestore: AngularFirestore) {
    this.LoginStatusChange().then(e => {
      this.currentUser = e as firebase.User;
      this.user.email = '';
      // console.log(e)
    });
  }

  resetPassword(utilisateur: User) {
    return new Promise((resolve, reject) => {
      console.log('-----------');
      console.log(utilisateur.email);
      this._auth.sendPasswordResetEmail(utilisateur.email)
        .then(() => {
          const response: Response = new Response();
          response.code = ResponseCode.Success;
          response.message = 'Allez dans votre boite mail pour réinitialiser votre mot de passe';
          resolve(response);
        })
        .catch((e) => {
          const response: Response = new Response();
          response.code = ResponseCode.Error;
          response.message = e.message;
          reject(response);
        });
    });
  }

  SignIn(user: User): Promise<Response> {

    this.user = user;

    return new Promise((success, wrong) => {
      this._auth.signInWithEmailAndPassword(user.email, user.password).then(async result => {
        this.currentUser = result.user;
        if (result.user.emailVerified) {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Connexion réussie';
          this.StatusChange(true);
          this.GetUser().then((userpromised) => {
            this.user = userpromised;
            console.log(this.user);
            success(_response);
          });
        } else {
          let _response: Response = new Response();
          _response.code = ResponseCode.Error;
          _response.message = 'Svp vérifiez votre compte en cliquant sur le lien dans votre boite mail';
          wrong(_response);
        }
      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        wrong(_response);
      });
    });

  }

  register(user: User): Promise<Response> {

    this.user = user;

    // console.log(this.user);

    return new Promise((resolve, reject) => {
      this._auth.createUserWithEmailAndPassword(user.email, user.password).then((result) => {

        result.user.sendEmailVerification().then(() => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Email de vérification envoyé';

          this.DisplayNameAndPictureChange(
            'https://cdn1.iconfinder.com/data/icons/social-messaging-productivity-1-1/128/gender-male2-512.png',
            user.firstname + ' ' + user.lastname,
          );

          resolve(_response);
        }).catch(err => {
          let _response: Response = new Response();
          _response.code = err.code;
          _response.message = err.message as string;
          reject(_response);
        });

        // console.log(result);
        // this.SignIn(user).then(e => {
        //   let _response: Response = new Response();
        //   _response.code = ResponseCode.Success;
        //   _response.message = 'Inscription et connexion réussies';

        //   this.DisplayNameAndPictureChange('https://cdn1.iconfinder.com/data/icons/social-messaging-productivity-1-1/128/gender-male2-512.png');

        //   resolve(_response);
        // }).catch(err => reject(err));

      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        reject(_response);
      });
    });
  }

  addConges(conge: any): Promise<Response> {


    // console.log(this.user);

    return new Promise((resolve, reject) => {
      this._firestore.collection('conges').add(conge)
        .then((ref) => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Ajout bien effectué';
          resolve(_response);
        }).catch(error => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Error;
          _response.message = error.message;
          reject(_response);
        })
    });
  }

  updateConges(conge: any): Promise<Response> {
    return new Promise((resolve, reject) => {
      this._firestore.collection('conges').doc(conge.congeid).update(conge)
        .then((ref) => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Mise à jour bien effectué';
          resolve(_response);
        }).catch(error => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Error;
          _response.message = error.message;
          reject(_response);
        });
    });
  }

  isLogin() {
    // console.log(this._auth.currentUser);
    return new Promise((resolve, reject) => {
      this.LoginStatusChange().then(e => { resolve(e != null); }).catch(p => { console.log(p); reject(p) });
    });
    // return this._auth.currentUser != null ? true : false;
  }

  LoginStatusChange() {
    return new Promise((resolve, reject) => {
      this._auth.onAuthStateChanged(e => {
        // this._firestore.doc(`users/${this._auth.currentUser.uid}`).set({ status: true }, { merge: true }).then(() => {
        resolve(e);
        // })
      }, err => {
        reject(err);
      });
    });
  }

  SingOut() {

    return new Promise((resolve, reject) => {
      // console.warn("log-off");
      this._auth.signOut().then((result) => {
        // console.log(result);

        let _response: Response = new Response();
        _response.code = ResponseCode.Success;
        _response.message = 'Déconnexion réussi';
        resolve(_response);

      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        reject(_response)
      });
    });


  }

  StatusChange(state: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (state) {
        // tslint:disable-next-line: max-line-length
        this._firestore.doc(`users/${(await this._auth.currentUser).uid}`)
          .set(
            JSON.parse(JSON.stringify({ status: state })),
            { merge: true })
          .then((e) => resolve())
          .catch(e => reject());
      }
      else {
        // tslint:disable-next-line: max-line-length
        this._firestore.doc(`users/${(await this._auth.currentUser).uid}`)
          .set(
            JSON.parse(JSON.stringify({ status: state, logOutDate: new Date() })),
            { merge: true })
          .then((e) => resolve())
          .catch(e => reject());

      }

    });
  }

  async DisplayNameAndPictureChange(imageUrl: string, displayName: string = '') {

    // console.log("user:", this._auth.currentUser.uid);
    displayName = displayName === '' ? (await this._auth.currentUser).displayName : displayName;

    (await this._auth.currentUser).updateProfile({
      photoURL: imageUrl,
      displayName
    }).then(async e => {
      // console.log("e", e);
      const user = new User();

      user.id = (await this._auth.currentUser).uid;
      user.email = this.user.email;
      user.firstname = this.user.firstname;
      user.lastname = this.user.lastname;
      user.projects = this.user.projects;
      user.fonction = this.user.fonction;
      user.status = true;
      user.modules = [
        'tasks'
      ];
      user.performance = 0;
      user.alltasks = 0;
      user.donetasks = 0;
      user.evaluation = (user.fonction > 1500) ? false : true;
      user.notes = [];
      user.finalnote = 100;
      user.total = 100;
      // user.picture = (await this._auth.currentUser).photoURL;

      // console.log(e);
      this.UpdateProfile(user).catch(err => {
        // console.log('err', err);
        // this.CreateProfile(user);


      });
    });
  }

  // CreateProfile(user: MemberUser): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._firestore.collection("users").add(JSON.parse(JSON.stringify(user))).then(e => {
  //       let _response: Response = new Response();
  //       _response.code = ResponseCode.Success;
  //       _response.message = "Kayıt işlemi başarılı.";
  //       resolve(_response);
  //     }).catch(err => {
  //       let _response: Response = new Response();
  //       _response.code = ResponseCode.Error;
  //       _response.message = err.message;
  //       reject(_response);
  //     });
  //   })
  // }

  UpdateProfile(user: User): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // this._firestore.collection("users", ref => ref.where("email", "==", this.currentUser.email)).snapshotChanges().subscribe(doc => {
      this._firestore.doc(`users/${(await this._auth.currentUser).uid}`).set(JSON.parse(JSON.stringify(user)), { merge: true }).then(e => {
        let _response: Response = new Response();
        _response.code = ResponseCode.Success;
        _response.message = 'Mise à jour de profil réussi';
        resolve(_response);
      }).catch(err => {
        let _response: Response = new Response();
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    });

  }




  async GetUser(): Promise<User> {
    return new Promise(async (resolve, reject) => {
      this._firestore.doc(`users/${(await this._auth.currentUser).uid}`).get().subscribe(e => {
        // console.log(e.data());
        resolve(e.data() as User);
      });
    });
  }

  GetAllUsers(): Promise<Observable<DocumentChangeAction<unknown>[]>> {
    return new Promise((resolve, reject) => {
      resolve(this._firestore.collection(`users`, ref => {
        return ref.orderBy('firstname');
      }).snapshotChanges());

    });
  }

  GetAllAgences() {
    return this._firestore.collection(`ITAgences`, ref => {
      return ref.orderBy('SDIAGN');
    }).get();
  }

  snapshotAllUsers(): Observable<DocumentChangeAction<unknown>[]> {
    return this._firestore.collection(`users`, ref => {
      return ref.orderBy('firstname');
    }).snapshotChanges();
  }

  addControle(notes: any[], controle: any) {
    return new Promise((resolve, reject) => {

      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Contrôle réussi';

      notes.push(controle);
      this._firestore.collection('users').doc(controle.who).update({
        notes
      }).then(() => {
        resolve(_response);
      }).catch((error) => {
        _response.code = ResponseCode.Error;
        _response.message = 'Problème rencontré';
        reject(_response);
      });
    });
  }

  batchRegisterControles(controlledPerson: User, controle: any): Promise<void> {

    const batch = this._firestore.firestore.batch();

    controlledPerson.notes.push(controle);

    let finalnote = 0;
    let total = 0;

    controlledPerson.notes.forEach(notation => {
      finalnote = finalnote + notation.note;
      total = total + notation.total;
    });

    const userref = this._firestore.collection('users').doc(controle.who).ref;

    batch.update(userref, {
      notes: controlledPerson.notes,
      finalnote,
      total
    });

    const controleref = this._firestore.collection('controles').doc(controle.savedId).ref;

    batch.set(controleref, controle);

    // --------------------------------------------------------------------

    const task: { [key: string]: any } = {
      ApprovedBy: '',
      ApprovedByName: '',
      ApprovedByEmail: '',
      CreatedBy: 'PUrHOGrYHKgco8InACrJKHzsmWh2',
      CreatedByName: 'Archivaxi LOGIN',
      HourTime: '15:39',
      ProjectTitle: '',
      WorkedWith: '',
      WorkedWithName: '',
      WorkedWithEmail: '',
      assignedTo: 'PUrHOGrYHKgco8InACrJKHzsmWh2',
      assignedToName: 'Archivaxi LOGIN',
      assignedToEmail: 'archivaxi@gmail.com',
      assignerId: '',
      assignerName: '',
      assignerEmail: '',
      completed: false,
      creationDate: 'Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)',
      dayOrder: 2,
      dayofweek: 3,
      deadline: 'Tue Jul 07 2020 15:39:45 GMT+0100 (heure normale d’Afrique de l’Ouest)',
      description: '',
      every: 1,
      fonction: 0,
      label: 'Brancher son onduleur, au mur patienter quelques minutes et allumer l\'onduleur',
      monthday: 15,
      monthlyOption: 'STRAIGHTDATE',
      period: 'WEEK',
      progress: 0,
      projectId: '',
      projectStatus: true,
      repeat: true,
      startingDate: 'Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)',
      startingMonth: 7,
      startingYear: 'Tue Jul 07 2020 15:39:36 GMT+0100 (heure normale d’Afrique de l’Ouest)',
      status: 'undone',
      subtasks: [],
      subtasksNumber: 0,
      taskid: 'baa46b29-7d3b-4419-b3da-d9a8f45497d6',
      toShowTo: ['PUrHOGrYHKgco8InACrJKHzsmWh2', 'bFunwx9k4YTe2XwI3sX1LweAKYv1', 'KqFFTZQ2C4UhZtNZ2kyyRFXl8We2', 'stGE4fV9iOVdpl3ofnlRmQmglJd2', 'ZVw8R7wlywd0RzGrF7aaljJ8IV33', 'be9CNvPS6dT4bwXVX7rHeEspf6E3', 'sY4UFXWbJhRKxI9x4s4d2gfja2b2', 'UdSPApWWxAPtzMb5vH7snMzUFn93', 'cKhbmC6rmbX74AJuDauih399NwU2'],
      weekdays: [1, 2, 3, 4, 5, 6],
      congesstate: false
    };

    const lpad = (str: string, padString: string, length: number) => {
      let strg = str;
      while (strg.length < length) { strg = padString + strg; }
      return strg;
    };

    const now = new Date();
    const hours = now.getHours() + 1;
    const HourTime = lpad(hours.toString(), '0', 2) +
      ':' +
      lpad(now.getMinutes().toString(), '0', 2);

    task.CreatedBy = controle.donebyid;
    task.CreatedByName = controle.doneby;

    task.HourTime = HourTime;

    task.assignedTo = controle.who;
    task.assignedToName = controle.whoname;

    task.creationDate = now;
    task.deadline = now;
    task.startingDate = now;
    task.startingYear = now;
    task.taskid = controle.savedId;
    task.fonction = controlledPerson.fonction;
    task.congesstate = false;
    task.label = 'Moi, ' +
      controle.whoname +
      ', reconnais avoir été controllé(e)' +
      ' le ' +
      now.toLocaleString().substring(0, 18) +
      '.';

    task.completed = false;

    task.repeat = false;

    task.subtasks = [
      {
        task: 'j\'ai été controllé par ' + controle.doneby,
        completed: false
      },
      {
        task:
          'j\'accepte que la note obtenue serve à évaluer mes performances',
        completed: false
      }
    ];

    task.subtasksNumber = 2;

    const taskref = this._firestore.collection('tasks').doc(task.taskid).ref;

    batch.set(taskref, task);

    // --------------------------------------------------------------------

    return batch.commit();

  }

  batchDeleteControle(controledPerson: User, nt: any) {
    const batch = this._firestore.firestore.batch();

    const notes = controledPerson.notes;

    let finalnote = controledPerson.finalnote;
    let total = controledPerson.total;

    finalnote = finalnote - nt.note;
    total = total - nt.total;

    const userref = this._firestore.collection('users').doc(controledPerson.id).ref;

    batch.update(userref, {
      notes,
      finalnote,
      total
    });

    const controleref = this._firestore.collection('controles').doc(nt.savedId).ref;

    batch.delete(controleref);

    const taskref = this._firestore.collection('tasks').doc(nt.savedId).ref;

    batch.delete(taskref);

    return batch.commit();
  }

  getConges(): Observable<DocumentChangeAction<unknown>[]> {
    return this._firestore.collection(`conges`, (ref) => {
      const dt = new Date();
      let rf = ref.where('returnDate', '>=', new Date(dt.getFullYear(), dt.getMonth(), 1, 1, 0, 0, 0));
      if (this.user.fonction < 1000) {
        rf = rf.where('employeID', '==', this.user.id);
      }
      return rf;
    }).snapshotChanges();
  }

  getRelevantTasks = () => {
    const getRelevantTasks = firebase.functions().httpsCallable('getRelevantTasks');

    const today = new Date();
    const lastthirtydays = new Date();

    lastthirtydays.setDate(lastthirtydays.getDate() - 30);

    // console.log(lastthirtydays + ' -- ' + today);

    return getRelevantTasks({
      beginningDate: lastthirtydays.toDateString(),
      endingDate: today.toDateString(),
    });
  }

  createBulkTasksForItesses = () => {
    const createItessesTasks = firebase.functions().httpsCallable('createItessesTasks');

    const today = new Date();
    const lastthirtydays = new Date();

    lastthirtydays.setDate(lastthirtydays.getDate() - 30);

    // console.log(lastthirtydays + ' -- ' + today);

    return createItessesTasks({
      CreatedBy: this.user.id,
      CreatedByName: this.user.firstname + ' ' + this.user.lastname,
      fonction: this.user.fonction
    });
  }

  initTasks(): Promise<Response> {

    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Chargement des tâches réussi';

      this.getRelevantTasks().then((val) => {
        this.alltasks = val.data.tasks;
        resolve(_response);
      })
        .catch(err => {
          _response.code = ResponseCode.Error;
          _response.message = err.message as string;
          reject(err);
        });
    });

  }

  getLiveRelevantTasks(data: any) {
    const bgn = new Date(data.beginningDate);
    // console.log('----> ' + JSON.stringify(data.beginningDate));
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    // console.log('----> ' + JSON.stringify(data.endingDate));
    end.setHours(24, 0, 0, 0);

    // console.log(bgn + ' -- ' + end);

    console.log('><-------------------------------------------------><');

    console.log('><-------------------------------------------------><');

    return this._firestore.collection('tasks', ref => {
      let request = ref.where('deadline', '>=', bgn)
        .where('deadline', '<=', end)
        .where('assignedTo', '==', this.currentUser.uid);

      if (data.taskOption) {
        if (data.taskOption === 'spontaneous') {
          request = request.where('repeat', '==', false);
        } else if (data.taskOption === 'scheduled') {
          request = request.where('repeat', '==', true);
        } else if (data.taskOption === 'newlyAdded') {
          const sevendaysago = (date: Date) => {
            const d = new Date(date);
            d.setDate(d.getDate() - 7);
            return d;
          };

          const begdate: Date = sevendaysago(new Date());
          begdate.setHours(0, 0, 0, 0);
          const today: Date = new Date();
          today.setHours(24, 0, 0, 0);

          request = request
            .where('startingDate', '>=', begdate)
            .where('startingDate', '<=', today);
        } else {
          request = request.where('status', '==', data.taskOption);
        }
      }

      return request.orderBy('deadline', 'desc');
    }).snapshotChanges();
  }

  getLiveTasks() {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    today.setHours(23, 59, 59, 999);

    const lastthirtydays = new Date();
    lastthirtydays.setDate(lastthirtydays.getDate() - 30);
    lastthirtydays.setHours(0, 0, 0, 0);

    console.log('><-------------------------------------------------><');

    console.log('><-------------------------------------------------><');

    return this.getLiveRelevantTasks({
      beginningDate: lastthirtydays.toDateString(),
      endingDate: today.toDateString(),
    });
  }

  saveTask(task): Promise<Response> {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Enregistrement réussi';

      this._firestore.collection('tasks').doc(task.taskid).set(task).then(ref => {
        resolve(_response);
      }).catch(err => {
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    });
  }

  updateEvaluation(user: User): Promise<Response> {
    return new Promise((resolve, reject) => {
      this._firestore.collection('users').doc(user.id).update({
        evaluation: !user.evaluation
      }).then(() => {
        const _response: Response = new Response();
        _response.code = ResponseCode.Success;
        _response.message = 'Mise à jour réussie';
        resolve(_response);
      }).catch((error) => {
        const _error: Response = new Response();
        _error.code = ResponseCode.Error;
        _error.message = 'Echec de mise à jour';
        reject(_error);
      });
    });
  }

  updateTaskStatus(task): Promise<Response> {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Enregistrement réussi';


      this._firestore.collection('tasks').doc(task.taskid).update({
        status: task.status,
        progress: task.progress,
        subtasks: task.subtasks,
        subtasksNumber: task.subtasks.length,
        HourTime: task.HourTime,
        deadline: task.deadline
      }).then(ref => {
        resolve(_response);
      }).catch(err => {
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    });
  }

  getLiveNotifications(data: any) {
    const bgn = new Date(data.beginningDate);
    // console.log('----> ' + JSON.stringify(data.beginningDate));
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    // console.log('----> ' + JSON.stringify(data.endingDate));
    end.setHours(23, 59, 0, 0);

    // console.log(bgn + ' -- ' + end);

    return this._firestore.collection('notifications', ref => {
      const request = ref.where('toShowTo', 'array-contains', this.currentUser.uid);
      return request.orderBy('creationDate', 'desc');
    }).snapshotChanges();
  }

  getExecutions(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('executions', ref => {
      const request = ref.where('deadline', '>=', bgn)
        .where('deadline', '<=', end)
        .where('assignedTo', '==', this.currentUser.uid);

      return request.orderBy('deadline', 'desc');
    }).get();
  }

  getControles(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('controles', ref => {
      const request = ref.where('date', '>=', bgn)
        .where('date', '<=', end);

      return request.orderBy('date', 'desc');
    }).get();
  }

  getEmployeesExecutions(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('executions', ref => {
      const request = ref.where('deadline', '>=', bgn)
        .where('deadline', '<=', end)
        .where('assignedTo', '==', data.employeeID);

      return request.orderBy('deadline', 'desc');
    }).get();
  }

  getAllExecutions(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(23, 59, 0, 0);

    return this._firestore.collection('executions', ref => {
      const request = ref.where('deadline', '>=', bgn)
        .where('deadline', '<=', end)
      // .where('assignedTo', '==', data.employeeID);

      return request.orderBy('deadline', 'desc');
    }).get();
  }

  getAssignedTasks(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('tasks', ref => {
      const request = ref.where('creationDate', '>=', bgn)
        .where('creationDate', '<=', end)
        .where('assignerId', '==', this.currentUser.uid);

      return request.orderBy('creationDate', 'desc').limit(100);
    }).snapshotChanges();
  }

  getGrades() {
    return this._firestore.collection('fonctions').get();
  }

  updateUserHabilitations(id: string, modules: string[]) {
    return this._firestore.collection('users').doc(id).update({
      modules
    });
  }

  loadFile(json: any[]) {

    return new Promise((right, wrong) => {
      const promises: Promise<any>[] = [];
      json.forEach((element) => {
        promises.push();
      });

      const response: Response = new Response();

      Promise.all(promises)
        .then(() => {
          response.code = ResponseCode.Success;
          response.message = 'Chargement bien effectué';
          right(response);
        })
        .catch((e) => {
          response.code = ResponseCode.Error;
          response.message = e.message;
          right(response);
        });
    });
  }

  loadEachOpe(element: any) {
    return this._firestore.collection('chargement').doc(element['Reference ID']).set(element);
  }

  getPuces() {
    return this._firestore.collection('puces').get();
  }

  getMgCommissions() {
    return this._firestore.collection('mg_commissions').get();
  }

  getMoMoCommissions() {
    return this._firestore.collection('momo_commissions').get();
  }

  getCashITTrans(request: string) {

    const getCashIT = firebase.functions().httpsCallable('getCashITTrans');

    return getCashIT({
      request
    });

  }

  getRecursiveCashITTrans(request: string, cashitdate1: string, cashitdate2: string) {

    const getRecursiveCashIT = firebase.functions().httpsCallable('getRecursiveCashITTrans');

    return getRecursiveCashIT({
      request,
      date1: cashitdate1,
      date2: cashitdate2
    });

  }

  getStats(beginningDate: Date, endingDate: Date) {

    const getstats = firebase.functions().httpsCallable('getStats');

    return getstats({
      beginningDate: beginningDate.toString(),
      endingDate: endingDate.toString()
    });

  }

  getManquants(beginningDate: Date, endingDate: Date) {

    const getmanquants = firebase.functions().httpsCallable('getManquants');

    return getmanquants({
      beginningDate: beginningDate.toString(),
      endingDate: endingDate.toString()
    });

  }

  addTrans(data: any, key: string) {
    if (data.code) {
      return this._firestore.collection('ittrans').doc(data.code + data[key]).set(data);
    } else {
      return this._firestore.collection('ittrans').doc(data.type + data[key]).set(data);
    }

  }

  getItTrans(date1: Date, date2: Date, type?: string) {
    return this._firestore.collection('ittrans', (ref) => {
      let rf = ref.where('Date', '>=', date1).where('Date', '<=', date2);
      if (type) {
        rf = rf.where('type', '==', type);
      }
      return rf;
    }).get();
  }

  mailProcess(mail: any) {
    const startMailProcess = firebase.functions().httpsCallable('startMailProcess');

    return startMailProcess({
      mail
    });
  }

  getMails(email: string) {
    return this._firestore.collection('mailbox', ref => {
      const request = ref.where('toEmail', '==', email);

      return request.orderBy('date', 'desc');
    }).snapshotChanges();
  }

  getSentMails(email: string) {
    return this._firestore.collection('mailbox', ref => {
      const request = ref.where('byEmail', '==', email);

      return request.orderBy('date', 'desc');
    }).get();
  }

  getDEs() {
    return this._firestore.collection('mailbox', ref => {
      const request = ref.where('judged', '==', false);
      // request = request.where('judged', '==', false);

      return request.orderBy('date', 'desc');
    }).snapshotChanges();
  }

  updateDE(de: any, forgiven: boolean) {


    return new Promise((resolve, reject) => {
      let allusers = [];

      this.GetAllUsers().then((e) => {
        e.subscribe(async (f) => {
          allusers = f.map((g) => g.payload.doc.data());

          console.log(allusers);
          console.log(de.to);

          const batch = this._firestore.firestore.batch();

          const mlref = this._firestore.collection('mailbox').doc(de.id).ref;
          batch.update(mlref, {
            judged: true,
            pardoned: forgiven,
            penalty: forgiven ? 0 : de.penalty
          });

          const disciplines = allusers.filter((user) => user.id === de.to)[0].discipline ?? [];

          let indx = -1;
          let k = 0;

          for (const disc of disciplines) {
            if (disc.taskid === de.id) {
              indx = k;
              break;
            }
            k = k + 1;
          }

          disciplines[indx].judged = true;
          disciplines[indx].pardoned = forgiven;
          disciplines[indx].penalty = forgiven ? 0 : disciplines[indx].penalty;

          console.log(disciplines[indx]);

          const usref = this._firestore.collection('users').doc(de.to).ref;
          batch.update(usref, {
            discipline: disciplines
          });

          await batch.commit();
          resolve(true);
        });

      });
    })
  }
}
