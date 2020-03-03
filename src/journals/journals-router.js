const express = require('express');
const path = require('path');
const JournalsService = require('./journals-service');

const journalsRouter = express.Router();
const jsonParser = express.json();

journalsRouter
    .route('/')
    .get((req, res, next) => {
        JournalsService.getAllJournals(req.app.get('db'))
            .then(journals => {
                res.json(journals.map(JournalsService.serializeJournal))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, location, content, start_date, end_date, author_id } = req.body;
        const newJournal = { title, location, content, start_date, end_date };

        for (const [key, value] of Object.entries(newJournal)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        newJournal.author_id = author_id; // user
        newJournal.date_created = new Date();

        JournalsService.createJournal(
            req.app.get('db'),
            newJournal
        )
            .then(journal => {
                //console.log(journal);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${journal.id}`))
                    .json(JournalsService.serializeJournal(journal))
            })
            .catch(next)

    })

journalsRouter
    .route('/:journal_id')
    .all(checkJournalExists)
    .get((req, res) => {
        res.json(JournalsService.serializeJournal(res.journal))
    })
    .delete((req, res, next) => {
        JournalsService.deleteJournal(
            req.app.get('db'),
            req.params.journal_id
        )
            .then(numberOfRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, location, content, start_date, end_date, date_modified } = req.body;
        const updatedJournal = { title, location, content, start_date, end_date, date_modified };

        const numberofFieldValues = Object.values(updatedJournal);
        if (numberofFieldValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must have either 'title', 'location', 'content', 'start_date', 'end_date', or 'date_modified'`
                }
            })
        }

        updatedJournal.date_modified = new Date();

        JournalsService.updateJournal(
            req.app.get('db'),
            req.params.journal_id,
            updatedJournal
        )
            .then(numberOfRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

journalsRouter
    .route('/:journal_id/comments')
    .all(checkJournalExists)
    .get((req, res, next) => {
        JournalsService.getCommentsForJournal(
            req.app.get('db'),
            req.params.journal_id
        )
            .then(comments => {
                res.json(comments.map(JournalsService.serializeJournalComment))
            })
            .catch(next)
    })

async function checkJournalExists(req, res, next) {
    try {
        const journal = await JournalsService.getById(
            req.app.get('db'),
            req.params.journal_id
        );

        if (!journal)
            return res.status(404).json({
                error: `Journal doesn't exist`
            });

            res.journal = journal;
            next();
            
        } catch (error) {
            next(error);
        }
}


module.exports = journalsRouter;