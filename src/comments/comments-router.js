const path = require('path');
const express = require('express');
const CommentsService = require('./comments-service');

const commentsRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

commentsRouter
    .route('/')
    .get((req, res, next) => {
        CommentsService.getAllComments(req.app.get('db'))
            .then(comments => {
                res.json(comments.map(CommentsService.serializeComment))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { text, journal_id, author_id } = req.body;
        const newComment = { text, journal_id };

        for (const [key, value] of Object.entries(newComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        newComment.author_id = author_id;
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
    .get((req, res, next) => {
        res.json(CommentsService.serializeComment(res.comment))
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