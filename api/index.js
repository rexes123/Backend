const express = require("express");
const path = require("path");
const app = express();

const { Pool } = require("pg");
// const cors = require("cors");
// require('dotenv').config();

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");



app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory
// app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html")); // Update path to point to 'public' directory
});

app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

const { DATABASE_URL, SECRET_KEY } = process.env;

// Initialize the PostgreSQL connection
 const pool = new Pool({
   connectionString: DATABASE_URL,

   ssl: {
     // require: true,
     rejectUnauthorized: false,
   },
 });

 (async () => {
   try {
     const client = await pool.connect();
     console.log('Database connected successfully');
     client.release();
   } catch (err) {
     console.error('Database connection error:', err);
   }
 })();

// // Function to fetch PostgreSQL version
 async function getPostgreSQLVersion() {
   const client = await pool.connect();
   try {
    const response = await client.query("SELECT VERSION()");
     // Print the first row containing version info
     console.log(response.rows[0]);
     // Return version information
     return response.rows[0];
   } catch (error) {
     console.error('Error:', error);
     res.status(500).send('Server Error');
   } finally {
     client.release();
   }
 }
getPostgreSQLVersion();

// //fetch all post
// app.get("/posts", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     //SQL query
//     const query = "SELECT * FROM ALLPOSTS ORDER BY create_at ASC";
//     console.log(query);

//     //Execute sql quete
//     const execute = await client.query(query);
//     console.log(execute);
//     //Response to client
//     res.status(200).json(execute.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   } finally {
//     client.release();
//   }
// });

// app.get("/posts/:id", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const query = `SELECT * FROM ALLPOSTS WHERE id = $1`;
//     const params = [req.params.id];
//     const execute = await client.query(query, params);
//     res.status(200).json(execute.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   } finally {
//     client.release();
//   }
// });

// app.get("/posts/user/:userid", async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const query = "SELECT * FROM ALLPOSTS WHERE userId = $1";
//     const params = [req.params.userid];
//     const posts = await client.query(query, params);
//     res.status(200).json(posts.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   } finally {
//     client.release();
//   }
// });

// //Insert a new post
// app.post("/post", async (req, res) => {
//   const client = await pool.connect();

//   const auth = req.headers.authorization;
//   const token = auth.split(" ")[1];
//   console.log(token);

//   try {
//     const decode = jwt.verify(token, SECRET_KEY); //Verify the token
//     req.user = decode; // Attach user info to the request object
//     //Can req.user.id, req.user.email or req.user.name from decode

//     // Extract data from the request body
//     const obj = {
//       title: req.body.title,
//       content: req.body.content,
//       author: req.body.author,
//       // Use the user ID from JWT
//       userId: req.user.id,
//       create_at: new Date().toISOString(),
//       update_at: null,
//     };
//     console.log("Received data:", obj);

//     // SQL query to insert data into the 'posts' table
//     const query =
//       "INSERT INTO ALLPOSTS (title, content, author, userId, create_at, update_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";

//     // Params for SQL query
//     const params = [
//       obj.title,
//       obj.content,
//       obj.author,
//       obj.userId,
//       obj.create_at,
//       obj.update_at,
//     ];

//     // Execute the SQL query
//     const result = await client.query(query, params);

//     // Retrieve the id of the newly inserted post and assign it to obj
//     obj.id = result.rows[0].id;
//     res.status(201).json(obj);
//   } catch (error) {
//     console.error("Error inserting post:", error.message);
//     res.status(500).send("Server Error");
//   } finally {
//     client.release();
//   }
// });

// app.put("/post/:id", async (req, res) => {
//   const id = req.params.id;
//   const client = await pool.connect();
//   // console.log("Update params:", { title, content, author, update_at, id });

//   try {
//     //Extract token from Authorization header
//     const auth = req.headers.authorization;
//     const token = auth.split(" ")[1];
//     const decode = jwt.verify(token, SECRET_KEY);
//     req.user = decode;
//     const postQuery = "SELECT * FROM ALLPOSTS WHERE id = $1";
//     const postResult = await client.query(postQuery, [id]);

//     if (postResult.rows.length == 0) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     //Update post
//     const query = `
//     UPDATE ALLPOSTS 
//     SET title = $1, content = $2, author = $3, update_at = $4
//     WHERE id = $5
//     RETURNING *;
//     `;

//     const { title, content, author, update_at } = req.body;

//     const params = [title, content, author, update_at, id];
//     //Execute SQL query
//     const result = await client.query(query, params);
//     //response the status
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   } finally {
//     client.release();
//   }
// });

// // Delete a specific post
// app.delete("/post/:id", async (req, res) => {
//   const id = req.params.id;
//   const client = await pool.connect();

//   const auth = req.headers.authorization;

//   // Check if the Authorization header is present
//   if (!auth) {
//     return res.status(401).send("Authorization is missing");
//   }

//   //Extract token from Authorization header
//   const token = auth.split(" ")[1];
//   if (!token) {
//     return res.status(401).send("Token missing");
//   }

//   try {
//     const decode = jwt.verify(token, SECRET_KEY);
//     req.user = decode;

//     //SQL query to delete
//     const query = `DELETE FROM ALLPOSTS 
//        WHERE id = $1 AND userId = $2
//        RETURNING *;
//       `;

//     //Prepare parameter for query
//     const params = [id, req.user.id];

//     //Execute sql query
//     const execute = await client.query(query, params);

//     if (execute.rowCount === 0) {
//       res.status(404).send("Post not found or authorized to delete");
//     }

//     res.status(200).json(execute.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   } finally {
//     client.release();
//   }
// });

// //Sign up endpoint
// app.post("/signup", async (req, res) => {
//   const client = await pool.connect();
//   const { email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     // Insert new user
//     const insertUserQuery = `INSERT INTO usersAccount (email, password) VALUES ($1, $2)`;
//     const params = [email, hashedPassword];

//     await client.query(insertUserQuery, params);
//     //Respond with successful message;
//     res.status(201).json({
//       message: "user account created successfully",
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Server error");
//   } finally {
//     client.release();
//   }
// });

// app.get("/signup", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     //SQL query
//     const query = "SELECT * FROM usersAccount";

//     //Execute sql quete
//     const execute = await client.query(query);
//     //Response to client
//     res.status(200).json(execute.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   } finally {
//     client.release();
//   }
// });

// app.post("/login", async (req, res) => {
//   const client = await pool.connect();
//   const { email, password } = req.body;

//   try {
//     //Check if user exists
//     const query = "SELECT * FROM usersAccount WHERE email = $1";
//     const params = [email];
//     const execute = await client.query(query, params);

//     if (execute.rows.length === 0) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     //Retrieve the stored hashed password
//     const storedHashedPassword = execute.rows[0].password;

//     // Compare the provider password with the stored hashed password
//     //To check the validity.
//     //To check the password from frontend is equal the hashedPassword on database or not.
//     const isMatch = await bcrypt.compare(password, storedHashedPassword);

//     //If not match
//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     //Generate a JWT token
//     const token = jwt.sign(
//       { id: execute.rows[0].id, email: execute.rows[0].email },
//       SECRET_KEY,
//       {
//         expiresIn: "1h",
//       },
//     );

//     //Respond with the token
//     res.status(200).json({ token });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json("Server error");
//   } finally {
//     // const client = await pool.connect();
//     client.release();
//   }
// });

// app.get("/email", (req, res) => {
//   const authToken = req.headers.authorization;
//   if (!authToken) {
//     return res.status(401).json({
//       error: "Acess denied",
//     });
//   }

//   try {
//     const verified = jwt.verify(authToken, SECRET_KEY);
//     res.json({
//       //fetching username from token
//       email: verified.email,
//     });
//   } catch (error) {
//     res.status(400).json({ error: "Invalid token" });
//     res.status(500).send('Server Error');
//   }
// });

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "/index.html"));
// });


app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public", "error.html")); // Update path to point to 'public' directory
});

module.exports = (req, res) => app(req, res);
