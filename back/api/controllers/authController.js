const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../utils/db')
const moment = require('moment');


exports.login = async (req, res)=>{
    const {email, password} = req.body;
    let query = `SELECT * FROM users WHERE email = "${email}"`
    let result = await db.promise().query(query)
    let users = result[0];

    const user = users.find((u) => u.email === email);
    if (!user || user.blocked) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
    if (isMatch) {
      // Create a token
      let newVisit = moment().format('YYYY-MM-DD HH:mm:ss')
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email, verified: user.verified }, process.env.JWT_SECRET, { expiresIn: '1h' });
      query = `UPDATE users SET last_visit = "${newVisit}" WHERE email = "${user.email}"`
      db.execute(query);
      return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email, verified: user.verified, blocked: user.blocked }  });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    });
}


exports.validateToken = (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let query = `SELECT id, name, email, verified, blocked from users WHERE id = "${decoded.id}"`
      db.query(query, (err, rows, fields) =>{
          if(rows[0]){
              res.json({ user: rows[0] });
          }
      })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};