function makeTestUsers() {
    return [
        {   
            id: 1,
            full_name: "John Doe",
            email: "example@mail.com",
            password: "password",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            full_name: "Jane Lane",
            email: "jl3le@mail.com",
            password: "password1",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            full_name: "Bob Roe",
            email: "bos0i8e@mail.com",
            password: "password2",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 4,
            full_name: "Luke Sky",
            email: "skywalker2@mail.com",
            password: "password4orce",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
    ];
};

function makeTestJournals(users) {
    return [
        {
            id: 1,
            title: "Spanish Delight",
            location: "Madrid, Spain",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: new Date('Wed Jun 05 2019 20:00:00'),
            end_date: new Date('Thu Jun 06 2019 20:00:00'),
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[0].id
        },
        {
            id: 2,
            title: "Fun Day in Florida",
            location: "Miami, Florida",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: new Date('Fri Jan 11 2019 19:00:00'),
            end_date: new Date('Fri Jan 12 2019 19:00:00'),
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[0].id
        },
        {
            id: 3,
            title: "Beauty of Italy",
            location: "Rome, Italy",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: new Date('Mon Feb 10 2020 12:00:00'),
            end_date: new Date('Fri Feb 14 2020 12:00:00'),
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[3].id
        },
        {
            id: 4,
            title: "Disney World",
            location: "Orlando, Florida",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: new Date('Tue Jul 02 2019 20:00:00'),
            end_date: new Date('Tue Jul 09 2019 20:00:00'),
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[2].id
        },
        {
            id: 5,
            title: "First day in Australia",
            location: "Brisbane, Australia",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: new Date('Sun Apr 14 2019 20:00:00'),
            end_date: new Date('Mon Apr 15 2019 20:00:00'),
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[1].id
        },
    ];
};

function makeTestComments(users, journals) {
    return [
        {
            id: 1,
            text: 'First comment!',
            journal_id: journals[0].id,
            author_id: users[0].id,
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            text: 'Lorem ipsum dolor!',
            journal_id: journals[0].id,
            author_id: users[1].id,
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            text: 'Lorem!',
            journal_id: journals[0].id,
            author_id: users[2].id,
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 4,
            text: 'Lorem ipsum dolor sit amet, afsdfasdf',
            journal_id: journals[0].id,
            author_id: users[3].id,
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 5,
            text: 'Amazing place!',
            journal_id: journals[4].id,
            author_id: users[0].id,
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        }
      ];
};

function makeJournalsFixtures() {
    const testUsers = makeTestUsers();
    const testJournals = makeTestJournals(testUsers);
    const testComments = makeTestComments(testUsers, testJournals);
    return { testUsers, testJournals, testComments}
};

function seedTravelingJournalsTables(db, users, journals, comments=[]) {
    return db
        .into('traveling_users')
        .insert(users)
        .then(() =>
            db
                .into('traveling_journals')
                .insert(journals)
        )
        .then(() => 
            comments.length && db.into('traveling_comments').insert(comments)
        )
};

function makeExpectedJournal(users, journal, comments=[]) {
    const author = users.find(user => user.id === journal.author_id);
    const number_of_comments = comments.filter(comment => comment.journal_id === journal.id).length;

    return {
        id: journal.id,
        title: journal.title,
        location: journal.location,
        content: journal.content,
        date_created: journal.date_created.toISOString(),
        date_modified: journal.date_modified || null,
        start_date: journal.start_date.toISOString(),
        end_date: journal.end_date.toISOString(),
        number_of_comments: Number(number_of_comments),
        author: author.full_name
    };
};

function makeExpectedJournalComments(users, journalId, comments) {
    const expectedComments = comments.filter(comment => comment.journal_id === journalId)

    return expectedComments.map(comment => {
        const commentUser = users.find(user => user.id === comment.author_id)
        return {
            id: commentUser.id,
            text: commentUser.text,
            date_created: commentUser.date_created.toISOString(),
            journal_id: commentUser.journal_id,
            author: author.full_name
        }
    });
};

function seedUsers(db, users) {
    return db.into('traveling_users').insert(users)
        .then(() => 
            db.raw(
                `SELECT setval('traveling_users_id_seq', ?)`,
                [users[users.length - 1].id]
            )
        )
};

module.exports = {
    makeTestUsers,
    makeTestJournals,
    makeTestComments,
    makeJournalsFixtures,
    seedTravelingJournalsTables,
    makeExpectedJournal,
    makeExpectedJournalComments,
    seedUsers
};