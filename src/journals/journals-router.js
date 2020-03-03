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

journalsRouter
    .route('/:journal_id')
    .get((req, res, next) => {
        JournalsService.getById(req.app.get('db'), req.params.journal_id)
            .then(journal => {
                res.json(journal)
            })
            .catch(next)
    })


module.exports = journalsRouter;