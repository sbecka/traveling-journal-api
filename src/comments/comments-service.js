const xss = require('xss');

const CommentsService = {
    getAllComments(db) {
        return db
           .from('traveling_comments AS com')
           .select(
                'com.id',
                'com.text',
                'com.date_created',
                'com.journal_id',
                'usr.full_name AS author',
            )
            .leftJoin(
                'traveling_users AS usr',
                'com.author_id',
                'usr.id'
            )
            .groupBy('com.id', 'usr.id')
            .orderBy('com.id')
    },
    createComment(db, newComment) {
        return db
            .insert(newComment)
            .into('traveling_comments')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
            .then(comment => 
                CommentsService.getById(db, comment.id)
            )
    },
    getById(db, id) {
        return CommentsService.getAllComments(db)
            .where('com.id', id)
            .first()
    },
    deleteComment(db, id) {
        return db('traveling_comments')
            .where({ id })
            .delete()
    },
    serializeComment(comment) {
        return {
            id: comment.id,
            text: xss(comment.text),
            journal_id: comment.journal_id,
            date_created: new Date(comment.date_created),
            author: comment.author
        }
    },
};

module.exports = CommentsService;