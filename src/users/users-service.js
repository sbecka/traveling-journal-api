/* eslint-disable quotes */
const xss = require('xss');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&])[\S]+/;
const REGEX_EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/;
const bcrypt = require('bcryptjs');

const UsersService = {
  getUserName (db, id) {
    return db
      .from('traveling_users AS usr')
      .select(
        'usr.full_name'
      )
      .where('usr.id', id)
      .first();
  },
  getJournalsForUser (db, id) {
    return db
      .from('traveling_journals AS j')
      .select(
        'j.id',
        'j.title',
        'j.location',
        'j.content',
        'j.start_date',
        'j.end_date',
        'j.date_created',
        'j.date_modified',
        'usr.full_name AS author',
        db.raw(
          `count(DISTINCT com) AS number_of_comments`
        )
      )
      .leftJoin(
        'traveling_comments AS com',
        'j.id',
        'com.journal_id'
      )
      .leftJoin(
        'traveling_users AS usr',
        'j.author_id',
        'usr.id'
      )
      .groupBy('j.id', 'usr.id')
      .where('j.author_id', id);
  },
  hasUserWithEmail (db, email) {
    return db('traveling_users')
      .where({ email })
      .first()
      .then(user => !!user);
  },
  validateEmail (email) {
    if (!REGEX_EMAIL.test(email)) {
      return 'Please enter an email such as yourexamle@email.com';
    }
  },
  validatePassword (password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number, and special character';
    }
    return null;
  },
  hashPassword (password) {
    return bcrypt.hash(password, 12);
  },
  createUser (db, newUser) {
    return db
      .insert(newUser)
      .into('traveling_users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  serializeUser (user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      email: xss(user.email),
      date_created: new Date(user.date_created)
    };
  }
};

module.exports = UsersService;
