const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe.only('Journals Endpoints', function() {
    let db;

    const { testUsers, testJournals, testComments } = fixtures.makeJournalsFixtures();

    before('make knex instance', () => {
        db = knex({
            client:'pg',
            connection: process.env.TEST_DB_URL,
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
        )
    });

    afterEach('cleanup', () => {
        return db.raw(
                `TRUNCATE
                    traveling_comments,
                    traveling_journals,
                    traveling_users
                    RESTART IDENTITY CASCADE`
        )
    });
    
    describe(`GET /api/journals`, () => {
        context(`Given no journals in database`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/journals')
                    .expect(200, [])
            });
        });

        context(`Given journals are in database`, () => {
            beforeEach('insert journals', () =>
                fixtures.seedTravelingJournalsTables(
                    db,
                    testJournals,
                    testJournals,
                    testComments
                )
            );

            it(`responds with 200 and all journals`, () => {
                const expectedJournals = testJournals.map(journal => 
                    fixtures.makeExpectedJournal(
                        testUsers,
                        journal,
                        testComments
                    )
                );
                return supertest(app)
                    .get('/api/journals')
                    .expect(200, expectedJournals)
            });
        });
    });
});