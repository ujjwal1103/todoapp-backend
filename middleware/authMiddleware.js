const JWT = require("jsonwebtoken");
const colors = require("colors");
const User = require("../model/User.js");

//Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(req.headers.authorization, "your-secret-key");
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      message: error.message
    });
  }
};

//admin acceess
const isAdmin = async (req, res, next) => {
  console.log(req.user)
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};

module.exports = {requireSignIn, isAdmin};
