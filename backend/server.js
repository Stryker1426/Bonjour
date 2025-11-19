const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.get('/api/products', (req,res)=> res.json([{id:1,name:'Sample Product',price:10}]));

app.post('/api/checkout', (req,res)=> res.json({status:'ok'}));

app.listen(PORT, ()=> console.log('Server running on '+PORT));