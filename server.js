const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const http = require("http").createServer(app);
const PORT = 3030;

// Express App Config
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
// app.use(express.bodyParser({ limit: '50mb' }))

//Old heroku deployment - we no longer put the frontend build file inside public
//Netlify is hosting front and railway host the backend.
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.resolve(__dirname, "public/build")));
// } else {
//   const corsOptions = {
//     origin: [
//       "http://127.0.0.1:5173",
//       "http://localhost:5173",
//       "http://127.0.0.1:3000",
//       "http://localhost:3000",
//     ],
//     credentials: true,
//   };
//   app.use(cors(corsOptions));
// }

let corsOptions = null;
if (process.env.NODE_ENV === "production") {
  corsOptions = {
    origin: ["https://novamusic.netlify.app"],
    credentials: true,
  };
} else {
  corsOptions = {
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
    ],
    credentials: true,
  };
}
app.use(cors(corsOptions));

const authRoutes = require("./api/auth/auth.routes");
const userRoutes = require("./api/user/user.routes");
const roomRoutes = require("./api/room/room.routes");
const { setupSocketAPI } = require("./services/socket.service");

// routes
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
app.all("*", setupAsyncLocalStorage);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
setupSocketAPI(http);

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get("/**", (req, res) => {
  res.sendFile(path.join(__dirname, "public/build", "index.html"));
});

const logger = require("./services/logger.service");
const port = process.env.PORT || PORT;
http.listen(port, () => {
  console.log("Server is running on port: " + port);
  logger.info("Server is running on port: " + port);
});
