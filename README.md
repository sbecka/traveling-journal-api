# Traveling Journal API

**Name of app: Traveling Journal**

**Live app:** https://traveling-journal.now.sh/

**App repo:** https://github.com/sPro1ly0/traveling-journal-app

## Summary

I like to travel but I have trouble remembering the details of what I did during my trips. I would normally try to write what I did on random pieces of paper only to lose them over time. When I go hiking or have a carry on bag on a plane, I would like to bring a note-book or journal along but I need to pack light so that I have enough room for food or other necessary items. I can take many pictures with my phone but I never go back to look at them often. I just pick a few pictures to post on Instagram with a caption of the place and forget about it. I decided to make the Traveling Journal to help me remember on what I do on my trips, and to keep everything in one place on my phone or laptop.

The Traveling Journal allows users to write about any places they have been and current trips in one place. The user home page has all the user's journal posts listed and the number of journals they have. Users can add, edit, or delete journal posts. They can click on their journal posts to see an individual journal's page. The journal pages allow a user to read a journal's content. The journal page also has a comment section below the content for all users to make comments and ask questions about the journal. The discover page allows users to read and comment on all the journal posts from all users of the app. Users can tell if a journal post is theirs by the edit button displayed on the journal post. The discover page also has a search filter to search journals by a place's name or date.

## API Documentation

### Authentication Endpoints

**Login to a user account and get authorization token:** POST /api/auth/login

Request body template:
```json
{
    "email": "valid email address",
    "password": "valid password"
}
```

Request body example:
```json
{
    "email": "example@mail.com",
    "password": "123Abc4!"
}
```

#### Success Response 200 OK

Response example:
```json
{
    "authToken": "893y94hsdjfhaiuiungerlseimg988343y84y37y4r8347brn9834"
}
```

#### Error Response 400 BAD REQUEST

Response example for invalid email or password:
```json
{
    "error": "Incorrect email or password"
}
```

Response example for missing email or password:
```json
{
    "error": "Missing 'email' in request body"
}
```
```json
{
    "error": "Missing 'password' in request body"
}
```


**Refresh an authorization token and get a new token:** POST /api/auth/refresh

Protected endpoint

Response example:
```json
{
    "authToken": "jfhaiuiu2352svngerlseimg988343y8423fefwe834"
}
```

### Users Information Endpoints

**Get a user's info:**

GET /api/users

**Create a user account:**

POST /api/users

### Journals Endpoints

**Get all journals:**

GET /api/journals

**Add a journal:**

POST /api/journals

**Get a specific journal by id:**

GET /api/journals/:journal_id

**Delete a specific journal by id:**

DELETE /api/journals/:journal_id

**Edit a specific journal by id:**

PATCH /api/journals/:journal_id

**Get a specific journal by id and its comments:**

GET /api/journals/:journal_id/comments

### Comments Endpoints

**Get all comments:**

GET /api/comments

**Add a comment:**

POST /api/comments

**Get a specific comment by id:**

GET /api/comments/:comment_id

**Delete a specific comment by id:**

DELETE /api/comments/:comment_id

## Technologies Used

<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>PostgreSQL</li>
  <li>Postgrator for SQL migration</li>
  <li>Knex.js a SQL Query Builder</li>
  <li>JWT for authentication</li>
  <li>Supertest, Mocha, and Chai for testing</li>
</ul>
