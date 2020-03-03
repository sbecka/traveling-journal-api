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
                    testUsers,
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

    describe.only('POST /api/journals', () => {
        it('responds with 201 and creates a new journal, returns new journal', () => {
            this.retries(3);
            const testUser = testUsers[0];
            const newJournal = {
                title:"Lovely Lakes", 
                location: "Canada", 
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                start_date: "2019-05-09 20:00:00", 
                end_date: "2019-05-15 20:00:00", 
                author_id: testUser.id
            };

            return supertest(app)
                .post(`/api/journals`)
                .send(newJournal)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.title).to.eql(newJournal.title)
                    expect(res.body.location).to.eql(newJournal.location)
                    expect(res.body.content).to.eql(newJournal.content)
                    expect(res.body.start_date).to.eql(newJournal.start_date)
                    expect(res.body.end_date).to.eql(newJournal.end_date)
                    const expectedDateCreated = new Date().toISOString()
                    const actualDate = new Date(res.body.date_created).toISOString()
                    expect(actualDate).to.eql(expectedDateCreated);
                    expect(res.body.author_id).to.eql(testUser.id)
                })
                .expect(res =>
                    db
                        .from('traveling_journals')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(newJournal.title)
                            expect(row.location).to.eql(newJournal.location)
                            expect(row.content).to.eql(newJournal.content)
                            expect(row.start_date).to.eql(newJournal.start_date)
                            expect(row.end_date).to.eql(newJournal.end_date)
                            const expectedDateCreated = new Date().toISOString()
                            const actualDate = new Date(row.date_created).toISOString()
                            expect(actualDate).to.eql(expectedDateCreated);
                            expect(row.author_id).to.eql(testUser.id)
                        })
                )
        })
    });

    describe(`GET /api/journals/:journal_id`, () => {
        context(`Given no journals in database`, () => {
            beforeEach(() => 
                db.into('traveling_users').insert(testUsers)
            );

            it(`responds with 404 for journal that doesn't exist`, () => {
                const journalId = 321;
                return supertest(app)
                    .get(`/api/journals/${journalId}`)
                    .expect(404, { error: `Journal doesn't exist` })
            });
        });

        context(`Given journals are in database`, () => {
            beforeEach('insert journals', () => 
                fixtures.seedTravelingJournalsTables(
                    db,
                    testUsers,
                    testJournals,
                    testComments
                )
            );

            it(`responds with 200 and given matching journal id`, () => {
                const journalId = 2;
                const expectedJournal = fixtures.makeExpectedJournal(
                    testUsers,
                    testJournals[journalId - 1],
                    testComments
                );

                return supertest(app)
                    .get(`/api/journals/${journalId}`)
                    .expect(200, expectedJournal)
            });
        });
    });

    describe(`Get /api/journal/:journal_id/comments`, () => {
        context(`Given no journals in database`, () => {
            beforeEach(() => 
                db.into('traveling_users').insert(testUsers)
            );

            it(`responds with 404 for journal that doesn't exist`, () => {
                const journalId = 321;
                return supertest(app)
                    .get(`/api/journals/${journalId}/comments`)
                    .expect(404, { error: `Journal doesn't exist` })
            });
        });

        context(`Given journal with comments are in database`, () => {
            beforeEach('insert journals', () => 
                fixtures.seedTravelingJournalsTables(
                    db,
                    testUsers,
                    testJournals,
                    testComments
                )
            );

            it(`responds with 200 and given matching journal id and comments`, () => {
                const journalId = 2;
                const expectedComments = fixtures.makeExpectedJournalComments(
                    testUsers,
                    journalId,
                    testComments
                );

                return supertest(app)
                    .get(`/api/journals/${journalId}/comments`)
                    .expect(200, expectedComments)
            });
        });
    });
});