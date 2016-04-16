/**
 * Created by khaled on 4/16/2016.
 */

module.exports = function(db){
  return {
    requireAuthentication: function(req,res,next){ //middleware always takes three parameter,
      var token = req.get('Auth'); // from request header get the value of 'Auth' key

      db.user.findByToken(token).then(function(user){
        req.user = user;
        next(); // this next will carry on to personal data of that user
      }, function(err){
        res.status(401).send(); //UnAuthorized Http response // here as next is not called it will not move forward
      })
    }
  }
}