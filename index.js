const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const {json} = require('body-parser');
const massive = require('massive');
const session = require('express-session');


const authMiddle = (req, res, next) => {
  if(!req.session.user) {
    res.status(401).json({"error" : "Please login"})
  }else{
    next();
  }
}
app.use(json());
app.use(session({
  secret: "logan",
  resave: true,
  saveUninitialized: false
}))
massive("postgres://lwqzpuxzyizcul:1e163023754b8937cd3e00c236c3ed9073111208a92daa1de466347999232703@ec2-23-21-65-173.compute-1.amazonaws.com:5432/d2spp98aqteu5e?ssl=true")
.then(db => app.set('db', db));

app.post('/auth/login', (req, res) => {
  req.app.get('db').app_user
  .findOne({username: req.body.username})
  .then(user => {
    if(!user) {
      res.status(401).json({error: "User not found"})
    }else{
      bcrypt.compare(req.body.password, user.password)
      .then(result => {
        if(!result) {
          res.status(401).json({error: "Incorrect password"})
        }else{
          req.session.user = {
            username: user.username
          };
          res.json('ok')
        }
      })
    }
  })
})

app.post("/auth/signup", async(req, res) => {
  let hash;
  try {
    hash = await bcrypt.hash(req.body.password, 12);
  }
    catch(e) {
      res.status(500).json({error: "Unknown Error"});
    }

  try {
    await req.app.get('db')
      .app_user.insert({ username: req.body.username, password: hash});
  }
    catch(e) {
      res.status(400).json({error: "User already exists"});
    }

  req.session.user = { username: req.body.username }
  res.json('ok');
});


app.get("/profile", authMiddle, (req, res) => {
  if(!req.session.user) {
    res.status(401).json({error: "Please login"})
  }else{
    res.json(req.session.user)
  }
})


// async function handleClick() {
//   const res = await axios.get('user');
//   this.setState({user: res.data.user});
// // await && async
//   axios.get('/user').then(res => {
//     this.setState({user: res.data.user})
//   })
// }

// async function signup(password) {
//   const hash = await bcrypt.hash(password, 10)
//   console.log('hash: ', hash);
// }
// signup('password')
// const password = 'password';
// const salt = bcrypt.genSaltSync(10);
// console.log('salt: ', salt);
// const hash = bcrypt.hash(password, 10);
// bcrypt.hash(password, 10).then(result => {
//   console.log(result);
// });

// bcrypt.compareSync('password', hash);
// console.log(bcrypt.compareSync('password', hash));

app.listen(5050, () => {
  console.log("listening on 5050");
})