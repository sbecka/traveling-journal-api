/* eslint-disable camelcase */
/* eslint-disable quotes */
const xss = require('xss');

const JournalsService = {
  getAllJournals (db) {
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
        )
      )
      .leftJoin(
        'traveling_comments AS com',
        'j.id',
        'com.journal_id'
      )
      .leftJoin(
        'traveling_users AS usr',
        'j.author_id',
        'usr.id'
      )
      .groupBy('j.id', 'usr.id');
  },
  createJournal (db, newJournal) {
    return db
      .insert(newJournal)
      .into('traveling_journals')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById (db, id) {
    return JournalsService.getAllJournals(db)
      .where('j.id', id)
      .first();
  },
  getCommentsForJournal (db, journal_id) {
    return db
      .from('traveling_comments AS com')
      .select(
        'com.id',
        'com.text',
        'com.journal_id',
        'com.date_created',
        'usr.full_name AS author'
      )
      .where('com.journal_id', journal_id)
      .leftJoin(
        'traveling_users AS usr',
        'com.author_id',
        'usr.id'
      )
      .groupBy('com.id', 'usr.id');
  },
  deleteJournal (db, id) {
    return db
      .from('traveling_journals')
      .where({ id })
      .delete();
  },
  updateJournal (db, id, newJournalFields) {
    return db
      .from('traveling_journals')
      .where({ id })
      .update(newJournalFields);
  },
  serializeJournal (journal) {
    return {
      id: journal.id,
      title: xss(journal.title),
      location: xss(journal.location),
      content: xss(journal.content),
      start_date: new Date(journal.start_date),
      end_date: new Date(journal.end_date),
      date_created: new Date(journal.date_created),
      date_modified: journal.date_modified || null,
      number_of_comments: Number(journal.number_of_comments),
      author: journal.author
    };
  },
  serializeJournalComment (comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      journal_id: comment.journal_id,
      date_created: new Date(comment.date_created),
      author: comment.author
    };
  }

};

module.exports = JournalsService;
