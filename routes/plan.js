const express = require("express");
const User = require("../models/user");
const UserPlans = require("../models/userPlans");
const fs = require("fs");
const multer = require("multer");
const PlanSummary = require("../models/plan");
const { v4: uuidv4 } = require("uuid");
// const { sequelize } = require("../models/user");
const sequelize = require("sequelize");
const Op = sequelize.Op;

let imageID;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    const ext = file.originalname.split(".")[1];
    imageID = uuidv4();
    callback(null, `${imageID}.${ext}`);
  },
  encoding: (req, file, callback) => {
    callback(null, "utf-8");
  },
});
const uploader = multer({ storage: storage });

const dailyImageStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/daily/");
  },
  filename: (req, file, callback) => {
    const ext = file.originalname.split(".")[1];
    const name = file.fieldname;
    callback(null, `${name}.${ext}`);
  },
});
const imageUploader = multer({ storage: dailyImageStorage });

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

//plan summary 업로드
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
      imgID: ext ? `${imageID}.${ext}` : "",
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

//plan summary 업데이트
router.patch("/summary", uploader.single("thumb"), async (req, res, next) => {
  try {
    let ext;

    const id = req.query.id;
    const { title, sns, author, category, email } = req.body;
    const exUser = await User.findOne({ where: { email } });
    const exPlanSummary = await PlanSummary.findOne({ where: { id } });
    const pastImgID = exPlanSummary.imgID;
    // file 이 존재할 경우 확장자 설정 및 존재하지 않을 경우 이름 처리
    if (req.file) {
      ext = req.file.originalname.split(".")[1];

      if (pastImgID) {
        fs.unlinkSync(`uploads/${pastImgID}`);
      }
    }

    if (!exUser) {
      return res.status(202).json({
        code: 202,
        message: "유저가 존재하지 않습니다.",
      });
    }
    await PlanSummary.update(
      {
        author,
        title,
        sns,
        category,
        imgID: ext ? `${imageID}.${ext}` : pastImgID,
        UserId: exUser.id,
      },
      { where: { id } }
    );
    return res.json({
      code: 200,
      message: "정상적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  const email = req.query.email;
  const id = req.query.id;
  const search = req.query.search;
  const category = req.query.category;
  let order = "createdAt";

  if (req.query.category !== "") {
    order = req.query.order;
  }
  try {
    if (search) {
      const plans = await PlanSummary.findAndCountAll({
        order: [["createdAt", "DESC"]],
        where: {
          [Op.or]: [
            {
              title: {
                [Op.like]: "%" + search + "%",
              },
            },
            {
              author: {
                [Op.like]: "%" + search + "%",
              },
            },
          ],
        },
      });
      return res.json({
        code: 200,
        plans: plans.rows,
        count: plans.count,
      });
    }

    if (email === "all") {
      const plans = await PlanSummary.findAndCountAll({
        order: [["createdAt", "DESC"]],
      });
      // const count = await PlanSummary.count
      return res.status(200).json({
        code: 200,
        plans: plans.rows,
        count: plans.count,
        message: "플랜 전체를 가져왔습니다.",
      });
    }
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
      if (plans.imgID) {
        if (!fs.existsSync(`uploads/${plans.imgID}`)) {
          return res.json({
            code: 202,
            message: "이미지가 존재하지 않습니다.",
            plans,
          });
        }
        const imgFile = fs.readFileSync(`uploads/${plans.imgID}`);
        const imgBase64 = Buffer.from(imgFile).toString("base64");
        return res.json({
          code: 200,
          plans,
          img: imgBase64,
        });
      }
      return res.status(200).json({
        code: 200,
        plans,
      });
    }
  } catch (err) {
    console.error(err);
  }
});

router.post("/daily/img", imageUploader.any(), async (req, res, next) => {
  try {
    console.log(req.body);
    res.json({
      code: 200,
      message: "success",
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/daily/images", async (req, res, next) => {
  let images = [];
  let image;
  try {
    req.body.img.map((data) => {
      if (fs.existsSync(`uploads/daily/${data}`)) {
        image = fs.readFileSync(`uploads/daily/${data}`);
        image = image.toString("base64");

        images.push({ name: data, img: image });
      }
    });
    res.json({
      code: 200,
      message: "success",
      list: images,
    });
  } catch (err) {
    console.error(err);
  }
});

router.patch("/daily", async (req, res, next) => {
  try {
    console.log(req.body);
    const { planId, dailyplan } = req.body;
    const path = `public/plans/${planId}.json`;
    if (!fs.existsSync(path)) {
      res.json({
        code: 202,
        message: "플랜 데이터가 존재하지 않습니다.",
      });
    }
    console.log(dailyplan);
    const json = JSON.stringify(dailyplan);
    fs.writeFileSync(path, json);
    res.json({
      code: 200,
      message: "정상적으로 저장되었습니다.",
    });
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
      return res.json({
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

router.delete("/daily", async (req, res, next) => {
  try {
    const planID = req.query.id;
    const dailyID = req.query.dailyId;
    console.log(dailyID);
    const path = `public/plans/${planID}.json`;
    if (!fs.existsSync(path)) {
      return res.json({
        code: 200,
        message: "파일이 존재하지 않습니다.",
      });
    }
    const plans = JSON.parse(fs.readFileSync(path));
    plans.map((data) => {
      if (data.id == dailyID) {
        data.events.map((event) => {
          if (fs.existsSync(`uploads/daily/${event.thumb}`)) {
            fs.unlinkSync(`uploads/daily/${event.thumb}`);
          }
        });
      }
    });
    let newPlans = [];
    plans.map((data) => {
      if (data.id != dailyID) {
        newPlans.push(data);
      }
    });
    console.log(newPlans);

    fs.writeFileSync(path, JSON.stringify(newPlans));
    return res.json({
      code: 200,
      message: "정상적으로 삭제되었습니다.",
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/download", async (req, res, next) => {
  try {
    const id = req.body.id;
    const start = req.body.date;
    const email = req.body.email;

    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      res.status(202).json({
        code: 202,
        message: "유저가 존재하지 않습니다.",
      });
    }
    await UserPlans.create({
      UserId: exUser.id,
      PlanSummaryId: id,
      startdate: start,
    });
    await PlanSummary.update(
      {
        downloads: sequelize.literal("downloads + 1"),
      },
      { where: { id } }
    );

    res.json({
      code: 200,
      id,
      start,
      email,
    });
  } catch (err) {
    console.error(err);
  }
});

router.delete("/download", async (req, res, next) => {
  try {
    const id = req.query.id;
    const email = req.query.email;
    if (!email) {
      req.json({
        code: 500,
        message: "email이 없습니다.",
      });
    }
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      res.status(202).json({
        code: 202,
        message: "유저가 존재하지 않습니다.",
      });
    }

    await UserPlans.destroy({
      where: {
        UserId: exUser.id,
        PlanSummaryId: id,
      },
      limit: 1,
    })
      .then((result) => {
        return res.json({
          code: 200,
          success: true,
          message: "정상적으로 삭제되었습니다.",
        });
      })
      .catch((err) => {
        return res.status(202).json({
          code: 202,
          success: false,
          message: "실패하였습니다.",
        });
      });
  } catch (err) {
    console.error(err);
  }
});

router.get("/download", async (req, res, next) => {
  const email = req.query.email;
  const id = req.query.id;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      res.status(202).json({
        code: 202,
        message: "유저가 존재하지 않습니다.",
      });
    }
    const exist = await UserPlans.findOne({
      where: { UserId: exUser.id, PlanSummaryId: id },
    });
    if (!exist) {
      res.json({
        code: 200,
        downloaded: false,
      });
    }
    res.json({
      code: 200,
      downloaded: true,
      start: exist.startdate,
    });
  } catch (err) {
    console.error(err);
  }
});

router.get("/render", async (req, res, next) => {
  const email = req.query.email;
  let data = [];
  try {
    const exUser = await User.findOne({ where: { email } });
    const downloaded = await UserPlans.findAll({
      where: { UserId: exUser.id },
    });
    let path;
    let plan;
    let summary;
    for (let elem of downloaded) {
      summary = await PlanSummary.findOne({
        where: { id: elem.PlanSummaryId },
      });

      path = `public/plans/${elem.PlanSummaryId}.json`;
      if (fs.existsSync(path)) {
        plan = JSON.parse(fs.readFileSync(path));
        data.push({
          start: elem.startdate,
          summary: summary,
          plan: plan,
        });
      }
    }
    res.json({
      code: 200,
      data,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
