const express = require("express");
const User = require("../models/user");
const UserPlans = require("../models/userPlans");
const fs = require("fs");
const router = express.Router();

router.post("/load", async (req, res, next) => {
  const { category } = req.body;
  try {
    fs.readFile(`./uploads/${category}.json`, function(err, data) {
      let json = JSON.parse(data);
      res.json({
        code: 200,
        message: "성공적으로 불러왔습니다.",
        plan: json,
      });
    });
  } catch (err) {
    console.error(err);
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  const { email } = req.headers;

  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.json({
        code: 400,
        message: "존재하지 않는 유저입니다.",
      });
    }

    const exPlans = await UserPlans.findOne({
      where: { email: exUser.email },
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      code: 200,
      message: "정상적으로 불러왔습니다.",

      exPlans,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/save", async (req, res, next) => {
  const { email, genre, contents } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.json({
        code: 400,
        message: "존재하지 않는 유저입니다.",
      });
    }
    await UserPlans.create({
      genre,
      contents,
      email,
    });
    return res.json({
      code: 200,
      message: "정상적으로 저장하였습니다.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
