const express = require('express');
const AuthService = require('./auth-service');
const authRouter = express.Router();
const jsonParser = express.json();

authRouter
    .post('/login', jsonParser, (req, res, next) => {
        const { email, password } = req.body;
        const loginUser = { email, password };

        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: message `Missing '${key}' in request body`
                })
            }
        }
        res.send('ok')
    })

module.exports = authRouter;