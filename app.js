const express = require('express')
const cors = require('cors')
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', //React dev port
  credentials: true
}));
app.set('trust proxy', 1);

app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/shorten', require('./routes/shorten'));
app.use('/urls', require('./routes/urls'))
app.use('/analytics', require('./routes/analytics'));
app.use('/', require('./routes/redirect'));

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', ()=>console.log(`server running on port ${PORT}`));
