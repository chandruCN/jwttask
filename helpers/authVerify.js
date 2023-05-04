const { tokenValidator } = require("./token");

module.exports = async function (req, res, next) {
  try {
    const { jwt } = req.cookies;
    const valid = await tokenValidator(jwt);
    if (valid) {
      next();
    } else {
      res.send("access denied");
    }
  } catch (error) {
    res.send(error);
  }
};
