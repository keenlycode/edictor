import { Field, Model } from '../dist/module/edictor';


class User extends Model {};


const email_validator = (value) => {
    const emailRegEx = /\b[^\d][\w\.-]+@[\w\.-]+\w{2,4}\b/;
    return emailRegEx.test(value);
}

User.model({
    user: new Field({required: true})
        .regexp(/^[a-zA-Z][a-zA-Z0-9-_.]{3,32}$/),
    name: new Field({required: true})
        .regexp(/\b[^\d\W]{2,100}\b/),
    email: new Field({required: true}).arrayOf(email_validator)
}, {strict: false})

const user = new User({
    user: 'user-1',
    name: 'Name Lastname',
    email: ['user-1@example.com', 'user-1@backup.com']
});

console.log(JSON.stringify(user));

user.name = 1 // Error