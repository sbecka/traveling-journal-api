const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const fixtures = require('./journals.fixtures');

describe.only('Users Endpoints', function() {

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

    describe('POST /api/users', () => {

        context.only(`Create User`, () => {

            it(`responds 201, creates new user, returns new user, stores password`, function() {
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

                                return bcrypt.compare(newUser.password, row.password)
                            })
                            .then(compareMatch => {
                                expect(compareMatch).to.be.true
                            })
                    )
            });
        })
        

        context(`User Validation`, () => {

            beforeEach('insert users', () =>
                fixtures.seedUsers(
                    db,
                    testUsers,
                )
            );

            const requiredFields = [ 'full_name', 'email', 'password' ];

            requiredFields.forEach(field => {
                const addNewTestUser = {
                    full_name: 'test full_name',
                    email: 'test@mail.com',
                    password: 'test pass'
                };

                it(`responds with 400 required when '${field}' is missing`, () => { 
                    delete addNewTestUser[field];

                    return supertest(app)
                        .post('/api/users')
                        .send(addNewTestUser)
                        .expect(400, {
                            error: `Missing '${field}' in request body`
                        })
                });
            });

            it.only(`responds 400 error when email is not a proper email format containing an '@'`, () => {
                const badEmail = {
                    full_name: 'Test Name',
                    password: 'ccAAkkee!!',
                    email: 'testmail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(badEmail)
                    .expect(400, { error: `Please enter an email such as yourexamle@email.com` })
            });

            it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
                const shortPassword = {
                    full_name: 'Test Name',
                    password: 'cake123',
                    email: 'test@mail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(shortPassword)
                    .expect(400, { error: `Password must be longer than 8 characters` })
            });

            it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                const longPassword = {
                    full_name: 'Test Name',
                    password: 'a'.repeat(73),
                    email: 'test@mail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(longPassword)
                    .expect(400, { error: `Password must be less than 72 characters` })
            });

            it(`responds 400 'Password must not start or end with empty spaces' when password starts with space`, () => {
                const passStartsSpace = {
                    full_name: 'Test Name',
                    password: ' cake123!',
                    email: 'test@mail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(passStartsSpace)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            });

            it(`responds 400 'Password must not start or end with empty spaces' when password ends with space`, () => {
                const passEndsSpace = {
                    full_name: 'Test Name',
                    password: 'cake123! ',
                    email: 'test@mail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(passEndsSpace)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            });

            it(`responds 400 error when password is not complex`, () => {
                const passNotComplex = {
                    full_name: 'Test Name',
                    password: 'ccAAkkee',
                    email: 'test@mail.com'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(passNotComplex)
                    .expect(400, { error: `Password must contain 1 upper case, lower case, number, and special character` })
            });

            it(`responds 400 'Email already taken' when email isn't unique`, () => {
                const duplicateUser = {
                    email: testUser.email,
                    password: '11AAaa!!',
                    full_name: 'Test Name'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(duplicateUser)
                    .expect(400, { error: `Email already taken` })
            });
        });

        
    });

});