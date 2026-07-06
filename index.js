import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import nodemailer from 'nodemailer'
 
  

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_APP_PASSKEY

  }
})



import mongoose from 'mongoose'
mongoose.connect('mongodb://localhost:27017/authenticationProject')
import Account from './model/Account.js'

const app = express();
const port = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL || `http://localhost:${port}`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

 

app.use(express.json());
app.use(express.urlencoded({extended: true }))

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .json({ error: 'Access denied no token provided' })

  }
  try {
    const verified = jwt.verify(token, process.env.MASTERKEY)
    req.user = verified
    next()
  } catch (error) { //token is invalid
    res
      .status(400)
      .json({ 'error': 'invalid token', status: 400 })

  }

}

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'private-user-files/signed-in.html'))
  // res.render('index', {fullName: userFetched.fullName});
})


app.get('/api/user-data', verifyToken, async (req, res) => {
  const userFetched = await Account.findById(req.user.userId)
  res.json({ message: 'success', fullName: userFetched.fullName })
})



app.use(express.static('public'));

//logic for sign in
app.post('/signIn', async (req, res) => {
  try {


    //authenticating the user
    //checking whether the user exists or not
    let userActualData = await Account.findOne({ 'userName': req.body.userName })

    //username doesnot exits so send the error
    if (!userActualData) {
      res
        .status(401)
        .json({ 'error': 'invalid Credentials', 'status': 401 })
      return;
    }

    if (userActualData.isVerified === false) {
      return res.status(403).json({
        'error': 'Please check your email and verify your account before logging in.',
        'status': 403
      });
    }

    //compare the password
    let userActualPassword = userActualData.password
    let userActualId = userActualData._id

    let isPasswordCorrect = await bcrypt.compare(req.body.password, userActualPassword)


    let SECRET_KEY = process.env.MASTERKEY

    if (isPasswordCorrect) {

      const token = jwt.sign({ userId: userActualId }, SECRET_KEY, { expiresIn: '1h' })
      res.json({ token: token, redirect: '/dashboard' })

    } else {
      //password didn't match
      res
        .status(401)
        .json({ 'error': "invalid credentials", status: 401 })

    }

  } catch (error) {
    res
      .status(500)
      .json({ 'error': "internal server error", status: 500 })

  }




})

//logic for sign up
app.post('/signUp', async (req, res) => {

  let newUser = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(newUser.email)) {
    return res.status(400).json({ 'error': "invalid email format", status: 400 })
  }


  let hashedPassword = await bcrypt.hash(newUser.password, 10);

  newUser.password = hashedPassword

  //checking if the account already exits or not
  //just check userName because this userName is always gonna be unique
  const name = await Account.find({
    'userName': newUser.userName
  })
  //account does not exist so we can create a new one
  if (!name.length) {

    //storing into database
    try {
      const userAccount = await Account.create(newUser);

      const tempToken = jwt.sign({ userId: userAccount._id }, process.env.MASTERKEY, { expiresIn: '15m' })
      const verificationLink = `${baseURL}/verify?token=${tempToken}`

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: newUser.email,
        subject: 'Verify your WildCodeSmith account',
        html:
          `
            <h2> Welcome to WilCodeSmith </h2>
            <p> Please click on the link below to verify your email address. </p>
            <a href="${verificationLink}" style="margin-top:5px ; margin-bottom:5px ;padding : 10px 20px ; border:1px solid blue;color:blue; text-decoration:none; border-radius:5px;"> Verify E-mail </a>
            <p> <i>This link will expire in <b> 15 minutes.</b></i> </p>
        `
      }

      await transporter.sendMail(mailOptions)

      res.status(201).json({ 'message': 'account created successfully! Please check your email to verify', 'status': 201 })

    } catch (error) {

      res
        .status(400)
        .json({ 'error': 'failed to create account. try again', status: 400 })
    }



  } else { // account username exist already so throw error
    res
      .status(409)
      .json({ "error": "username already taken", 'status': 409 })
  }

})

app.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res
      .status(400)
      .send(`
                  <h1 style="color:red; text-align : center;"> No verification token provided ❌ </h1>
                `)
  }
  try {
    const decoded = jwt.verify(token, process.env.MASTERKEY) // return mongodb id
    await Account.findByIdAndUpdate(decoded.userId, { isVerified: true })
    res.send(`
      <div style="text-align : center ; margin:0 auto;font-family : sans-sarif; ">
      <h1 style="color:green">Email verified successfully! ✅</h1>
      <p> Your account is officialy unlocked </p>
      <br>
      <a href='/' style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;"> Click here to Log In </a>
      </div>
      `)

  } catch (error) {

    res.status(400).send(`
      <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                <h1 style="color: red;">Verification Link Expired or Invalid ❌</h1>
                <p>Please try signing up again.</p>
            </div>
      `)
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


