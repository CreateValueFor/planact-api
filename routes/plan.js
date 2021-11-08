const express = require("express");
const User = require("../models/user");
const UserPlans = require("../models/userPlans");
const fs = require("fs");
const multer = require("multer");
const PlanSummary = require("../models/plan");
const { v4: uuidv4 } = require("uuid");

let imageID = uuidv4();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    const ext = file.originalname.split(".")[1];
    callback(null, `${imageID}.${ext}`);
  },
  encoding: (req, file, callback) => {
    callback(null, "utf-8");
  },
});
const uploader = multer({ storage: storage });
const router = express.Router();
//플랜 불러오기 by IP
router.get("/", async (req, res, next) => {
  const category = req.query["category"];
  try {
    fs.exists(`./uploads/${category}.json`, function(exists) {
      if (exists) {
        fs.readFile(`./uploads/${category}.json`, function(err, data) {
          let json = JSON.parse(data);
          res.json({
            code: 200,
            message: "성공적으로 불러왔습니다.",
            query: category,
            plan: json,

            exist: `./uploads/${category}.json`,
          });
        });
      } else {
        res.json({
          code: 400,
          message: "선택한 플랜이 존재하지 않습니다.",
          query: category,
        });
      }
    });
  } catch (err) {
    console.error(err);
    return next(error);
  }
});
//Plan 불러오기 by post
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

//plan 업로드
router.post("/summary", uploader.single("thumb"), async (req, res, next) => {
  let ext;
  if (req.file) {
    ext = req.file.originalname.split(".")[1];
  } else {
    imageID = "";
    ext = "";
  }
  const { title, sns, author, category, email } = req.body;

  const planID = uuidv4();
  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.status(202).json({
        code: 202,
        message: "유저가 존재하지 않습니다.",
      });
    }
    await PlanSummary.create({
      author,
      title,
      sns,
      category,
      planID,
      imgID: `${imageID}.${ext}`,
      UserId: exUser.id,
    });
    return res.json({
      code: 200,
      req: req.body,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  const email = req.query.email;
  const id = req.query.id;
  try {
    if (email) {
      const exUser = await User.findOne({ where: { email } });

      const plans = await PlanSummary.findAll({
        where: { UserId: exUser["id"] },
      });
      // console.log(plans);
      return res.status(200).json({
        code: 200,
        plans,
      });
    }
    if (id) {
      const plans = await PlanSummary.findOne({
        where: { id },
      });
      return res.status(200).json({
        code: 200,
        plans,
      });
    }
  } catch (err) {
    console.error(err);
  }
});

router.post("/daily", async (req, res, next) => {
  let exJSON;
  try {
    const planId = req.body.planId;
    const path = `public/plans/${planId}.json`;
    let file = req.body.dailyplan;

    if (fs.existsSync(path)) {
      exJSON = JSON.parse(fs.readFileSync(path));
      exJSON.push(file);
    } else {
      exJSON = [];
      exJSON.push(file);
    }
    file = JSON.stringify(exJSON);
    fs.writeFileSync(path, file);
    return res.json({
      code: 200,
      message: "정상적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/daily", async (req, res, next) => {
  const id = req.query.id;
  const path = `public/plans/${id}.json`;
  try {
    if (!fs.existsSync(path)) {
      res.json({
        code: 202,
        message: "파일이 존재하지 않습니다.",
      });
    }
    const plans = JSON.parse(fs.readFileSync(path));
    res.json({
      code: 200,
      plans,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
