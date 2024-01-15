const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const events = require('./data/events.json');
const products = require('./data/products.json');
const orgs = require('./data/orgs.json');

// minhazjisun
// O0UJnmsP1yR9YBnR


app.use(cors());
app.use(express.json());


const fs = require('fs');
const jsonFilePath = './data/orgs.json';


// SslCommerzPayment config
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = "kindl65a280596f892"
const store_passwd = "kindl65a280596f892@ssl"
const is_live = false 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const SslCommerzPayment = require('sslcommerz-lts/api/payment-controller');
const { config } = require('process');
const uri = "mongodb+srv://minhazjisun:O0UJnmsP1yR9YBnR@cluster0.wt4hncj.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
	console.log("Pinged your deployment. You successfully connected to MongoDB!");
    

	//=============== Collections =================
	const userCollection = client.db('server').collection("users");
	const posts = client.db('server').collection("posts");
	const orders = client.db('server').collection("orders");
	const newletters = client.db('server').collection("newsletter");



	app.post('/orgtojson', async(req, res)=>{
		newObj = req.body;
		console.log(newObj);

		await fs.readFile(jsonFilePath, 'utf8', (err, data) => {
			if (err) {
			  console.error('Error reading the JSON file:', err);
			  return;
			}
			try {
			  const jsonData = JSON.parse(data);
			  new_email = newObj.email;
			  let i=0;
			  for (i=0; i<jsonData.length; i++){
					const curr_obj = jsonData[i];
					if(new_email === curr_obj['email']){
						break;
					}
			  }
			  if(i === jsonData.length && newObj["Org"] === true){
				jsonData.push(newObj);
				const updatedJsonData = JSON.stringify(jsonData, null, 2);
				fs.writeFile(jsonFilePath, updatedJsonData, 'utf8', (writeErr) => {
				  if (writeErr) {
					console.error('Error writing to the JSON file:', writeErr);
				  } else {
					console.log('New object added to the JSON file successfully.');
				  }
				});
			  }
			 
			} catch (parseError) {
			  console.error('Error parsing JSON content:', parseError);
			}
		  });
	})


	app.post('/users', async (req, res) => {
		const user = req.body;
		const query = { email: user.email };
		const cursor = await userCollection.find(query);
		const searchedUser = await cursor.toArray();
		if (searchedUser.length == 0) {
			const result = await userCollection.insertOne(user);
			res.send(result);
		}
	})


	app.post('/newsletter', async(req, res) =>{
		const dataObj = req.body;
		newletters.insertOne(dataObj)
	})

	
	// Saving new posts
	app.post("/posts", async (req, res) => {
		const post = req.body;
		const result = await posts.insertOne(post);
		res.send(result);
	});
	

	// updating likes of a post with postId == id
	app.post("/posts/likes/:id", async (req, res) => {
		const postId = req.params.id;
		const {likedUser} = req.body;
		const filter = { _id: new ObjectId(postId) };
		const cursor = await posts.find(filter);
		const post = await cursor.toArray();
		const isLiked = post[0].likes.find(usr => usr === likedUser);
		if (isLiked === undefined) {
			const newLikesArr = [...post[0].likes, likedUser];
			const option = { upsert: true };
			const updateLikes = {
			$set: {
				likes: newLikesArr,
			},
			};
			const result = await posts.updateOne(
				filter,
				updateLikes,
				option
			);
			res.send(result);
		}
		else {
			const newLikesArr = post[0].likes.filter(usr => usr !== likedUser)
			const option = { upsert: true };
			const updateLikes = {
			$set: {
				likes: newLikesArr,
			},
			};
			const result = await posts.updateOne(
				filter,
				updateLikes,
				option
			);
			res.send(result);
		}
	});


	// updating comments of a post with postId == id
	app.post("/posts/comments/:id", async (req, res) => {
		const postId = req.params.id;
		const { commText, commenter, commenterId, commentDate } = req.body;
		const filter = { _id: new ObjectId(postId) };
		const cursor = await posts.find({_id: new ObjectId(postId)});
		const post = await cursor.toArray();
		const newComment = {commText, commenter, commenterId, commentDate};
		const newCommentArr = [...post[0].comments, newComment];
		const option = { upsert: true };
		const updateComments = {
		$set: {
			comments: newCommentArr,
		},
		};
		const result = await posts.updateOne(
			filter,
			updateComments,
			option
		);
		console.log(updateComments)
		res.send(result);
	});


	const trans_id = new ObjectId().toString();
	app.post('/checkout', async (req, res) =>{

		const dataObj = req.body;


		const data = {
			total_amount: dataObj?.amount,
			currency: 'BDT',
			tran_id: trans_id, // use unique tran_id for each api call
			success_url: `http://localhost:5000/success/${trans_id}`,
			fail_url: 'http://localhost:5000/fail',
			cancel_url: 'http://localhost:3030/cancel',
			ipn_url: 'http://localhost:3030/ipn',
			shipping_method: 'Courier',
			product_name: 'Computer.',
			product_category: 'Electronic',
			product_profile: 'general',
			cus_name: dataObj?.name,
			cus_email: dataObj?.email,
			cus_add1: 'Dhaka',
			cus_add2: 'Dhaka',
			cus_city: 'Dhaka',
			cus_state: 'Dhaka',
			cus_postcode: '1000',
			cus_country: 'Bangladesh',
			cus_phone: '01711111111',
			cus_fax: '01711111111',
			ship_name: 'Customer Name',
			ship_add1: 'Dhaka',
			ship_add2: 'Dhaka',
			ship_city: 'Dhaka',
			ship_state: 'Dhaka',
			ship_postcode: 1000,
			ship_country: 'Bangladesh',
		};
		// console.log(data)
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
		sslcz.init(data).then(apiResponse => {
			// Redirect the user to payment gateway
			let GatewayPageURL = apiResponse.GatewayPageURL
			res.send({url: GatewayPageURL})


			const finalOrder = {
				trans_id: trans_id,
				paidStatus: false,
				name: dataObj?.name,
				type: dataObj?.type
			}
			const result = orders.insertOne(finalOrder)


			console.log('Redirecting to: ', GatewayPageURL)
		});

		app.post('/success/:trans_id', async (req, res) =>{

			const result = await orders.updateOne(
				{trans_id : req.params.trans_id},
				{
					$set: {
						paidStatus: true,
					},
				}
			);
	
			if(result.modifiedCount === 1){
				res.redirect(`http://localhost:3000/payment/success/${trans_id}`);
			}
		})

		app.post('/fail', async(req, res) =>{
			res.redirect('http://localhost:3000/payment/fail')
		})

	})


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
	
	
	app.get('/orgs', async (req, res) => {
		res.send(orgs)
		// const cursor = userCollection.find({Org: true});
		// const orgs = await cursor.toArray();
		// res.send(orgs);
	})
	
	app.get('/orgs/:id', (req, res) => {
		const id = req.params.id;
		const org = orgs.find(e => e.id === id);
		res.send(org)
	})

	
	app.get('/user/:id', async (req, res) => {
		const id = req.params.id;

		const query1 = { userId: id };
		const cursor1 = await userCollection.find(query1);
		const userProfile = await cursor1.toArray();
		// const profileObj = { userProfile };
		res.send(userProfile);
	})


	app.get("/posts", async (req, res) => {
		const query = {};
		const cursor = posts.find(query);
		const Posts = await cursor.toArray();
		res.send(Posts);
	});

	app.get("/posts/:id", async (req, res) => {
		const id = req.params.id;
		const query =  { _id: new ObjectId(id) };
		const cursor = posts.find(query);
		const Posts = await cursor.toArray();
		res.send(Posts);
	});

	app.get('/post/:id', async (req, res) => {
			
		const id = req.params.id;
		const query1 = { _id: new ObjectId(id) };
		const cursor1 = posts.find(query1);
		const resultPost = await cursor1.toArray();
		res.send(resultPost);
	})

	



  }
  finally {}
}
run().catch(console.dir);







app.get('/', (req, res) => {
	res.send('Hello World!')
})


app.listen(port, () => {
  	console.log(`Example app listening on port ${port}`)
})