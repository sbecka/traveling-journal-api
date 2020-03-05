const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe('Journals Endpoints', function() {

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

            beforeEach(() => 
                fixtures.seedUsers(db, testUsers)
            );

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/journals')
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
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
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedJournals)
            });
        });

        context(`Given an XSS attack on journal`, () => {

            const testUser = testUsers[1];
            const {
                maliciousJournal,
                expectedJournal,
            } = fixtures.makeMaliciousJournal(testUser);

            beforeEach('insert malicious journal', () => {
                return fixtures.seedMaliciousJournal(
                    db,
                    testUser,
                    maliciousJournal,
                )
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                .get(`/api/journals`)
                .set(`Authorization`, fixtures.makeAuthHeader(testUser))
                .expect(200)
                .expect(res => {
                    expect(res.body[0].title).to.eql(expectedJournal.title)
                    expect(res.body[0].location).to.eql(expectedJournal.location)
                    expect(res.body[0].content).to.eql(expectedJournal.content)
                })
            });
        });
    });

    describe('POST /api/journals', () => {

        beforeEach(() => 
            fixtures.seedUsers(db, testUsers)
        );

        it('responds with 201 and creates a new journal, then returns new journal', function() {
            this.retries(5); // log will show journal with id 1 created
            const testUser = testUsers[0];
            const newJournal = {
                title:"Lovely Lakes", 
                location: "Canada", 
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                start_date: new Date("2019-05-09 20:00:00").toISOString(), 
                end_date: new Date("2019-05-15 20:00:00").toISOString(), 
                author_id: testUser.id
            };

            return supertest(app)
                .post('/api/journals')
                .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                .send(newJournal)
                .expect(201)
                .expect(res => {
                    // console.log(res);
                    //  body: {
                    //     id: 1,
                    //     title: 'Lovely Lakes',
                    //     location: 'Canada',
                    //     content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                    //     start_date: '2019-05-09T20:00:00.000Z',
                    //     end_date: '2019-05-15T20:00:00.000Z',
                    //     date_created: '2020-03-03T23:31:43.512Z',
                    //     date_modified: null,
                    //     number_of_comments: null
                    //   }
                    expect(res.body).to.have.property('id')
                    expect(res.body.title).to.eql(newJournal.title)
                    expect(res.body.location).to.eql(newJournal.location)
                    expect(res.body.content).to.eql(newJournal.content)
                    expect(res.body.start_date).to.eql(newJournal.start_date)
                    expect(res.body.end_date).to.eql(newJournal.end_date)
                    const expectedDateCreated = new Date().toISOString()
                    const actualDate = new Date(res.body.date_created).toISOString()
                    expect(actualDate).to.eql(expectedDateCreated); // only error with matching ISOString milliseconds, .sssZ part
                    expect(res.body.author_id).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/journals/${res.body.id}`)
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
        });

        const requiredFields = ['title', 'location', 'content', 'start_date', 'end_date'];
        // 5 tests for fields
        requiredFields.forEach(field => {
            const newJournal = {
                title:"Lovely Lakes", 
                location: "Canada", 
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                start_date: new Date("2019-05-09 20:00:00"), 
                end_date: new Date("2019-05-15 20:00:00"),
            };

            it(`responds with 400 and error message when the '${field}' is missing`, () => {
                delete newJournal[field]

                return supertest(app)
                    .post('/api/journals')
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .send(newJournal)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            });
        });

        context(`Given an XSS attack on posting journal`, () => {
            
            it('removes XSS attack content', () => {
                const testUser = testUsers[0];
                const {
                    maliciousJournal,
                    expectedJournal,
                } = fixtures.makeMaliciousJournal(testUser);

                return supertest(app)
                    .post(`/api/journals`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .send(maliciousJournal)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedJournal.title)
                        expect(res.body.location).to.eql(expectedJournal.location)
                        expect(res.body.content).to.eql(expectedJournal.content)
                    })
            });
        });

    });

    describe(`GET /api/journals/:journal_id`, () => {

        context(`Given no journals in database`, () => {

            beforeEach(() => 
                fixtures.seedUsers(db, testUsers)
            );

            it(`responds with 404 for journal that doesn't exist`, () => {
                const journalId = 321;
                return supertest(app)
                    .get(`/api/journals/${journalId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `Journal doesn't exist` } 
                    })
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
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedJournal)
            });
        });

        context(`Given an XSS attack on journal`, () => {
            const testUser = testUsers[1];
            const {
                maliciousJournal,
                expectedJournal,
            } = fixtures.makeMaliciousJournal(testUser);

            beforeEach('insert malicious journal', () => {
                return fixtures.seedMaliciousJournal(
                    db,
                    testUser,
                    maliciousJournal,
                )
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/journals/${maliciousJournal.id}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedJournal.title)
                        expect(res.body.location).to.eql(expectedJournal.location)
                        expect(res.body.content).to.eql(expectedJournal.content)
                    })
            });
        });
    });

    describe('DELETE /api/journals/:journal_id', () => {

        context(`Given no journals in database`, () => {

            beforeEach(() => 
                fixtures.seedUsers(db, testUsers)
            );

            it(`responds 404 when journal doesn't exist`, () => {
                const journalId = 123;
                return supertest(app)
                    .delete(`/api/journals/${journalId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Journal doesn't exist` }
                    })
            });
        });

        context(`Given journals are in database`, () => {

            beforeEach('insert journals', () => 
                fixtures.seedTravelingJournalsTables(
                    db,
                    testUsers,
                    testJournals
                )
            );

            it(`responds with 204 and deletes the journal`, () => {
                const deleteId = 1;
                const expectedJournals = testJournals.filter(journal => journal.id !== deleteId);

                return supertest(app)
                    .delete(`/api/journals/${deleteId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/journals')
                            .expect(expectedJournals)
                    })
            });
        });
    });

    describe('PATCH /api/journals/:journal_id', () => {

        context('Given no journals in database', () => {

            beforeEach(() => 
                fixtures.seedUsers(db, testUsers)
            );

            it('responds 404 if journal does not exist', () => {
                const journalId = 321
                return supertest(app)
                    .patch(`/api/journals/${journalId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, {  error: { message: `Journal doesn't exist` }  })
            });
        });

        context('Given journals in database', () => {
            
            beforeEach('insert journals', () => 
                fixtures.seedTravelingJournalsTables(
                    db,
                    testUsers,
                    testJournals
                )
            );

            it('responds with 204 and updates the journal', function() {
                this.retries(3); // logger logs journal with id updated

                const updateId = 1;
                const updatedJournal = {
                    title: "Lovely Time", 
                    location: "Madrid, Spain", 
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                    start_date: new Date("2019-05-09 20:00:00").toISOString(), 
                    end_date: new Date("2019-05-15 20:00:00").toISOString(),
                    date_modified: new Date().toISOString() //date_modified .ISOSting() millisecond issue causes error
                };

                const testJournal = {
                    id: 1,
                    title: "Spanish Delight",
                    location: "Madrid, Spain",
                    content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
                    start_date: new Date('Wed Jun 05 2019 20:00:00').toISOString(),
                    end_date: new Date('Thu Jun 06 2019 20:00:00').toISOString(),
                    date_created: new Date('2020-01-22T16:28:32.615Z').toISOString(),
                    author: testUsers[0].full_name, // need to specify author and number_of_comments
                    number_of_comments: 0,
                    date_modified: null
                };

                const expectedJournal = {
                    ...testJournal,
                    ...updatedJournal
                };

                // console.log(expectedJournal);
                return supertest(app)
                    .patch(`/api/journals/${updateId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .send(updatedJournal)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/journals/${updateId}`)
                            .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                            .expect(expectedJournal)
                    )
            });

            it('responds with 400 when no required fields are in request', () => {
                const updateId = 2;
                return supertest(app)
                    .patch(`/api/journals/${updateId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .send({ badField: 'foobar' })
                    .expect(400, {
                        error: {
                            message: `Request body must have either 'title', 'location', 'content', 'start_date', 'end_date', or 'date_modified'`
                        }
                    })
            });

            it(`responds with 204 when updating only a given field`, function() {
                this.retries(3); // logger logs journal with id updated
                
                const updateId = 1;
                const updateJournal = {
                    title: 'Updated journal title',
                    date_modified: new Date().toISOString() //date_modified .ISOSting() millisecond issue causes error
                };

                const testJournal = {
                    id: 1,
                    title: "Spanish Delight",
                    location: "Madrid, Spain",
                    content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
                    start_date: new Date('Wed Jun 05 2019 20:00:00').toISOString(),
                    end_date: new Date('Thu Jun 06 2019 20:00:00').toISOString(),
                    date_created: new Date('2020-01-22T16:28:32.615Z').toISOString(),
                    author: testUsers[0].full_name, // need to specify author and number_of_comments
                    number_of_comments: 0,
                    date_modified: null
                };

                const expectedJournal = {
                    ...testJournal,
                    ...updateJournal
                };

                return supertest(app)
                    .patch(`/api/journals/${updateId}`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateJournal,
                        fieldToIgnore : 'should not be in the GET response below'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/journals/${updateId}`)
                            .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                            .expect(expectedJournal)    
                    )
            });
        });

    });

    describe(`GET /api/journal/:journal_id/comments`, () => {

        context(`Given no journals in database`, () => {

            beforeEach(() => 
                fixtures.seedUsers(db, testUsers)
            );

            it(`responds with 404 for journal that doesn't exist`, () => {
                const journalId = 321;
                return supertest(app)
                    .get(`/api/journals/${journalId}/comments`)
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `Journal doesn't exist` } 
                    })
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
                    .set(`Authorization`, fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedComments)
            });
        });
    });
});