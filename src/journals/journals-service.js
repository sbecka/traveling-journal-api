
const JournalsService = {
    getAllJournals(db) {
        return db
            .from('traveling_journals AS journal')
            .select(
                'journal.id',
                'journal.title',
                'journal.location',
                'journal.content',
                'journal.start_date',
                'journal.end_date',
                'journal.date_created',
                'journal.date_modified',
                db.raw(
                    `count(DISTINCT comment) AS number_of_comments`
                ),
                db.raw(
                    `json_strip_nulls(
                        json_build_object(
                            'id', user.id, 
                            'full_name', user.full_name
                        )
                    ) AS author`
                ), 
            )
            .leftJoin(
                'traveling_comments AS comment',
                'journal.id',
                'comment.journal_id',
            )
            .leftJoin(
                'traveling_users AS user',
                'journal.author_id',
                'user.id',
            )
            .groupBy('journal.id', 'user.id')
    },
    // createJournal() {
        // create journal
    // },
    // getById() {
        // get one journal
    // },
    // getCommentsForJournal() {
        // get comments for one journal
    // },
    // deleteJournal() {
        // delete journal
    // },
    // updateJournal() {
        // edit and update one journal
    // }

};

module.exports = JournalsService;