const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.json({
        code: 400,
        message: "이미 존재하는 유저입니다.",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.json({
      code: 200,
      message: "정상적으로 가입되었습니다.",
      user: { email, nick },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.json({
        code: 400,
        message: "존재하지 않는 유저입니다.",
      });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.json({
        code: 200,
        message: "정상적으로 로그인되었습니다.",
        user: { email: user.email, nick: user.nick },
      });
    });
  })(req, res, next);
});
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  return res.json({
    code: 200,
    message: "정상적으로 로그아웃되었습니다.",
  });
});

module.exports = router;
