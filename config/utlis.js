const JWT = require("jsonwebtoken");
module.exports = generateToken = (user) => {
  return JWT.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET || "itssupersecret",
    {
      expiresIn: "7d",
    }
  );
};

module.exports = isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    JWT.verify(
      token,
      process.env.JWT_SECRET || "itssupersecret",
      (error, decode) => {
        if (error) {
          return res.status(401).send({ message: "Invalid Token" });
        }
        req.user = decode;
        next();
      }
    );
  } else {
    return res.status(401).send({
      message: "Token not found!",
    });
  }
};
