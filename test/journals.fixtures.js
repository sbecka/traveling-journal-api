function makeTestUsers() {
    return [
        {   
            id: 1,
            fullName: "John Doe",
            email: "example@mail.com",
            password: "password",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            fullName: "Jane Lane",
            email: "jl3le@mail.com",
            password: "password1",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            fullName: "Bob Roe",
            email: "bos0i8e@mail.com",
            password: "password2",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
        },
        {
            id: 4,
            fullName: "Luke Sky",
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
            start_date: "Wed Jun 05 2019 20:00:00",
            end_date: "Thu Jun 06 2019 20:00:00",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[0].id
        },
        {
            id: 2,
            title: "Fun Day in Florida",
            location: "Miami, Florida",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: "Fri Jan 11 2019 19:00:00",
            end_date: "Fri Jan 12 2019 19:00:00",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[0].id
        },
        {
            id: 3,
            title: "Beauty of Italy",
            location: "Rome, Italy",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: "Mon Feb 10 2020 12:00:00",
            end_date: "Fri Feb 14 2020 12:00:00",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[3].id
        },
        {
            id: 4,
            title: "Disney World",
            location: "Orlando, Florida",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: "Tue Jul 02 2019 20:00:00",
            end_date: "Tue Jul 09 2019 20:00:00",
            date_created: new Date('2020-01-22T16:28:32.615Z'),
            author_id: users[2].id
        },
        {
            id: 5,
            title: "First day in Australia",
            location: "Brisbane, Australia",
            content: "Lorem ipsum dolor sit amet, deserunt mollit anim id est laborum.",
            start_date: "Sun Apr 14 2019 20:00:00",
            end_date: "Mon Apr 15 2019 20:00:00",
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
    const number_of_comments = comments.filter(comment => comment.journal_id === journal_id).length;

    return {
        id: journal.id,
        title: journal.title,
        location: journal.location,
        content: journal.content,
        date_created: journal.date_created.toISOString(),
        start_date: journal.start_date.toISOString(),
        end_date: journal.end_date.toISOString(),
        number_of_comments,
        author
    };
};

module.exports = {
    makeTestUsers,
    makeTestJournals,
    makeTestComments,
    makeJournalsFixtures,
    seedTravelingJournalsTables,
    makeExpectedJournal
};