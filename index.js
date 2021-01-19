require('dotenv').config();

const path = require('path');
const port = process.env.PORT || 8080

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
var cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server, {
    cors: true
});

// const logger = require('morgan');

const Product = require('./models/products.model');
const User = require('./models/users.model');
const Admin = require('./models/admin.model');
const Cart = require('./models/cart.model');
const Order = require('./models/order.model');
const Chat = require('./models/chat.model');
// const { json } = require('body-parser');
// const { log } = require('console');
// app.get('/', (req, res) => res.send('Hello World!'));
// app.listen(port, () => console.log(`Example app listening`))
server.listen(port, () => {
  console.log('listening on *:' + port);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(fileUpload());
// app.use(logger('dev'));

mongoose.connect(process.env.MONGO_URL, (err) =>{
   if(err) console.log("Error! " + err);
   else console.log("successful mongoose conection!"); 
});

// var conn = mongoose.connection;


//get all products
app.get('/data', function(req,res){
    Product.find({})
    .exec((err,data) => {
        if(err){
            console.log("error!!!");
        }else{
            res.json(data);
        }
    });
});



//search products
app.get('/data/search', function(req,res){
    const q = req.query.q.toLowerCase()
  // console.log(q);
    Product.find({})
    .exec((err,data) => {
      if(err){
          console.log("error!!!");
      }else{
          dataFilter = data.filter((data) =>{
              return data.name.toLowerCase().search(q) != -1
          })
          res.json(dataFilter)
      }
    });
});



// display products 
app.get('/data/productType/:productType', function(req,res){
    const type = req.params.productType;
    // console.log(kind);
    Product.find({ 'kind' : type})
    .exec((err,data) => {
        if(err){
            console.log("error!!!");
        }else{
            res.json(data);
        }
    });
});


//display products detail
app.get('/data/productId/:productId', function(req,res){
    const id = req.params.productId;
    // console.log(kind);
    Product.find({"_id" : id})
    .exec((err,data) => {
        if(err){
            console.log("error!!!");
        }else{
            res.json(data);
        }
    });
});



//login
app.post('/login', function(req,res){
  // console.log('req bodyyyyyy:' + req.body.username);
    User.find({})
    .exec((err,data) => {
        if(err){
            console.log("error!!!");
        }else{
            var dataFilter = data.filter((user) => {
                return user.username === req.body.username
            });
        // console.log(dataFilter);
        // console.log(res);
          if(dataFilter.length){
          // console.log(dataFilter[0].username);
            if(dataFilter[0].password === req.body.password){
              // console.log(dataFilter[0].username);
                res.status(200).send({
                    message: "successful login!!",
                    username_val: true,
                    password_val : true,
                    userId : dataFilter[0]._id,
                    name: dataFilter[0].name,
                    username: dataFilter[0].username,
                    ahone: dataFilter[0].phone,
                    address: dataFilter[0].address,
                    email: dataFilter[0].email
                });
            }else{
                res.status(200).send({
                    message: "Wrong password!!",
                    username_val: true,
                    password_val: false
                });
            }  
          }else{
              res.status(200).send({
                  message: "User not found!!",
                  username_val: false
            });
          }
        }
    });
});




//add to cart
app.post('/addcart', function(req,res){
  var id = req.body.id;
  var num = req.body.num;
  var size = req.body.size;
  var userId = req.body.userId;
// console.log(req.body.id);
  Product.find({ '_id' : id })
  .exec((err, data) => {
    if(err)  return err
    else{
      Cart.find({})
      .exec((err, data1) => {
          if(err) return err
          else{
            dataFilter = data1.filter( (data) => {
                return data.productId == id && data.size == size && data.userId == userId
            })
          if(dataFilter.length){
              num = num + dataFilter[0].quantity;
              if(num <= 5){
                  Cart.findOneAndUpdate( {_id: dataFilter[0]._id }, {quantity : num})
                  .exec( (err) => {
                      if(err) console.log("errr");
                      res.status(200).send({
                          add : true,
                      });
                  })   
              }else{
                  res.status(200).send({
                      add : false,
                  });
              } 
          }else{
            var cart = new Cart({
              image: data[0].image,
              name : data[0].name,
              price : data[0].price,
              quantity : num,
              color : data[0].color,
              kind : data[0].kind,
              size : size,
              description : data[0].description,
              productId : id,
              userId : userId 
            });
            cart.save(function (err, cart){
              if (err) return console.error(err);
              console.log(cart.name + " saved to cart collection.");
              res.status(200).send({
                  add : true,
              });
            });
          }
        }
      })  

    }
  })
})


//update products in cart
app.post('/updatecart', function(req, res){
  let id = req.body.id 
  let num = req.body.num
  let userId = req.body.userId
  Cart.findOneAndUpdate({ _id : id }, { quantity : num})
  .exec( (err) => {
    if(err){
      console.log("errrrr");
    }else{
      Cart.find({ userId : userId})
      .exec((err,data) => {
        if(err){
          console.log("error!!!");
        }else{
          res.json(data);
        }
      });
    }
  })
})


//delete products in cart
app.post('/deletecart', function(req, res){
  let id = req.body.id 
  let userId = req.body.userId
  Cart.findOneAndDelete({ _id : id })
  .exec( (err) => {
    if(err){
      console.log("errrrr");
    }else{
      Cart.find({userId: userId})
      .exec((err,data) => {
        if(err){
          console.log("error!!!");
        }else{
          res.json(data);
        }
      });
    }
  })
})


//display cart
app.post('/cart', function(req,res){
  userId = req.body.userId
  Cart.find({ userId : userId})
  .exec((err,data) => {
      if(err){
        return err
      }else{
        res.json(data);
      }
  });
});


//brand products
app.post('/brand', function(req, res){
  var color = req.body.color;
  var productType = req.body.productType;
  var price = req.body.price;
  Product.find({})
  .exec((err,data) => {
    if(err){
      console.log("error!!!");
    }else{
      // console.log(data);
      var dataBrand = [];
        if(price.length != 0){
          dataFilter = data.filter(data => {
             return data.price >= price[0] && data.price <= price[1] && data.kind == productType
          })
        }else{
          dataFilter = data
        }
        // console.log(dataFilter);
        if(color.length != 0){
          for(var a of color){
            switch(a) {
              case 0:
                a = "red"
                break;
              case 1:
                a = "white"
                break;
              case 2:
                a = "black"
                break;
              case 3:
                a = "blue"
                break;    
            }
              dataFilter2 = dataFilter.filter(data => {
                return data.color.indexOf(a) != -1 && data.kind == productType
              })
            for(var b of dataFilter2){
              dataBrand.push(b)
            }
          }
        }else{
          dataBrand = dataFilter
        }
       res.json(dataBrand)
    }
  });
})


// register
app.post("/register", function(req, res){
  const name = req.body.name
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email
  const phone = req.body.phone
  var user = new User({
    name : name,
    username : username,
    password : password,
    email : email,
    phone : phone
  });
  user.save(function (err, user){
    if (err) return err
    console.log(user.name + " saved to cart collection.");
  });
})


// get username
app.post("/username", function(req,res){
  User.find({})
  .exec((err,data) => {
    if(err){
        return err
    }else{
       var dataFilter = data.map(data => {
          return data.username
       })
       res.json(dataFilter)
     }
  })
})


//get user information
app.get("/user/:id", function(req,res){
  const id = req.params.id
  console.log(id);
  User.findOne({'_id' : id})
  .then(data => {
        const user ={ 
          name:  data.name,
          email: data.email,
          phone: data.phone
        }
        res.json(user)
  }).catch(err => {
      res.status(200).send(false)
  })
})


//check out
app.post("/checkout", function(req, res){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  const date = mm + '/' + dd + '/' + yyyy;
  const total = req.body.total
  const name = req.body.name
  const email = req.body.email
  const note = req.body.note
  const address = req.body.address
  const phone = req.body.phone
  const userId = req.body.userId
  const products =req.body.products
  var orders = new Order({
    date: date,
    total: total,
    status: 0,
    address: address,
    phone: phone,
    note: note,
    email: email,
    name: name,
    products: products,
    userId: userId
  });
  orders.save(function (){
      res.status(200).send({
        order : true,
      });
  });

  Cart.remove({ userId : userId })
  .exec( (err) => {
      if(err) return err
      else{
          res.status(200);
      }
   })

})


//display orders
app.get("/order", function(req,res){
    const userId = req.query.userId
    Order.find({ 'userId' : userId })
    .exec( (err,data) => {
        if(err) console.log("err")
        else{
            res.json(data)
        }
    })
})


//Top products
app.get("/topproducts", function(req,res){
  Order.find({})
    .exec( (err,data) => {
        if(err) return err
        else{
            var data1 = [] // all products in order
            var data2 = [] // top products
            

            data = data.map(dt => {
                return dt.products
            })
            for (var i of data){
               for(var j of i){
                  data1.push(j)
               } 
            }
            // console.log(data1);
            data1.reduce(function(res, value) { 
              if (!res[value.productId]) {
                res[value.productId] = {
                      image: value.image[0],
                      name : value.name,
                      price : value.price,
                      quantity : 0,
                      kind : value.kind,
                      productId: value.productId
                  };
                data2.push(res[value.productId])
              }
              res[value.productId].quantity += value.quantity;
              return res;
            }, {});

            data2.sort((a,b) => {
                return b.quantity - a.quantity 
            })

            // console.log(data2);
            // data2.slice(0, 9)
            res.json(data2)
        }
    })
})


app.get("/statistics", function(req,res){
  Order.find({})
    .exec( (err,data) => {
        if(err) return err
        else{
            var data1 = [] // all products in order
            var data2 = [] // top products
            // const today = new Date()
            const month = req.query.month 
            // console.log(month === null);
            // Number(today.getMonth()) + 1;
            data = data.filter(dt => {
                return Number(dt.date.getMonth() + 1) == Number(month)
            })

            data = data.map(dt => {
                return dt.products
            })
            for (var i of data){
               for(var j of i){
                  data1.push(j)
               } 
            }
            // console.log(data1);
            data1.reduce(function(res, value) { 
              if (!res[value.productId]) {
                res[value.productId] = {
                      image: value.image[0],
                      name : value.name,
                      price : value.price,
                      quantity : 0,
                      kind : value.kind,
                      productId: value.productId
                  };
                data2.push(res[value.productId])
              }
              res[value.productId].quantity += value.quantity;
              return res;
            }, {});

            data2.sort((a,b) => {
                return b.quantity - a.quantity 
            })

            // console.log(data2);
            // data2.slice(0, 9)
            res.json(data2)
        }
    })
})






// //update product
app.post('/updateWareHouse', function(req,res) {
    
    const id = req.body.id;
    const name = req.body.name;
    const price = Number(req.body.price);
    const color = req.body.color;
    const num = Number(req.body.num);
    const type = req.body.type;
    // console.log(myFile1, myFile2);
    let set = {}
    const condition = { _id : id};

    if(!req.files){
        set = { 
            name : name,
            price: price,
            color: color,
            quantity: num,
            kind: type
        }
    }else{
        const myFile1 = req.files.file1;
        const myFile2 = req.files.file2;
        myFile1.mv(`${__dirname}/public/image/${myFile1.name}`);
        myFile2.mv(`${__dirname}/public/image/${myFile2.name}`);
        set = {
            image: 
            [
              "/image/" + myFile1.name,
              "/image/" + myFile2.name
            ], 
            name : name,
            price: price,
            color: color,
            quantity: num,
            kind: type
        }
    }
   

    
    // console.log(myFile.name);
    Product.updateOne(condition, set)
    .exec((err) => {
        if(err){
            console.log("errrrrrrrrrrrrrrrrrrrrrr");
        }else{
            Product.find({})
            .exec( (err,data) => {
                if(err) return err
                else res.json(data);
            });
        }
    })
});

// add product to ware house

app.post('/addWareHouse', function(req,res) {
  const myFile1 = req.files.file1;
  const myFile2 = req.files.file2;
  // console.log(req.body);
  const name = req.body.name;
  const price = Number(req.body.price);
  const color = req.body.color;
  const num = Number(req.body.num);
  const type = req.body.type;
  const des = req.body.des;
  myFile1.mv(`${__dirname}/public/image/${myFile1.name}`);
  myFile2.mv(`${__dirname}/public/image/${myFile2.name}`);
  var product = new Product({
      image: 
        [
          "/image/" + myFile1.name,
          "/image/" + myFile2.name
        ], 
      name : name,
      price: price,
      color: color,
      quantity: num,
      kind: type,
      description: des 
  });
  product.save(function (err, product){
      if (err) return err;

      res.status(200).send({
          add : true,
      });
  });
  
});

// delete product from ware house

app.post('/deletefromWareHouse', function(req, res){
  let id = req.body.id 
  Product.findOneAndDelete({ _id : id })
  .exec( (err) => {
      if(err) return err
      else{
        Product.find({})
        .exec((err, data) => {
          if(err) return 
          else{
            res.json(data);
          }
        });
      }
   })
})

//display order in admin

app.get("/admin/order", function(req,res){
    Order.find({})
    .exec( (err,data) => {
        if(err) return err
        else res.json(data)
    })
})

// set status

app.post("/status", (req,res) => {
    const { status, id } = req.body
    Order.findOneAndUpdate({ _id : id }, { status : status})
    .exec( (err) => {
      if(err) return err
      else{
          Order.find({})
          .exec((err,data) => {
            if(err) return err
            else res.json(data);
          });
      }
    })
})



// Chat app
app.post('/message', (req,res) => {
    console.log(req.body.room);
    Chat.find({room: req.body.room})
    .then((data) => {

        var finalData = []

        data = data.map(dt => {
            return dt.message
        })

        for(var dt of data){
            for(var dt1 of dt){
                finalData.push(dt1)
            }
        }
        // console.log(finalData);
        res.json(finalData);

    })
})


//User
const users = []; 
//add user
const addUser = ({ id, name, room}) => {

    const existingUser = users.find((user) => user.room === room && user.name === name)

    if(existingUser) {
        removeUser(id);
    }

    const user = {id, name, room };
    users.push(user);
    // console.log(users);
    return { user }
}

//remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}
//get user
const getUser = (id) => users.find((user) => user.id === id);
//get user in room
const getUserInRoom = (room) => ((user) => user.room === room)

// app.get("/chat", (req,res) => {
//     Chat.find({})
//     .then(data => {
//         console.log(data);
//     })
// })

io.on('connection', (socket) => {
    // console.log("socket connected");
    socket.on('join', ({userRecieve, name, room}, callback) => {
        
        console.log("room khi join: " + room);
        const { error, user } = addUser({ id: socket.id, name: name, room: room });
        if(error) return callback(error)
       
        // console.log(user);

      

        // pay addition to database
        Chat.find({room: user.room})
        .then(data => {
            if(!data.length){
                socket.emit('message', { sentObj: 'admin', recievedObj: userRecieve, text : ` Hi ${user.name}, Can I help u?`});
                var chat = new Chat({ 
                    message : [
                        {
                            sentObj : "admin",
                            recievedObj: userRecieve,
                            text: ` Hi ${user.name}, Can I help u?`
                        }
                    ],
                    room: user.room
                });
      
                chat.save(function (err){
                    if (err) return err;
                    console.log("add succesfully");
                });
            }
        })
        
        // socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined`});
        socket.join(user.room);
        // io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room)});
        callback();
    })   
    
    

    socket.on('sendMessage', (userRecieve, room1 , message, callback) => {
        const user = getUser(socket.id);
        // console.log(user);
        
        // io.to(user.room).emit('roomData', { room: user.room,  users: getUserInRoom(user.room)});
          


        if(user.name != "admin"){
            io.to(user.room).emit('message', { sentObj: user.name, recievedObj: 'admin' , text: message});
            Chat.find({ room: user.room})
            .then(data => {

                if(data.length){
                    const condition = {room : user.room}
                    const set = {
                        message : [...data[0].message,{
                            sentObj: user.name,
                            recievedObj: 'admin',
                            text: message
                        }]
                    }
        
                    Chat.updateOne(condition, set)
                    .then(() => {
                        console.log("updated chat!");
                    })
                    
                }else{
                    var chat = new Chat({ 
                        message : [
                            {
                                sentObj : user.name,
                                recievedObj: 'admin' ,
                                text: message
                            }
                        ],
                        room : user.room
                    });

                    chat.save(function (err){
                        if (err) return err;
                        console.log("add succesfully");
                    });
                }
                

            })

            
        }else{
            io.to(user.room).emit('message', { sentObj: 'admin', recievedObj: userRecieve , text: message});
            console.log('room khi gui tin nhan: ' + user.room);
            Chat.find({ room: user.room})
            .then(data => {
                if(data.length){
                    const condition = {room : user.room}
                    const set = {
                        message : [...data[0].message,{
                            sentObj: 'admin',
                            recievedObj: userRecieve ,
                            text: message
                        }]
                    }
        
                    Chat.updateOne(condition, set)
                    .then(() => {
                        console.log("updated chat!");
                    })
                }else{
                    var chat = new Chat({ 
                        message : [
                            {
                                sentObj : 'admin',
                                recievedObj: userRecieve,
                                text: message
                            }
                        ],
                        room : user.room
                    });

                    chat.save(function (err){
                        if (err) return err;
                        console.log("add succesfully");
                    });
                }
                
                
            })
          }

        callback();
    })


    socket.on('disconnect', () => {
        console.log('user had left!!!!');
        const user = removeUser(socket.id);

        // if(user) {
        //     io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.`});
        // }
    })
})


// display rooms

app.get("/rooms", (req,res) => {
    Chat.find()
    .then(data => {
        data = data.map(dt => {
            return dt.room
        })
        res.json(data)
    })
})

//statistic

app.get("/statistic/type", function(req,res){
  Order.find({})
    .exec( (err,data) => {
        if(err) return err
        else{
            var data1 = [] // all products in order
            var data2 = [] // top products
            // const today = new Date()
            var month = req.query.month
            // console.log(data[0].date.getMonth());

            data = data.filter(dt => {
                return Number(dt.date.getMonth() + 1) == Number(month)
            })

            console.log(data);
            data = data.map(dt => {
                return dt.products
            })
            for (var i of data){
               for(var j of i){
                  data1.push(j)
               } 
            }
            // console.log(data1);
            data1.reduce(function(res, value) { 
              if (!res[value.kind]) {
                res[value.kind] = {
                      price : 0,
                      quantity : 0,
                      kind : value.kind,
                  };
                data2.push(res[value.kind])
              }
              res[value.kind].quantity += value.quantity;
              res[value.kind].price += value.price * value.quantity;
              return res;
            }, {});

            data2.sort((a,b) => {
                return b.quantity - a.quantity 
            })
            // console.log(data2);
            // data2.slice(0, 9)
            res.json(data2)
        }
    })
})