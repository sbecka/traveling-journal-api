const path = require('path');
const express = require('express');
const CommentsService = require('./comments-service');
const { requireAuth } = require('../middleware/jwt-auth');

const commentsRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

// app only post comments, but I would like to add delete a comment too

commentsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        CommentsService.getAllComments(req.app.get('db'))
            .then(comments => {
                res.json(comments.map(CommentsService.serializeComment))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { text, journal_id } = req.body;
        const newComment = { text, journal_id };

        for (const [key, value] of Object.entries(newComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        newComment.author_id = req.user.id;
        newComment.date_created = new Date();

        CommentsService.createComment(
            req.app.get('db'),
            newComment
        )
            .then(comment => {
                logger.info(`Comment with id ${comment.id} created`);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.id}`))
                    .json(CommentsService.serializeComment(comment))
            })
            .catch(next)
    })

commentsRouter
    .route('/:comment_id')
    .all(requireAuth)
    .all((req, res, next) => {
        CommentsService.getById(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(comment => {
                if (!comment) {
                    return res.status(404).json({
                        error: { message: `Comment doesn't exist`}
                    });
                }
                res.comment = comment;
                next();
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        CommentsService.deleteComment(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(numberofRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = commentsRouter;