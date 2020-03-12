const path = require('path');
const express = require('express');
const UsersService = require('./users-service');
const JournalsService = require('../journals/journals-service');
const { requireAuth } = require('../middleware/jwt-auth');
const usersRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

usersRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    const userId = req.user.id;
    UsersService.getUserName(req.app.get('db'), userId)
      .then(user => {
        return res.json(user);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    // eslint-disable-next-line camelcase
    const { full_name, email, password } = req.body;

    for (const field of ['full_name', 'email', 'password']) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });
      }
    }

    const emailError = UsersService.validateEmail(email);

    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    const passwordError = UsersService.validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail) {
          return res.status(400).json({ error: 'Email already taken' });
        }

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              full_name,
              email,
              password: hashedPassword,
              date_created: 'now()'
            };

            return UsersService.createUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                logger.info(`User with id ${user.id} created`);
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

usersRouter
  .route('/journals')
  .get(requireAuth, (req, res, next) => {
    const userId = req.user.id;
    UsersService.getJournalsForUser(
      req.app.get('db'),
      userId
    )
      .then(journals => {
        res.json(journals.map(JournalsService.serializeJournal));
      })
      .catch(next);
  });

module.exports = usersRouter;
