const express = require("express");
const bodyparser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path")
const app = express();
const cors = require('cors');
require('dotenv').config()
require('express-async-errors');
const { errHandler } = require('./middlewares/error-handlers')
const {NotFoundErr} = require('./error-types/not-found-err')

const { authRouter } = require('./api/v1/auth/user.auth.routes')
const { roleRouter } = require("./api/v1/role/role.routes")
const { communityRouter } = require('./api/v1/community/community.routes')
const { memberRouter } = require('./api/v1/member/member.routes')

const uploads = path.join(__dirname, "uploads" )
console.log(uploads)

app.set('trust proxy', true);
app.use(cors({
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
  credentials: true,
  origin: [
    "http://localhost:5173", 
    "http://192.168.0.188:5173",  
    "http://localhost:3000", 
    "http://192.168.0.188:3000"
  ]
}));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? 'none' : false
  })
);

app.use("/uploads", express.static(__dirname + '/uploads/'))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))


//==================================== api routes ==================================
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/role', roleRouter);
app.use('/api/v1/community', communityRouter);
app.use('/api/v1/member', memberRouter);
app.use('/', async(req, res) => {
  return res.status(200).json({"routes" : {
    "/api/v1/": [
      {"auth": [
        "POST: /api/v1/auth/signup",
        "POST: /api/v1/auth/signin",
        "POST: /api/v1/auth/signout",
        "GET: /api/v1/auth/me"

      ]},
      {'role': [
        "GET: /api/v1/role",
        "GET: /api/v1/role?page=Number",
        "POST: /api/v1/role"
      ]},
      {'community': [
        'POST: /api/v1/community',
        'GET: /api/v1/community',
        'GET: /api/v1/community?page=Number',
        'GET: /api/v1/community/:id/members',
        'GET: /api/v1/community/:id/members?page=Number',
        'GET: /api/v1/community/me/owner',
        'GET: /api/v1/community/me/owner?page=Number',
        'GET: /api/v1/community/me/member',
        'GET: /api/v1/community/me/member?page=Number',
      ]},
      {'member': [
        'POST: /api/v1/member/',
        'DELETE: /api/v1/member/:id',
      ]},
    ]
  }})
})
app.all("*", async (req, res, next) => {
  throw new NotFoundErr();
})

app.use(errHandler);

module.exports =  { app };
