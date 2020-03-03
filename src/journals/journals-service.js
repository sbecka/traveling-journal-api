const xss = require('xss');

const JournalsService = {
    getAllJournals(db) {
        return db
            .from('traveling_journals AS j')
            .select(
                'j.id',
                'j.title',
                'j.location',
                'j.content',
                'j.start_date',
                'j.end_date',
                'j.date_created',
                'j.date_modified',
                'usr.full_name AS author',
                db.raw(
                    `count(DISTINCT com) AS number_of_comments`
                ),
            )
            .leftJoin(
                'traveling_comments AS com',
                'j.id',
                'com.journal_id',
            )
            .leftJoin(
                'traveling_users AS usr',
                'j.author_id',
                'usr.id',
            )
            .groupBy('j.id', 'usr.id')
    },
    // createJournal() {
        // create journal
    // },
    getById(db, id) {
        return JournalsService.getAllJournals(db)
            .where('j.id', id)
            .first()
    },
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