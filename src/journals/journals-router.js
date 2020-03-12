/* eslint-disable camelcase */
const express = require('express');
const path = require('path');
const JournalsService = require('./journals-service');
const { requireAuth } = require('../middleware/jwt-auth');

const journalsRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

journalsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    JournalsService.getAllJournals(req.app.get('db'))
      .then(journals => {
        res.json(journals.map(JournalsService.serializeJournal));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, location, content, start_date, end_date } = req.body;
    const newJournal = { title, location, content, start_date, end_date };

    for (const [key, value] of Object.entries(newJournal)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    newJournal.author_id = req.user.id; // user
    newJournal.date_created = new Date();

    JournalsService.createJournal(
      req.app.get('db'),
      newJournal
    )
      .then(journal => {
        logger.info(`Journal with id ${journal.id} created`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${journal.id}`))
          .json(JournalsService.serializeJournal(journal));
      })
      .catch(next);
  });

journalsRouter
  .route('/:journal_id')
  .all(requireAuth)
  .all(checkJournalExists)
  .get((req, res) => {
    res.json(JournalsService.serializeJournal(res.journal));
  })
  .delete((req, res, next) => {
    JournalsService.deleteJournal(
      req.app.get('db'),
      req.params.journal_id
    )
      .then(numberOfRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, location, content, start_date, end_date } = req.body;
    const updateJournal = { title, location, content, start_date, end_date };

    const numberofFieldValues = Object.values(updateJournal).filter(Boolean).length;
    if (numberofFieldValues === 0) {
      return res.status(400).json({
        error: {
          // eslint-disable-next-line quotes
          message: `Request body must have either 'title', 'location', 'content', 'start_date', or 'end_date'`
        }
      });
    }

    updateJournal.date_modified = new Date();

    JournalsService.updateJournal(
      req.app.get('db'),
      req.params.journal_id,
      updateJournal
    )
      .then(numberOfRowsAffected => {
        logger.info(`Journal with id ${req.params.journal_id} updated`);
        res.status(204).end();
      })
      .catch(next);
  });

journalsRouter
  .route('/:journal_id/comments')
  .all(requireAuth)
  .all(checkJournalExists)
  .get((req, res, next) => {
    JournalsService.getCommentsForJournal(
      req.app.get('db'),
      req.params.journal_id
    )
      .then(comments => {
        res.json(comments.map(JournalsService.serializeJournalComment));
      })
      .catch(next);
  });

async function checkJournalExists (req, res, next) {
  try {
    const journal = await JournalsService.getById(
      req.app.get('db'),
      req.params.journal_id
    );

    if (!journal) {
      return res.status(404).json({
        // eslint-disable-next-line quotes
        error: { message: `Journal doesn't exist` }
      });
    }

    res.journal = journal;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = journalsRouter;
