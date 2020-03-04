const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe.only('Auth Endpoints', function() {
    let db;

    const { testUsers } = fixtures.makeJournalsFixtures();
    const testUser = testUsers[0];

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

    describe('POST /api/auth/login', () => {
        beforeEach('insert users', () => {
            fixtures.seedUsers(
                db,
                testUsers
            )
        });

        const requiredFields = ['email', 'password'];

        requiredFields.forEach(field => {
            const loginTest = {
                email: testUser.email,
                password: testUser.password,
            };

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete loginTest[field];

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginTest)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
                })
        });

        it(`reponds with 400 and 'invalid email or password' when bad email`, () => {
            const invalidEmail = { email: 'not@email.com', password: 'pasS3!word' };
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
    });
});