const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const multer = require('multer')
let imageID;
const storage = multer.diskStorage({
  destination:(req, file, callback)=>{
    callback(null, "uploads/profile");
  },
  filename:(req,file, callback)=>{
    const ext = file.originalname.split(".")[1];
    imageID = uuidv4();
    callback(null, `${imageID}.${ext}`);
  },
  encoding:(req, file, callback)=>{
    callback(null, "utf-8")
  }
})

const uploader = multer({storage:storage})

router.get("/session", async (req, res, next) => {
  try {
    return res.json({
      message: req.sessionID,
      email: req.session.email,
      nick: req.session.nick,
    });
  } catch (err) {
    console.error(error);
    return next(error);
  }
});

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(202).json({
        code: 202,
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

router.options("/login", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.send();
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(202).json({
        code: 202,
        message: "User does not exist",
      });
    }
    req.session.email = user.email;
    req.session.nick = user.nick;
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.json({
        code: 200,
        message: "Login success",
        user: { email: user.email, nick: user.nick },
      });
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    req.logout();
    req.session.destroy();

    return res.json({
      code: 200,
      message: "정상적으로 로그아웃되었습니다.",
    });
  } catch (err) {
    res.status(202).json({
      code: 202,
      message: "문제가 발생했습니다.",
      error: err,
    });
  }
});

router.patch("/profile",uploader.single("thumb"), async(req,res)=>{
  let ext;
  console.log(req.body)
  if (req.file) {
    ext = req.file.originalname.split(".")[1];
  } else {
    imageID = "";
    ext = "";
  }
  const nick = req.body.nick;
  const email = req.body.email;


  try{
    const exUser = await User.findOne({where:{email }});
    if(!exUser){
      return res.status(202).json({
        code:202,
        message:"유저가 존재하지 않습니다."
      })
    }
    await User.update({
      nick,
      thumb:imageID
    },{where:{email}})


    return res.json({
      code:200,
      nick:nick,
      thumb:imageID
    })
  }catch(err){
    console.error(err)
  }
})

module.exports = router;
