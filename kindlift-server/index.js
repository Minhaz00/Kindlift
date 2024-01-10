const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const events = require('./data/events.json');
const products = require('./data/products.json');
const orgs = require('./data/orgs.json');

app.use(cors());
app.use(express.json());


app.get('/events', (req, res) => {
	res.send(events)
})

app.get('/events/:id', (req, res) => {
	const id = req.params.id;
	const event = events.find(e => e.eventId === id);
	res.send(event)
})

app.get('/products', (req, res) => {
	res.send(products)
})

app.get('/products/:id', (req, res) => {
	const id = req.params.id;
	const product = products.find(e => e.id === id);
	res.send(product)
})


app.get('/orgs', (req, res) => {
	res.send(orgs)
})

app.get('/orgs/:id', (req, res) => {
	const id = req.params.id;
	const org = org.find(e => e.id === id);
	console.log(org)
	res.send(org)
})


app.listen(port, () => {
  	console.log(`Example app listening on port ${port}`)
})