const express = require("express");

var admin = require("firebase-admin");

//Initialize firebase admin
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const path = require("path");
const app = express();

const { Pool } = require("pg");
const cors = require("cors");
require('dotenv').config();


app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html")); // Update path to point to 'public' directory
});


const { DATABASE_URL, SECRET_KEY } = process.env;

// Initialize the PostgreSQL connection
const pool = new Pool({
  connectionString: DATABASE_URL,

  ssl: {
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

//......................................admin.................................................
app.post('/signup-admin', async(req, res)=>{
  const {email, password} = req.body;
  
  try{
    const signUpAcc = await admin.auth().createUser({
      email: email,
      password: password
    });
    res.status(201).json({
      message: "Admin account created successfully,", 
      uid: signUpAcc.uid
    })
  } catch(error){
    console.error('Error creating admin account:', error);
    res.status(500).json({
      error: 'Failed to created admin account'
    });
  }
});


app.post('/login-admin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate the user
    const user = await admin.auth().getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Admin account does not exist'
      });
    }

    // Verify the password (Firebase Authentication SDK does not provide a direct way to verify passwords server-side,
    // so you typically handle login on the client-side. But for backend checks, consider using custom tokens or additional services)
    
    // Firebase Admin SDK does not have a method to verify passwords directly
    // Consider implementing a custom solution or use Firebase client SDK for password verification

    // Create a custom token
    const token = await admin.auth().createCustomToken(user.uid);

    res.status(200).json({
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({
      error: 'Failed to login admin account'
    });
  }
});


//......................................admin.................................................


app.get('/expenses', async function fetchExpense(req, res) {
  const client = await pool.connect();
  try {
    const query = await client.query("SELECT * FROM EXPENSES");
    console.log(query.rows);
    res.status(200).json(query.rows)

  } catch (error) {
    console.error(error.message);
  } finally {
    client.release();
  }
}
)

app.post('/expenses', async function addExpense(req, res) {
  const client = await pool.connect();
  try {
    const { subject, merchant, date, category, description, employee, total, report } = req.body;
    const param = [subject, merchant, date, category, description, employee, total, report];
    const query = 'INSERT INTO EXPENSES(subject, merchant, date, category, description, employee, total, report) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'
    const execute = client.query(query, param)
    console.log(execute)

  } catch (error) {
    console.error(error.message);
  } finally {
    client.release();
  }

})

app.get('/trips', async function fetchTrips(req, res) {
  const client = await pool.connect();
  try {
    const query = await client.query("SELECT * FROM TRIPS");
    console.log(query.rows);
    res.status(200).json(query.rows)

  } catch (error) {
    console.error(error.message);
  } finally {
    client.release();
  }
}
)

//post trips
app.post('/trips', async function addTrip(req, res) {
  const client = await pool.connect();
  try {
    const { name, type, purpose, flight, depart_from, destination, budget_limit,
      start_date, end_date, check_in, check_out, hotel } = req.body;

    // Validate the request
    const param = [name, type, purpose, flight, depart_from, destination, budget_limit,
      start_date, end_date, check_in, check_out, hotel];


    const query = 'INSERT INTO trips(name, type, purpose, flight, depart_from, destination, budget_limit, start_date, end_date, check_in, check_out, hotel) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
    const result = await client.query(query, param);

    res.status(201).json({
      message: 'Trip added successfully',
      //to extract and retuth the details of the newly inserted trip from the database.
      trip: result.rows[0]
    })

  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      error:'Internal Server Error'
    })
  } finally {
    client.release();
  }
})







app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public", "error.html")); // Update path to point to 'public' directory
});

const PORT = process.env.PORT || 3001; // Use a different port if needed
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = (req, res) => app(req, res);