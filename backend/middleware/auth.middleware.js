var jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
     if(err){
        return res.status(401).json({ message: "Invalid token" });
     }else if (decoded) {
        req.user = decoded.user;
        next();
     }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authMiddleware,
};
