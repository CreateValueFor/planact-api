const express = require("express");
const Inquiry = require("../models/inquiry");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { email, nick, password } = req.session;
  try {
    await Inquiry.create({
      email,
      nick,
      content: req.body.content,
    });
    res.status(200).json({
      code: 200,
      message: "문의가 성공적으로 접수되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
