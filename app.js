// external imports
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");

// internal imports
const loginRouter = require("./router/loginRouter");
const usersRouter = require("./router/usersRouter");
const inboxRouter = require("./router/inboxRouter");

// internal imports
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/common/errorHandler");

const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
const io = require("socket.io")(server);
global.io = io;

// set comment as app locals
app.locals.moment = moment;

// MongoDB collection schema and model
const PeopleSchema = new mongoose.Schema({
  role: String,
  name: String,
  email: String,
  mobile: String,
  avatar: String,
  password: String,
});

const People = mongoose.model("people", PeopleSchema);

// database connection and initialization
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.MONGO_DB_NAME, // dynamically set database name from .env
  })
  .then(() => {
    console.log("database connection successful!");
    initializeDatabase(); // Call initialization function after successful connection
  })
  .catch((err) => console.log(err));

async function initializeDatabase() {
  try {
    // Check if the `peoples` collection already has data
    const existingPeople = await People.findOne({ email: "admin@gmail.com" });

    if (!existingPeople) {
      console.log("Initializing database with admin user...");
      // Insert initial admin data
      await People.create({
        role: "admin",
        name: "Iqbal",
        email: "admin@gmail.com",
        mobile: "+8801987878787",
        avatar: "gfgf",
        password: "$2a$10$Qefh/yOgZlXy2hQoEeEKX.1AERn4v8h9QcgwNkFORpDaeuKdbvKlS",
      });
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists. Skipping initialization.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// 404 not found handler
app.use(notFoundHandler);

// common error handler
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`app listening to port ${process.env.PORT}`);
});
