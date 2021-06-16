const JWT = require("jsonwebtoken");
module.exports = generateToken = (user) => {
  return JWT.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      isEmailVerified: user.isEmailVerified,
      isNumberVerified: user.isNumberVerified,
    },
    process.env.JWT_SECRET || "itssupersecret",
    {
      expiresIn: "7d",
    }
  );
};
