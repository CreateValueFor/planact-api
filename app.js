const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const cors = require("cors");

const whitelist = ["https://layout.planact/co.kr", "*"];

dotenv.config();
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});
const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const planRouter = require("./routes/plan");
const inquiryRouter = require("./routes/inquiry");

const { sequelize } = require("./models");
const passportConfig = require("./passport");
const logger = require("./logger");

const app = express();
app.use(cors());

passportConfig();
app.set("port", process.env.PORT || 8000);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combine"));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  // store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true;
}
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use("/plan", planRouter);
app.use("/inquiry", inquiryRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router does not exist`);
  error.status = 404;

  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
