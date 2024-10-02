III.4 API
Develop a RESTful API with an OAuth2 authentication that can be used to obtain
basic information about this project.
• Authenticated users are allowed to retrieve or update any profiles.
• Any user can access the website’s « front page », which displays basic inforation
about the top movies.
• A GET request on a movie should return all the relevant information that has
been previously collected.
• Authenticated users can access user comments via /comments/ :id and movie/ :id/comments.
They can also post a comment using an appropriate payload.
• Any other API call should not be usable. Return the appropriate HTTP code.
Here’s a basic documentation : POST oauth/token
Expects client + secret, returns an auth token
GET /users
returns a list of users with their id and their username
GET /users/:id
returns username, email address, profile picture URL
PATCH /users/:id
Expected data : username, email, password, profile picture URL
GET /movies
returns the list of movies available on the frontpage, with their id and their name
GET /movies/:id
return a movie’s name, id, imdB mark, production year, length, available subtitles,
number of comments
GET /comments
returns a list of latest comments which includes comment’s author username, date,
content, and id.
GET /comments/:id
returns comment, author’s username, comment id, date posted
PATCH /comments/:id
Expected data : comment, username
DELETE /comments/:id
POST /comments OR POST /movies/:movie_id/comments
Expected data : comment, movie_id. Rest is filled by the server.
