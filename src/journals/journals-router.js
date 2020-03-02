const express = require('express');
const JournalsService = require('./journals-service');

const journalsRouter = express.Router();

journalsRouter
    .route('/')
    .get((req, res, next) => {
        JournalsService.getAllJournals(req.app.get('db'))
            .then(journals => {
                res.json(journals)
            })
            .catch(next)
    })


module.exports = journalsRouter;