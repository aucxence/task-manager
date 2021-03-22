let allQuestions = [
    {
        questionId: 1,
        questionText: 'Quel montant devez vous encaisser?',
        questionType: 'amount',
        limit: 2500000,
        explanation: 'Vous ne pouvez pas encaisser un montant de plus de 2 500 000',
        selectedOption: 0
    },
    {
        questionId: 2,
        questionText: 'Quelle service sollicitez-vous?',
        questionType: 'liste',
        answer: "1",
        options: [
            { optionValue: '1', optionText: 'Programming' },
            { optionValue: '2', optionText: 'Testability' },
            { optionValue: '3', optionText: 'Software design' },
            { optionValue: '4', optionText: 'All of the above.' },
        ],
        explanation: 'Vous ne pouvez pas encaisser un montant de plus de 2 500 000',
        selectedOption: ''
    },
    {
        questionId: 3,
        questionText: 'Le service peut-il être rendu en présence du client?',
        questionType: 'liste',
        answer: "1",
        options: [
            { optionValue: '1', optionText: 'Oui' },
            { optionValue: '2', optionText: 'Non' },
        ],
        explanation: 'Vous ne pouvez pas encaisser un montant de plus de 2 500 000',
    },
    {
        questionId: 3,
        questionText: 'Which of the following is the first step in setting up dependency injection?',
        options: [
            { optionValue: '1', optionText: 'Require in the component.' },
            { optionValue: '2', optionText: 'Provide in the module.' },
            { optionValue: '3', optionText: 'Mark dependency as @Injectable().' },
            { optionValue: '4', optionText: 'Declare an object.' }
        ],
        answer: '3',
        explanation: 'the first step is marking the class as @Injectable()',

    },
    {
        questionId: 4,
        questionText: 'In which of the following does dependency injection occur?',
        options: [
            { optionValue: '1', optionText: '@Injectable()' },
            { optionValue: '2', optionText: 'constructor' },
            { optionValue: '3', optionText: 'function' },
            { optionValue: '4', optionText: 'NgModule' },
        ],
        answer: '2',
        explanation: 'object instantiations are taken care of by the constructor in Angular',
        selectedOption: ''
    }
];;

export default allQuestions;