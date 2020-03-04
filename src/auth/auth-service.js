const bcrypt = require('bcryptjs');

const AuthService = {
    getUserWithEmail(db, email) {
        return db('traveling_users')
            .where({ email })
            .first()
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },

}

module.exports = AuthService;