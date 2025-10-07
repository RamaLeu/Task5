
const db = require('../../utils/db')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const crypto = require("crypto");
exports.getUsers = async (req, res, next) =>{
    let users = []
    
    db.query(`SELECT id, name, email, blocked, verified, last_visit from users`, (err, rows, fields) =>{
        if(err) throw err
        rows.forEach((row)=>{
            row['checked'] = false;
        })
        res.status(200).send({
            status: 'success',
            data: rows,
        })
    })
}

exports.verifyUser = async(req, res, next)=>{
    let tokenValid = true;
    if(!req.query.token){
        tokenValid = false;
    }

    let query = `UPDATE users SET verified = 1 WHERE verification_token = "${req.query.token}"`
    db.execute(query, function (err, result){
        if(err){
            console.log(err)
            tokenValid = false;
        }
    })

    return tokenValid
}
function sendVerifyEmail(email, vf_token){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ramamailservice@gmail.com',
            pass: 'oktwetroxdprxzko'
        }
        });

        let mailOptions = {
        from: 'ramamilservice@gmail.com',
        to: email,
        subject: 'New registration to RANDOM Inc.',
        text: `Hello and welcome to Random Inc.!</span> <span>To verify your email `,
        html: `<p>Hello and welcome to Random Inc.!</span> <span>To verify your email <a href="${process.env.API_URL}/verify?token=${vf_token}"> Click here </a></p>`
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        })
}

function hashPassword(password){
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

exports.registerUser = async (req, res, next)=>{
    let query = `SELECT * FROM users WHERE email = "${req.body.email}"`
    let result = await db.promise().query(query)
    let users = result[0];
    if(users.length != 0){
        res.status(403).json({ error: "User with this email already exists!" });
        return;
    }
    let verification_token = crypto.randomBytes(10).toString('hex');
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashPassword(req.body.password),
        role: 'admin',
        verified: false,
        verification_token : verification_token,
        last_visit: new Date(Date.now()),
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
    }


    sendVerifyEmail(newUser.email, newUser.verification_token);
    query = `INSERT INTO users (name, password, email, role, last_visit, verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, ? , ?, ?, ?)`
    await db.execute(query, [newUser.name, newUser.password, newUser.email, newUser.role, newUser.last_visit, newUser.verification_token, newUser.created_at, newUser.updated_at], function(err, result){
        console.log(err)
        res.status(200).send({
        status: "success",
        data: {
            id: result.insertId,
            username: newUser.name,
            email: newUser.email,
            role: newUser.role,
            verified: newUser.verified,
            }
        })
    })
}

exports.deleteUser = async (req, res, next)=>{
    let usersList = req.body
    let query = `DELETE FROM users WHERE id IN (${usersList.toString()})`
    db.execute(query);
    db.query(`SELECT id, name, email, blocked, verified, last_visit from users`, (err, rows, fields) =>{
        if(err) throw err
        rows.forEach((row)=>{
            row['checked'] = false;
        })
        res.status(200).send({
            status: 'success',
            data: rows,
        })
    })
}

exports.toggleblockUser = async (req, res, next)=>{
    let usersList = req.body.users
    let value = req.body.value
    let query = `UPDATE users SET blocked = ${value}  WHERE id IN (${usersList.toString()})`
    db.execute(query);
        db.query(`SELECT id, name, email, blocked, verified, last_visit from users`, (err, rows, fields) =>{
        if(err) throw err
        rows.forEach((row)=>{
            row['checked'] = false;
        })
        res.status(200).send({
            status: 'success',
            data: rows,
        })
    })
}