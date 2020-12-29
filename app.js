
const express = require('express');
const engines = require('consolidate');
const app = express();
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

//npm i handlebars consolidate --save
app.set('views', __dirname + '/views');
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: false }))
app.set('view engine', '.hbs');

//app.set('view engine', 'ejs');

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb+srv://ngocthang:ngocthang@cluster0.rwjhi.mongodb.net/test';

app.get('/all', async function (req, res) {
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let dbo = client.db("ProductDB2");
    let results = await dbo.collection("products").find({}).toArray();
    res.render('allSanPham', { sanPham: results });
})

app.get('/add', function (req, res) {

    res.render('addSanPham');

    
});

app.post('/doAddProduct', async function (req, res) {
    var c = req.body.price;
    var f = req.body.color;
    
    // var k = 1;
    // var format = /[^0-9a-z]+/; 
    // ^ de phu nhan voi mo hinh
    // format.test(c)
        if(parseInt(c) <= 0 ||(f != "green"&&f != "yellow"&&f != "gray")){
            let id = req.body.id;
            let description = req.body.description;
            let color =  req.body.color;
            let price =  req.body.price;
            //k = 0;
            res.render('addSanPham',{error:{nameError2 : 'price just a number > 0 and The only colors allowed are green, yellow, and gray '}, 
            oldValues : {id : id, description : description, color : color, price : price}})
            return false;
           
            }
        var insertProducts = {
            _id: req.body.id,
            description: req.body.description,
            color: req.body.color,
            price: req.body.price,

        };
        let client = await MongoClient.connect(url);
        let dbo = client.db("ProductDB2");
        await dbo.collection("products").insertOne(insertProducts, (err, results) => {
            console.log(results)
            if (err) return console.log(err)
            console.log('saved to data');

        });
        let results = await dbo.collection("products").find({}).toArray();
        res.render('allSanPham', { sanPham: results });
    

    
});


app.get('/delete', async function (req, res) {
    let id = req.query.id;
    let price = req.query.price;   
    var c = req.query.name;   
    
   
    var format = /[^a-z]+/; 
    //parseInt(price) > 50
    // ^ de phu nhan voi mo hinh 
    if(price > 99){
    console.log(price);
    
       //==res.render('error');//sua
      
       let client = await MongoClient.connect(url, { useUnifiedTopology: true });
       let dbo = client.db("ProductDB2");
       let results = await dbo.collection("product").find({}).toArray();
        res.render('allSanPham',{error:{nameError1 : 'can not detele product > 99'},  sanPham: results 
        })
        
        return false;
    }
    var ObjectId = require('mongodb').ObjectId;
    let condition = {"_id" : ObjectId(id)};
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/all');
})


app.get('/edit', async (req, res) => {
    let id = req.query.id;
    var ObjectId = require('mongodb').ObjectId;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    let results = await dbo.collection("products").findOne({ "_id": ObjectId(id) });
    res.render('editSanPham', { sanPham: results });
})

app.post('/edit', async (req, res) => {


    let id1 = req.body._id;
    let name1 = req.body.name;
    let price1 = req.body.price;
    let category1 = req.body.category;


    let newValue = { $set: { name: name1, price: price1, category: category1, } }
    var ObjectId = require('mongodb').ObjectId;
    let condition = { "_id": ObjectId(id1) };
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    await dbo.collection("products").updateOne(condition, newValue, (err, results) => {
        console.log(results)
        if (err) return console.log(err)
        console.log('saved to data');
    });

    let results = await dbo.collection("products").find({}).toArray();
    res.render('allSanPham', { sanPham: results });

});

const PORT = process.env.PORT || 5000
var server = app.listen(PORT, function () {
    console.log("Server is running at " + PORT);
});