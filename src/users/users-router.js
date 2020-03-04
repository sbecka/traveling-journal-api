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
        const newUser = { full_name, email };

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        newUser.password = password;

        UsersService.createUser(
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
            .catch(next)
    })

    module.exports = usersRouter;