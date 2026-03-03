//connecting to the database
const { Pool } = require('pg'); //pool manages database connections, doesn't open new connnection everytime(which is very slow and cause crashes), reuses from the pool

require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = pool; //makes pool usuable in other files
