const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access Denied. No token provided."
    });
  }

  try {

    // Remove "Bearer " from token
    const token = authHeader.split(" ")[1];

    const verified = jwt.verify(token, "secretkey");

    req.user = verified;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid Token"
    });

  }
};

module.exports = verifyToken;