const jwt = require('jsonwebtoken');
const db = require('../../utils/db')
exports.checkForAuth = (req, res, next) => {
    let isTokenValid = true
    if(req.header('Authorization')){
          const token = req.header('Authorization').replace('Bearer ', '');
        
          if (!token) {
            isTokenValid = false;
          }
        
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if(decoded){
                let query = `SELECT id, blocked from users WHERE id = "${decoded.id}"`
                db.query(query, (err, rows, fields) =>{
                    if(err) throw err
                    if((rows[0] && rows[0].blocked == true) ||!rows[0]){
                        isTokenValid = false;
                        res.status(403).send({'error': 'Session invalid or user is blocked'})
                    }else{
                        next();
                    }
                })
            }
          } catch (err) {
            console.log(err)
            isTokenValid = false;
          }
    }
    else{
        isTokenValid = false;
        
    }
    
    if(!isTokenValid){
        res.status(403).send({'error': 'Session invalid or user is blocked'})
    }
};