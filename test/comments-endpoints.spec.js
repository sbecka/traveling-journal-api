/* eslint-disable no-undef */
const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe('Comments Endpoints', function () {
  let db;
  const { testUsers, testJournals, testComments } = fixtures.makeJournalsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => {
    return db.raw(
      `TRUNCATE
                    traveling_comments,
                    traveling_journals,
                    traveling_users
                    RESTART IDENTITY CASCADE`
    );
  });

  afterEach('cleanup', () => {
    return db.raw(
      `TRUNCATE
                    traveling_comments,
                    traveling_journals,
                    traveling_users
                    RESTART IDENTITY CASCADE`
    );
  });

  describe('POST /api/comments', () => {
    beforeEach('insert journals', () =>
      fixtures.seedTravelingJournalsTables(
        db,
        testUsers,
        testJournals
      )
    );

    it('responds with 201, create comment, and returns the new comment', function () {
      this.retries(3); // help log comment with id is created
      const testJournal = testJournals[0];
      const testUser = testUsers[0];
      const newComment = {
        text: 'Testing comment here',
        journal_id: testJournal.id
      };
      // console.log(newComment);
      return supertest(app)
        .post('/api/comments')
        .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
        .send(newComment)
        .expect(201)
        .expect(res => {
          // console.log(res.body)
          expect(res.body).to.have.property('id');
          expect(res.body.text).to.eql(newComment.text);
          expect(res.body.journal_id).to.eql(newComment.journal_id);
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`);
          const expectedDateCreated = new Date().toISOString();
          const actualDate = new Date(res.body.date_created).toISOString();
          expect(actualDate).to.eql(expectedDateCreated); // only error with matching ISOString milliseconds
        })
        .expect(res =>
          db
            .from('traveling_comments')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(newComment.text);
              expect(row.journal_id).to.eql(newComment.journal_id);
              expect(row.author).to.eql(testUser.full_name);
              const expectedDateCreated = new Date().toISOString();
              const actualDate = new Date(res.body.date_created).toISOString();
              expect(actualDate).to.eql(expectedDateCreated); // only error with matching ISOString milliseconds
            })
        );
    });

    const requiredFields = ['text', 'journal_id'];

    requiredFields.forEach(field => {
      const testJournal = testJournals[0];
      const newComment = {
        text: 'Test comment here',
        journal_id: testJournal.id
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field];

        return supertest(app)
          .post('/api/comments')
          .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });
  });

  describe('DELETE /api/comments/:comment_id', () => {
    context('Given no comments in database', () => {
      beforeEach(() =>
        fixtures.seedUsers(db, testUsers)
      );

      // eslint-disable-next-line quotes
      it(`responds 404 when comment doesn't exist`, () => {
        const commentId = 123;
        return supertest(app)
          .delete(`/api/comments/${commentId}`)
          .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
          .expect(404, {
            // eslint-disable-next-line quotes
            error: { message: `Comment doesn't exist` }
          });
      });
    });

    context('Given comments are in database', () => {
      beforeEach('insert journals and comments', () =>
        fixtures.seedTravelingJournalsTables(
          db,
          testUsers,
          testJournals,
          testComments
        )
      );

      it('responds with 204 and deletes the comment', () => {
        const deleteId = 1;
        const expectedComments = testComments.filter(comment => comment.id !== deleteId);

        return supertest(app)
          .delete(`/api/comments/${deleteId}`)
          .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res => {
            supertest(app)
              .get('/api/comments')
              .expect(expectedComments);
          });
      });
    });
  });
});
