const path = require('path');
const express = require('express');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

usersRouter
    .route('/')
    .post(jsonParser, (req, res, next) => {
        const { full_name, email, password } = req.body;

        for (const field of ['full_name', 'email', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const emailError = UsersService.validateEmail(email);

        if (emailError) {
            return res.status(400).json({ error: emailError })
        }

        const passwordError = UsersService.validatePassword(password);

        if (passwordError) {
            return res.status(400).json({ error: passwordError })
        }

        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if (hasUserWithEmail) {
                    return res.status(400).json({ error: `Email already taken` })
                }

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            full_name,
                            email,
                            password: hashedPassword,
                            date_created: 'now()',
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
                                    .json(UsersService.serializeUser(user))
                            })
                            
                    })
                    
            })
            .catch(next)

    })

module.exports = usersRouter;