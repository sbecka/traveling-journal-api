const path = require('path');
const express = require('express');
const CommentsService = require('./comments-service');
const { requireAuth } = require('../middleware/jwt-auth');

const commentsRouter = express.Router();
const jsonParser = express.json();

commentsRouter
  .route('/')
  .all(requireAuth)
  .post(jsonParser, (req, res, next) => {
    // eslint-disable-next-line camelcase
    const { text, journal_id } = req.body;
    const newComment = { text, journal_id };

    for (const [key, value] of Object.entries(newComment)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    newComment.author_id = req.user.id;
    newComment.date_created = new Date();

    CommentsService.createComment(
      req.app.get('db'),
      newComment
    )
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(CommentsService.serializeComment(comment));
      })
      .catch(next);
  });

module.exports = commentsRouter;
