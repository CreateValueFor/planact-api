const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({
      status: 500,

      message: "hello",
    });
    // res.render("login", {
    //   user,
    //   domains: user && user.Domains,
    // });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// router.post("/domain", isLoggedIn, async (req, res, next) => {
//   try {
//     await Domain.create({
//       UserId: req.user.id,
//       host: req.body.host,
//       type: req.body.type,
//       clientSecret: uuidv4(),
//     });
//     res.redirect("/");
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

module.exports = router;
