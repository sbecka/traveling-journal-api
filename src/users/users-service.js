const xss = require('xss');

const UsersService = {
    createUser(db, newUser) {
        return db
            .insert(newUser)
            .into('traveling_users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    serializeUser(user) {
        return {
            id: user.id,
            full_name: xss(user.full_name),
            email: xss(user.email),
            date_created: new Date(user.date_created)
        }
    }
};

module.exports = UsersService;