const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe('Auth Endpoints', function() {
    let db;

    const { testUsers } = fixtures.makeJournalsFixtures();
    const testUser = testUsers[0];

    before('make knex instance', () => {
        db = knex({
            client:'pg',
            connection: process.env.TEST_DATABASE_URL,
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

    describe('POST /api/auth/login', () => {
        beforeEach('insert users', () => {
            fixtures.seedUsers(
                db,
                testUsers
            )
        });

        const requiredFields = ['email', 'password'];

        requiredFields.forEach(field => {
            const loginAttempt = {
                email: testUser.email,
                password: testUser.password,
            };

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete loginAttempt[field];

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttempt)
                    .expect(400, {
                        error: `Missing '${field}' in request body`
                    })
                })
        });

        it(`reponds with 400 and 'invalid email or password' when bad email`, () => {
            const invalidEmail = { email: 'not@email.com', password: testUser.password };
            return supertest(app)
                .post('/api/auth/login')
                .send(invalidEmail)
                .expect(400, { error: `Incorrect email or password` })
        });

        it(`reponds with 400 and 'invalid email or password' when bad password`, () => {
            const invalidPassword = { email: testUser.email, password: 'badpassword' };
            return supertest(app)
                .post('/api/auth/login')
                .send(invalidPassword)
                .expect(400, { error: `Incorrect email or password` })
        });

        it(`responds 200 and JWT token using secret when valid login`, (done) => {
            done(); // avoid error timeout when running test
            const validLogin = {
                email: testUser.email,
                password: testUser.password
            };

            const expectedToken = jwt.sign(
                { user_id: testUser.id },
                process.env.JWT_SECRET,
                {
                    subject: testUser.email,
                    expiresIn: process.env.JWT_EXPIRY,
                    algorithm: 'HS256'
                }
            );

            return supertest(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(200, {
                    authToken: expectedToken
                })
        });
    });

    describe.only(`POST /api/auth/refresh`, () => {
        beforeEach('insert users', () => {
            fixtures.seedUsers(
                db,
                testUsers
            )
        });

        it(`responds 200 and JWT auth token using secret`, () => {
            const expectedToken = jwt.sign(
                { user_id: testUser.id },
                process.env.JWT_SECRET,
                {
                    subject: testUser.email,
                    expiresIn: process.env.JWT_EXPIRY,
                    algorithm: 'HS256'
                }
            );
            return supertest(app)
                .post('/api/auth/refresh')
                .set('Authorization', fixtures.makeAuthHeader(testUser))
                .expect(200, {
                    authToken: expectedToken
                })
        });
    });
});