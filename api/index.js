const express = require("express");

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


 app.get("trips/user/:uid", async (req, res)=>{
   const client = await pool.connect();

   try{
    const { uid } = req.params;
    const query = "SELECT * FROM trips WHERE uid = $1";
    const params = [uid];
    const trips = await client.query(query, params);
    res.status(200).json(trips.rows);
    
   } catch(error){
    console.error(error.message);
    res.status(500).json('Server Error');
   } finally{
    client.release();
   }
 })

//post trips
app.post('/trips', async function addTrip(req, res) {
  const client = await pool.connect();
  try {
    const { name, type, purpose, flight, depart_from, destination, budget_limit,
      start_date, end_date, check_in, check_out, hotel, uid } = req.body;

    // Validate the request
    const param = [name, type, purpose, flight, depart_from, destination, budget_limit,
      start_date, end_date, check_in, check_out, hotel, uid];


    const query = 'INSERT INTO trips(name, type, purpose, flight, depart_from, destination, budget_limit, start_date, end_date, check_in, check_out, hotel, uid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
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

app.post('/trips/user/:uid', async function addTrip(req, res){
  const client = await pool.connect();

  try{
    const { name, type, purpose, flight, depart_from, destination, budget_limit, start_date, end_date, check_in, check_out, hotel } = req.body;
    const uid = req.params.uid; // Extract uid from route parameters

    // Validate the request
    const param = [name, type, purpose, flight, depart_from, destination, budget_limit, start_date, end_date, check_in, check_out, hotel, uid];

    const query = 'INSERT INTO trips (name, type, purpose, flight, depart_for, destination, budget_limit, start_date, end_date, check_in. check_out, hotel, uid) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning *'
    const result = await client.query(query, param);

    res.status(201).json({
      message: 'Trip added successfully',
      trip: result.rows[0]
    });
  } catch(error){
    console.error('Database error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  } finally{
    client.release();
  }
});







app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public", "error.html")); // Update path to point to 'public' directory
});

const PORT = process.env.PORT || 3001; // Use a different port if needed
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = (req, res) => app(req, res);