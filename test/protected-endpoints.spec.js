const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe.only('Protected endpoints', function() {
    let db;

    const {
        testUsers,
        testJournals,
        testComments,
    } = fixtures.makeJournalsFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
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

    beforeEach(`insert journals`, () => 
      fixtures.seedTravelingJournalsTables(
            db,
            testUsers,
            testJournals,
            testComments,
        )
    );

    const protectedEndpoints = [
        {
            name: 'GET /api/journals',
            path: '/api/journals',
            method: supertest(app).get,
        },
        {
            name: 'GET /api/journals/:journal_id',
            path: '/api/journals/1',
            method: supertest(app).get,
        },
        {
            name: 'POST /api/journals',
            path: '/api/journals/1',
            method: supertest(app).post,
        },
        {
            name: 'DELETE /api/journals/:journal_id',
            path: '/api/journals/1',
            method: supertest(app).delete,
        },
        {
            name: 'PATCH /api/journals/:journal_id',
            path: '/api/journals/1',
            method: supertest(app).patch,
        },
        {
            name: 'GET /api/journals/:journal_id/comments',
            path: '/api/journals/1/comments',
            method: supertest(app).get,
        },
        {
            name: 'POST /api/comments',
            path: '/api/comments',
            method: supertest(app).post,
        },
        // {
        //     name: 'POST /api/auth/refresh',
        //     path: '/api/auth/refresh',
        //     method: supertest(app).post
        // }
    ];

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
            });

            it(`responds with 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0];
                const invalidSecret = 'very-bad-secret';
                return endpoint.method(endpoint.path)
                    .set('Authorization', fixtures.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
            });

            it(`responds with 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = { email: 'bad@email', id: 1 };
                return endpoint.method(endpoint.path)
                    .set('Authorization', fixtures.makeAuthHeader(invalidUser))
                    .expect(401, { error: `Unauthorized request` })
            });
        });
    });
});