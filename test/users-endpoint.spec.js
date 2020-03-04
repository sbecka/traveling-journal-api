const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe('Comments Endpoints', function() {
    let db;

    const { testUsers } = fixtures.makeJournalsFixtures();

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

    describe('POST /api/users', () => {

        it(`responds 201, creates new user, and returns new user`, function() {
            this.retries(3); // logs User with id created

            const newUser = {
                full_name: 'Test Name',
                email: 'test@email.com',
                password: 'Test123!',
            };

            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    // console.log(res.body)
                    expect(res.body).to.have.property('id')
                    expect(res.body.full_name).to.eql(newUser.full_name)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body).to.not.have.property('password')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                    const expectedDate = new Date().toISOString();
                    const actualDate = new Date(res.body.date_created).toISOString();
                    expect(actualDate).to.eql(expectedDate) // only error with matching ISOString milliseconds
                })
                .expect(res => 
                    db
                        .from('traveling_users')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.full_name).to.eql(newUser.full_name)
                            expect(row.email).to.eql(newUser.email)
                            const expectedDate = new Date().toISOString();
                            const actualDate = new Date(row.date_created).toISOString();
                            expect(actualDate).to.eql(expectedDate)

                        })
                )
        });

        const requiredFields = [ 'full_name', 'email' ];

        requiredFields.forEach(field => {
            const addNewTestUser = {
                full_name: 'test full_name',
                email: 'test@mail.com'
            };

            it(`responds with 400 required when '${field}' is missing`, () => { 
                delete addNewTestUser[field];

                return supertest(app)
                    .post('/api/users')
                    .send(addNewTestUser)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            });
        });
    });

});