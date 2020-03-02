BEGIN;

TRUNCATE
    traveling_comments,
    traveling_journals,
    traveling_users
    RESTART IDENTITY CASCADE;

INSERT INTO traveling_users (full_name, email, password)
VALUES
    ('John Doe', 'example@mail.com','pasS3!word'),
    ('Jane Lane', 'jl3le@mail.com','pass^9woRd1'),
    ('Bob Roe', 'bos9i8e@mail.com','pass)4wOrd2'),
    ('Luke Sky', 'skywalker2@mail.com','pa9!ssWord4orce');

INSERT INTO traveling_journals (title, location, content, start_date, end_date, author_id)
VALUES
    ('Spanish Delight', 
        'Madrid, Spain', 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '2019-05-06 20:00:00', 
        '2019-05-06 20:00:00', 
        1),
    ('Fun Day in Florida', 
        'Miami, Florida', 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '2019-01-11 19:00:00', 
        '2019-01-12 19:00:00', 
        1),
    ('Beauty of Italy', 
        'Rome, Italy', 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '2020-02-10 12:00:00', 
        '2020-02-14 12:00:00', 
        4),
    ('Disney World', 
        'Orlando, Florida', 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '2019-07-02 20:00:00', 
        '2019-07-09 20:00:00', 
        3),
    ('First day in Australia', 
        'Brisbane, Australia', 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        '2019-04-14 20:00:00', 
        '2019-04-15 20:00:00', 
        2);

INSERT INTO traveling_comments (text, journal_id, author_id)
VALUES
    ('Lorem ipsum dolor sit amet', 1, 2),
    ('Lorem ipsum dolor!', 1, 4),
    ('Lorem!', 4, 1),
    ('Lorem ipsum dolor sit amet, afsdfasdf', 3, 3),
    ('Wonderful! Amazing place!', 3, 3);

COMMIT;