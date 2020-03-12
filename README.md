# Traveling Journal API

**Name of app: Traveling Journal**

**Live app:** https://traveling-journal.now.sh/

**App repo:** https://github.com/sPro1ly0/traveling-journal-app

## Summary

I like to travel but I have trouble remembering the details of what I did during my trips. I would normally try to write what I did on random pieces of paper only to lose them over time. When I go hiking or have a carry on bag on a plane, I would like to bring a note-book or journal along but I need to pack light so that I have enough room for food or other necessary items. I can take many pictures with my phone but I never go back to look at them often. I just pick a few pictures to post on Instagram with a caption of the place and forget about it. I decided to make the Traveling Journal to help me remember on what I do on my trips, and to keep everything in one place on my phone or laptop.

The Traveling Journal allows users to write about any places they have been and current trips in one place. The user home page has all the user's journal posts listed and the number of journals they have. Users can add, edit, or delete journal posts. They can click on their journal posts to see an individual journal's page. The journal pages allow a user to read a journal's content. The journal page also has a comment section below the content for all users to make comments and ask questions about the journal. The discover page allows users to read and comment on all the journal posts from all users of the app. Users can tell if a journal post is theirs by the edit button displayed on the journal post. The discover page also has a search filter to search journals by a place's name or date.

## API Documentation

Protected Endpoints must have a valid authorization token with the request.

### Authentication Endpoints

**Login to a user account and get authorization token:** POST /api/auth/login

**Required fields:** email and password

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

#### Success Response: 200 OK

Response example:
```json
{
    "authToken": "893y94hsdjfhaiuiungerlseimg988343y84y37y4r8347brn9834"
}
```

#### Error Response: 400 BAD REQUEST

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


**Refresh an authorization token and get a new token:** POST /api/auth/refresh `Protected`

Response example:
```json
{
    "authToken": "jfhaiuiu2352svngerlseimg988343y8423fefwe834"
}
```


### Users Information Endpoints

**Get a user's information:** GET /api/users `Protected`

#### Success Response: 200 OK

Response example:
```json
{
    "full_name": "John Doe"
}
```
#### Error Response: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```

**Create a user:** POST /api/users

Required fields: full_name, email, password

Request body template:
```json
{
    "full_name": "user full name",
    "email": "valid email address",
    "password": "valid password"
}
```

Request body example:
```json
{
    "full_name": "John Doe",
    "email": "example@mail.com",
    "password": "123Abc4!"
}
```

#### Success Response: 201 CREATED

Header: Location at /api/users/:user_id

Response example:
```json
{
    "id": "1",
    "full_name": "John Doe",
    "email": "example@mail.com",
    "date_created": "2019-04-14 20:00:00"
}
```

#### Error Responses: 400 BAD REQUEST

Response example for missing one required field:
```json
{
    "error": "Missing 'email' in request body"
}
```

Response example for existing user with same email address:
```json
{
    "error": "Email already taken"
}
```

Response examples for wrong password format:
```json
{
    "error": "Password must contain 1 upper case, lower case, number, and special character"
}
```
```json
{
    "error": "Password must be longer than 8 characters"
}
```
```json
{
    "error": "Password must not start or end with empty spaces"
}
```

Response example for wrong email format:
```json
{
    "error": "Please enter an email such as yourexamle@email.com"
}
```

**Get a user's journals:** GET /api/users/journals `Protected`

#### Success Response: 200 OK

Response example:
```json
[
    {
        "id": 1,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00",
        "date_created": "2020-03-11 20:00:00",
        "date_modified": "2020-03-12 20:00:00",
        "number_of_comments": 2,
        "author": "John Doe"
    },
    {
        "id": 3,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-01-14 20:00:00",
        "end_date": "2019-02-14 20:00:00",
        "date_created": "2020-03-01 20:00:00",
        "date_modified": "2020-03-11 20:00:00",
        "number_of_comments": 0,
        "author": "John Doe"
    }
]
```

#### Error Response: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```



### Journals Endpoints

All journals endpoints are protected and require authorization token with requests.

**Get all journals:** GET /api/journals `Protected`

#### Success Response: 200 OK

Response example:
```json
[
    {
        "id": 1,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00",
        "date_created": "2020-03-11 20:00:00",
        "date_modified": "2020-03-12 20:00:00",
        "number_of_comments": 2,
        "author": "John Doe"
    },
    {
        "id": 2,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-01-14 20:00:00",
        "end_date": "2019-02-14 20:00:00",
        "date_created": "2020-03-01 20:00:00",
        "date_modified": "2020-03-11 20:00:00",
        "number_of_comments": 0,
        "author": "Jane Lane"
    },
    {
        "id": 3,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00",
        "date_created": "2020-03-11 20:00:00",
        "date_modified": "2020-03-12 20:00:00",
        "number_of_comments": 2,
        "author": "John Doe"
    },
    {
        "id": 4,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-01-14 20:00:00",
        "end_date": "2019-02-14 20:00:00",
        "date_created": "2020-03-01 20:00:00",
        "date_modified": "2020-03-11 20:00:00",
        "number_of_comments": 0,
        "author": "Jack Scott"
    }
]
```

**Add a journal:** POST /api/journals `Protected`

Required fields: title, location, content, start_date, end_date

Request example:
```json
{
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00"
}
```

#### Success Response: 201 CREATED

Header: Location at /api/journals/:journal_id

```json
{
        "id": 1,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00",
        "date_created": "2020-03-11 20:00:00",
        "date_modified": null,
        "number_of_comments": 0,
        "author": "John Doe"
}
```

#### Error Responses: 400 BAD REQUEST

Response example for missing one required field:
```json
{
    "error": {
        "message": "Missing 'title' in request body"
    }
}
```

#### Error Response: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```


**Get a specific journal by id:** GET /api/journals/:journal_id `Protected`

URL- :journal_id is the ID of the journal.

#### Success Response: 200 OK

Response example:
```json
[
    {
        "id": 1,
        "title": "Example Title",
        "location": "Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-14 20:00:00",
        "end_date": "2019-04-14 20:00:00",
        "date_created": "2020-03-11 20:00:00",
        "date_modified": "2020-03-12 20:00:00",
        "number_of_comments": 2,
        "author": "John Doe"
    }
]
```
#### Error Responses: 404 NOT FOUND

If there is not journal with given id.

Response:
```json
{
    "error": { 
        "message": "Journal doesn't exist" 
     }
}
```

#### Error Responses: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```

**Delete a specific journal by id:** DELETE /api/journals/:journal_id `Protected`

URL- :journal_id is the ID of the journal.

#### Success Response: 204 NO CONTENT

#### Error Responses: 404 NOT FOUND

If there is not journal with given id.

Response:
```json
{
    "error": { 
        "message": "Journal doesn't exist" 
     }
}
```

#### Error Responses: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```

**Update specific journal by id:** PATCH /api/journals/:journal_id `Protected`

URL- :journal_id is the ID of the journal.

Required fields: title, location, content, start_date, end_date

Request example:
```json
{
        "title": "Change Example Title",
        "location": "Change Example Location",
        "content": "Ipsum ipsum ipsum ipsum ipsum Ipsum ipsum ipsum ipsum ipsum",
        "start_date": "2019-04-15 20:00:00",
        "end_date": "2019-04-19 20:00:00"
}
```

#### Success Response: 204 NO CONTENT

#### Error Responses: 404 NOT FOUND

If there is not journal with given id.

Response:
```json
{
    "error": { 
        "message": "Journal doesn't exist" 
     }
}
```

#### Error Responses: 400 BAD REQUEST

Response example for missing one required field:
```json
{
    "error": {
        "message": "Missing 'title' in request body"
    }
}
```

#### Error Response: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```

**Get a specific journal by id and its comments:** GET /api/journals/:journal_id/comments `Protected`

URL- :journal_id is the ID of the journal.

#### Success Response: 200 OK

```json
[
   {
        "id": 1,
        "text": "Ipsum!",
        "journal_id": 1,
        "date_created": "2020-02-19 20:00:00",
        "author": "John Doe"
   },
   {
        "id": 3,
        "text": "Ipsum dolor!",
        "journal_id": 1,
        "date_created": "2020-02-22 20:00:00",
        "author": "Jane Lane"
   }
]
```

#### Error Responses: 404 NOT FOUND

If there is not journal with given id.

Response:
```json
{
    "error": { 
        "message": "Journal doesn't exist" 
     }
}
```

#### Error Responses: 400 BAD REQUEST

Response example for missing one required field:
```json
{
    "error": {
        "message": "Missing 'title' in request body"
    }
}
```

#### Error Response: 401 UNAUTHORIZED REQUEST

If no authorization token provided.

Response:
```json
{
    "error": "Missing bearer token"
}
```

If authorization token is not valid.

Response:
```json
{
    "error": "Unauthorized request"
}
```

### Comments Endpoints

All comments endpoints are protected and require authorization token with requests.

**Add a comment:** POST /api/comments `Protected`

*Only comments endpoint used in traveling journal app.

**Get all comments:** GET /api/comments `Protected`

**Get a specific comment by id:** GET /api/comments/:comment_id `Protected`


**Delete a specific comment by id:** DELETE /api/comments/:comment_id `Protected`

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
