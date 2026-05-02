import { UpdateIssueSchema } from "../tools/issues.js";

// input invalido

const invalidInput = {
    owner: 'mi-usuario',
    repo: 'mi-repo',
    issue_number: 42
};
// resultado de input invalido
const invalidResult = UpdateIssueSchema.safeParse(invalidInput);
console.log('Resultado de input invalido_______');
console.log(invalidResult.success);
if (!invalidResult.success) {
    console.log(invalidResult.error.errors[0]?.message);

}





// input valido 

const validInput = {
    owner: 'mi-usuario',
    repo: 'mi-repo',
    issue_number: 42,
    state: 'closed'
};

// resultado input valido

const validResult = UpdateIssueSchema.safeParse(validInput);
console.log("Resultado de input valido_______");
console.log(validResult.success);
if (validResult.success) {
    console.log(validResult.data);

}


