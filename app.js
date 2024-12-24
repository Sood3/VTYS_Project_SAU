// REQUIRED MODULES AND INITIALIZATION
const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 3000;
const session = require('express-session');

// DEFINE THE CLIENT FOR POSTGRESQL CONNECTION
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'splayapp',
  password: '',
  port: 5432,
});

// CONNECT TO POSTGRESQL
client.connect()
  .then(() => console.log('Connected to the database successfully'))
  .catch(err => console.error('Connection error', err.stack));

// MIDDLEWARE SETUP FOR JSON, URL-ENCODED DATA, AND SESSION MANAGEMENT
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'sudesena',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

// MAIN PAGE
app.get('/', (req, res) => {
    const user = req.session.user; // Get the logged-in user from the session
  
    let navigation = `
      <nav>
        <ul>
          <li><a href="/games">View Games</a></li>
          <li><a href="/send-friend-request">Send Friend Request</a></li>
          <li><a href="/add-user">Add New User</a></li>
          <li><a href="/login">Login</a></li>
        </ul>
      </nav>
    `;
  
    if (user) { // If user is logged in, show profile link instead of login
      navigation = `
        <nav>
          <ul>
            <li><a href="/games">View Games</a></li>
            <li><a href="/send-friend-request">Send Friend Request</a></li>
            <li><a href="/add-user">Add New User</a></li>
            <li><a href="/profile">Back to Profile</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </nav>
      `;
    }
  
    res.send(`
      <html>
        <head>
          <title>Main Page</title>
        </head>
        <body>
          <h1>SPLAY! Play, Explore, Splay</h1>
          ${navigation}
        </body>
      </html>
    `);
  });

  //LIST OF ALL THE GAMES THAT HAVE BEEN RECORDED
  app.get('/games', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM "public"."Game"');
      const games = result.rows;
  
      let table = `
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              table, th, td {
                border: 1px solid black;
              }
              th, td {
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h2>Game List</h2>
            <table>
              <tr>
                <th>Game ID</th>
                <th>Game Name</th>
                <th>Release Date</th>
                <th>Details</th>
              </tr>`;
  
      games.forEach(game => {
        table += `
          <tr>
            <td>${game.gameID}</td>
            <td>${game.game_name}</td>
            <td>${game.release_date}</td>
            <td><a href="/games/${game.gameID}">Go to Game's Page</a></td>
          </tr>`;
      });
  
      table += `
            </table>
            <br><a href="/">Back to Home</a>
          </body>
        </html>`;
  
      res.send(table);
    } catch (err) {
      console.error('Error fetching games:', err);
      res.status(500).send('Error fetching games');
    }
  });

  //ACCESS GAME PAGE TO VİEW REVIEWS AND RATINGS
  app.get('/games/:gameID', async (req, res) => {
    const { gameID } = req.params;  //GET GAME ID
  
    try {
      // GET GAME INFO
      const gameResult = await client.query('SELECT * FROM "public"."Game" WHERE "gameID" = $1', [gameID]);
      const game = gameResult.rows[0];
  
      if (!game) {
        return res.status(404).send('Game not found');
      }
  
      // GET REVIEWS
      const reviewsResult = await client.query('SELECT * FROM "public"."Reviews" WHERE "content" = $1', [gameID]);
      const reviews = reviewsResult.rows;
  
      let reviewsList = '';
      if (reviews.length > 0) {
        reviewsList = reviews.map(review => `
          <div>
            <p><strong>${review.userID}:</strong> ${review.info}</p>
            <p>Rating: ${review.rating}</p>
          </div>
        `).join('');
      } else {
        reviewsList = '<p>No reviews yet for this game.</p>';
      }
  
      // PRINT INFOS
      const gameDetailsPage = `
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              table, th, td {
                border: 1px solid black;
              }
              th, td {
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h2>${game.game_name} - Game Details</h2>
            <p><strong>Release Date:</strong> ${game.release_date}</p>
            <p><strong>Average Rating:</strong> ${game.average_rating}</p>
  
            <h3>Reviews</h3>
            ${reviewsList}
            
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `;
  
      res.send(gameDetailsPage);
    } catch (err) {
      console.error('Error fetching game details or reviews:', err);
      res.status(500).send('Error fetching game details or reviews');
    }
  });

// SEND FRENDSHIP REQUEST PAGE
app.get('/send-friend-request', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Send Friend Request</title>
      </head>
      <body>
        <h2>Send Friend Request</h2>
        <form action="/send-friend-request" method="POST">
          <label for="requesterID">Requester ID:</label>
          <input type="number" id="requesterID" name="requesterID" required>
          <br><br>
          <label for="requestedID">Requested ID:</label>
          <input type="number" id="requestedID" name="requestedID" required>
          <br><br>
          <button type="submit">Send Request</button>
        </form>
        <br><a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// FRIEND REQUEST SENDING POST ROUTE
app.post('/send-friend-request', async (req, res) => {
  const { requesterID, requestedID } = req.body;

  try {
    await client.query('SELECT send_friend_request($1, $2)', [requesterID, requestedID]);
    res.send(`
      <html>
        <body>
          <h2>Friend request sent successfully!</h2>
          <br><a href="/send-friend-request">Send Another Request</a>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.send(`
      <html>
        <body>
          <h2>Error sending friend request: ${err.message}</h2>
          <br><a href="/send-friend-request">Try Again</a>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
  }
});

// INSERT USER PAGE
app.get('/add-user', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Add User</title>
      </head>
      <body>
        <h2>Add New User</h2>
        <form action="/add-user" method="POST">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
          <br><br>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
          <br><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>
          <br><br>
          <label for="is_standart">Is Standard:</label>
          <input type="checkbox" id="is_standart" name="is_standart">
          <br><br>
          <label for="is_developer">Is Developer:</label>
          <input type="checkbox" id="is_developer" name="is_developer">
          <br><br>
          <label for="is_mod">Is Moderator:</label>
          <input type="checkbox" id="is_mod" name="is_mod">
          <br><br>
          <button type="submit">Add User</button>
        </form>
        <br><a href="/">Back to Home</a>
      </body>
    </html> 
  `);
});

// INSERT USER PAGE POST ROUTE
app.post('/add-user', async (req, res) => {
  const { username, email, password, is_standart, is_developer, is_mod } = req.body;

  // CHECK IF AT LEAST ONE CHECKBOX IS SELECTED
  const isAtLeastOneSelected = 
    (is_standart === 'on') || 
    (is_developer === 'on') || 
    (is_mod === 'on');

  // IF USER TYPE IS NOT SELECTED
  if (!isAtLeastOneSelected) {
    return res.send(`
      <html>
        <body>
          <h2>Error: Please select at least one role (Standard, Developer, or Moderator).</h2>
          <form action="/add-user" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" value="${username}" required>
            <br><br>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${email}" required>
            <br><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <br><br>
            <label for="is_standart">Is Standard:</label>
            <input type="checkbox" id="is_standart" name="is_standart" ${is_standart === 'on' ? 'checked' : ''}>
            <br><br>
            <label for="is_developer">Is Developer:</label>
            <input type="checkbox" id="is_developer" name="is_developer" ${is_developer === 'on' ? 'checked' : ''}>
            <br><br>
            <label for="is_mod">Is Moderator:</label>
            <input type="checkbox" id="is_mod" name="is_mod" ${is_mod === 'on' ? 'checked' : ''}>
            <br><br>
            <button type="submit">Add User</button>
          </form>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
  }

  try {
    // E-posta zaten var mı kontrol et
    const result = await client.query('SELECT * FROM "users"."User" WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.send(`
        <html>
          <body>
            <h2>Error: This email is already in use. Please use a different email.</h2>
            <form action="/add-user" method="POST">
              <label for="username">Username:</label>
              <input type="text" id="username" name="username" value="${username}" required>
              <br><br>
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" value="${email}" required>
              <br><br>
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
              <br><br>
              <label for="is_standart">Is Standard:</label>
              <input type="checkbox" id="is_standart" name="is_standart" ${is_standart === 'on' ? 'checked' : ''}>
              <br><br>
              <label for="is_developer">Is Developer:</label>
              <input type="checkbox" id="is_developer" name="is_developer" ${is_developer === 'on' ? 'checked' : ''}>
              <br><br>
              <label for="is_mod">Is Moderator:</label>
              <input type="checkbox" id="is_mod" name="is_mod" ${is_mod === 'on' ? 'checked' : ''}>
              <br><br>
              <button type="submit">Add User</button>
            </form>
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
    }

    // INSERT USER
    await client.query('SELECT add_user($1, $2, $3, $4, $5, $6)', [
      username,
      email,
      password,
      is_standart === 'on',
      is_developer === 'on',
      is_mod === 'on'
    ]);

    res.send(`
      <html>
        <body>
          <h2>User added successfully!</h2>
          <br><a href="/add-user">Add Another User</a>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error adding user:', err);
    res.send(`
      <html>
        <body>
          <h2>Error adding user: ${err.message}</h2>
          <br><a href="/add-user">Try Again</a>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
  }
});



// PROFILE PAGE
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if the user is not logged in
    }

    res.send(`
        <html>
          <body>
            <h2>Welcome, ${req.session.user.username}!</h2>
            <nav>
              <ul>
                <li><a href="/library">Library</a></li>
                <li><a href="/friends">Friends</a></li>
                <li><a href="/friend-requests">Friend Requests</a></li>
                <li><a href="/change-password">Change Password</a></li>
                <li><a href="/search-game">Search Game</a></li>
                <li><a href="/logout">Logout</a></li>
                <li>
                  <form action="/delete-account" method="POST" style="display: inline;">
                    <button type="submit" style="color: red;">Delete Account</button>
                  </form>
                </li>
              </ul>
            </nav>
          </body>
        </html>
    `);
});

// LOGIN PAGE

app.get('/login', (req, res) => { 

    res.send(` 
    <html> 
        <head> 
            <title>Login</title> 
        </head> 
        <body> 
            <h2>Login</h2> 
            <form action="/login" method="POST"> 
                <label for="email">Email:</label> 
                <input type="email" id="email" name="email" required> 
                <br><br> 
                <label for="password">Password:</label> 
                <input type="password" id="password" name="password" required> 
                <br><br> 
                <button type="submit">Login</button> 
            </form> 
            <br><a href="/">Back to Home</a> 
        </body> 
    </html> 
    `); 
    }); 

// LOGIN PAGE POST ROOT
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await client.query('SELECT * FROM "users"."User" WHERE email = $1 AND password = $2', [email, password]);

      if (result.rows.length === 0) {
        return res.send(`
          <html>
            <body>
              <h2>Invalid email or password</h2>
              <form action="/login" method="POST">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <br><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <br><br>
                <button type="submit">Login</button>
              </form>
              <br><a href="/">Back to Home</a>
            </body>
          </html>
        `);
      }

      // Store user data in session
      req.session.user = result.rows[0]; // Store the logged-in user data in session

      // After login, redirect to the profile page
      res.redirect('/profile'); // Redirect to profile page
    } catch (err) {
      console.error('Error during login:', err);
      res.send(`
        <html>
          <body>
            <h2>Error during login: ${err.message}</h2>
            <br><a href="/login">Try Again</a>
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
    }
});


// LOGOUT 
app.get('/logout', (req, res) => {
    req.session.destroy((err) => { // Destroy session
      if (err) {
        return res.send('Error during logout');
      }
      res.redirect('/'); // Redirect to homepage
    });
  });
  

// LIBRARY PAGE
app.get('/library', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
      }
  res.send(`
    <html>
      <head>
        <title>Your Library</title>
      </head>
      <body>
        <h2>Your Library</h2>
        <p>Here are the games you own:</p>
        <!-- Buraya kullanıcıya ait kütüphane bilgilerini ekleyebilirsiniz -->
        <br><a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// FRIENDSHIP PAGE
app.get('/friends', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        //CALLING THE FUNCTION TO GET DATAS
        const result = await client.query('SELECT * FROM get_user_friends($1)', [req.session.user.userID]);

        if (result.rows.length > 0) {
            const friendsList = result.rows.map(friend => {
                return `<li>${friend.friend_name} - ${friend.friendship_date}</li>`;
            }).join('');

            res.send(`
                <html>
                    <head>
                        <title>Your Friends</title>
                    </head>
                    <body>
                        <h2>Your Friends</h2>
                        <p>Here are your friends:</p>
                        <ul>
                            ${friendsList}
                        </ul>
                        <br><a href="/">Back to Home</a>
                    </body>
                </html>
            `);
        } else {
            res.send(`
                <html>
                    <head>
                        <title>Your Friends</title>
                    </head>
                    <body>
                        <h2>Your Friends</h2>
                        <p>You have no friends yet.</p>
                        <br><a href="/">Back to Home</a>
                    </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).send('Internal Server Error');
    }
});

// FRIENDSHIP REQUEST PAGE
app.get('/friend-requests', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); 
      }
  
    try {
      const result = await client.query('SELECT * FROM get_friend_requests($1)', [req.session.user.userID]);

  
      if (result.rows.length === 0) {
        return res.send(`
          <html>
            <body>
              <h2>You have no pending friend requests.</h2>
              <br><a href="/">Back to Home</a>
            </body>
          </html>
        `);
      }
  
      let requestsHtml = result.rows.map(request => {
        return `
          <div>
            <p>${request.requesterUsername} has sent you a friend request.</p>
            <form action="/accept-friend-request" method="POST">
              <input type="hidden" name="friendshipID" value="${request.friendshipID}">
              <button type="submit" name="action" value="accept">Accept</button>
              <button type="submit" name="action" value="reject">Reject</button>
            </form>
          </div>
        `;
      }).join('');
  
      res.send(`
        <html>
          <body>
            <h2>Friend Requests</h2>
            ${requestsHtml}
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
  
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      res.send(`
        <html>
          <body>
            <h2>Error fetching friend requests: ${err.message}</h2>
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
    }
  });
  
 // ACCEPT OR REJECT FRIEND REQUEST
  app.post('/accept-friend-request', async (req, res) => {
    const { friendshipID, action } = req.body;
  
    if (!req.session.user) {
        return res.redirect('/login'); 
      }
      
  
    try {
      let newState = (action === 'accept') ? true : false;
  
      // UPDATE THE RELEVANT RECORD IN THE 'FriendRequest' TABLE
      await client.query(`
        UPDATE public."FriendRequest"
        SET state = $1
        WHERE "friendshipID" = $2 AND "requestedID" = $3
      `, [newState, friendshipID, req.session.user.userID]);
      
      res.redirect('/friend-requests'); // REDIRECT BACK TO THE FRIEND REQUESTS PAGE
  
    } catch (err) {
      console.error('Error handling friend request:', err);
      res.send(`
        <html>
          <body>
            <h2>Error handling friend request: ${err.message}</h2>
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
    }
  });
  
// CHANGE PASSWORD PAGE (GET)
app.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
      }

    res.send(`
      <html>
        <head>
          <title>Change Password</title>
        </head>
        <body>
          <h2>Change Your Password</h2>
          <form action="/change-password" method="POST">
            <label for="old-password">Old Password:</label>
            <input type="password" id="old-password" name="old-password" required>
            <br><br>
            <label for="new-password">New Password:</label>
            <input type="password" id="new-password" name="new-password" required>
            <br><br>
            <button type="submit">Change Password</button>
          </form>
          <br><a href="/">Back to Home</a>
        </body>
      </html>
    `);
});

// CHANGE PASSWORD PAGE (POST)
app.post('/change-password', async (req, res) => {
    const { 'old-password': oldPassword, 'new-password': newPassword } = req.body;

    if (!req.session.user) {
        return res.redirect('/login');
      }
      
    try {
        // CHECHKING
        const result = await client.query(
            'SELECT * FROM "users"."User" WHERE "userID" = $1 AND password = $2',
            [req.session.user.userID, oldPassword] 
        );
        
        if (result.rows.length === 0) {
            return res.send(`
              <html>
                <body>
                  <h2>Incorrect old password</h2>
                  <br><a href="/change-password">Try Again</a>
                  <br><a href="/">Back to Home</a>
                </body>
              </html>
            `);
        }
        //SET NEW PASSWORD
        await client.query(
            'UPDATE "users"."User" SET password = $1 WHERE "userID" = $2',
            [newPassword, req.session.user.userID]  
        );
        
        res.send(`
          <html>
            <body>
              <h2>Password changed successfully!</h2>
              <br><a href="/">Back to Home</a>
            </body>
          </html>
        `);
    } catch (err) {
        console.error('Error changing password:', err);
        res.send(`
          <html>
            <body>
              <h2>Error changing password: ${err.message}</h2>
              <br><a href="/change-password">Try Again</a>
              <br><a href="/">Back to Home</a>
            </body>
          </html>
        `);
    }
});
  
//SEARCH GAME PAGE
app.get('/search-game', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const searchTerm = req.query['game-name'];
  
    if (!searchTerm) {
      return res.send(`
        <html>
          <head>
            <title>Search Game</title>
          </head>
          <body>
            <h2>Search for a Game</h2>
            <form action="/search-game" method="GET">
              <label for="game-name">Game Name:</label>
              <input type="text" id="game-name" name="game-name" required>
              <br><br>
              <button type="submit">Search</button>
            </form>
            <br><a href="/">Back to Home</a>
          </body>
        </html>
      `);
    }
  
    // IF A SEARCH TERM EXISTS, SEND A QUERY TO THE DATABASE
    try {
      const result = await client.query(`
        SELECT * FROM search_games_by_name($1);
      `, [searchTerm]);
  
      const games = result.rows;
  
      // RENDER THE PAGE WITH SEARCH RESULTS
      res.send(`
        <html>
          <head>
            <title>Search Results</title>
          </head>
          <body>
            <h2>Search Results for "${searchTerm}"</h2>
            <table>
              <tr>
                <th>Game Name</th>
                <th>Release Date</th>
                <th>Go to Game Page</th>
              </tr>
              ${games.length > 0 ? games.map(game => {
                console.log('Game:', game);  // CHECK GAMEID
                return `
                  <tr>
                    <td>${game.game_name}</td>
                    <td>${game.release_date}</td>
                    <td><a href="/games/${game.game_id}">Go to Game Page</a></td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="3">No games found</td></tr>'}
            </table>
            <br><a href="/search-game">Back to Search</a>
          </body>
        </html>
      `);
  
    } catch (error) {
      console.error('Error executing search query:', error);
      res.send('An error occurred while searching for games.');
    }
  });
  
// DELETE USER
app.post('/delete-account', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    try {
      // DELETE USER'S ACCOUNT
      const result = await client.query('DELETE FROM "users"."User" WHERE "userID" = $1 RETURNING *', [req.session.user.userID]);
  
      if (result.rowCount > 0) {
        console.log(`User ${req.session.user.userID} deleted successfully.`);
  
        // DESTROY THE SESSION
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
          }
        });
  
        return res.send(`
          <html>
            <body>
              <h2>Your account has been successfully deleted.</h2>
              <br><a href="/">Back to Home</a>
            </body>
          </html>
        `);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // START THE SERVER AND LOG THE URL WHERE IT'S RUNNING
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
