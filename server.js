const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
// const tasksRoute = require('./controllers/taskController')
const taskRoutes = require("./routes/tasksRoutes");
const { errorHandler } = require("./middlewares");
const {cron, processBirthdays} = require("./jobs/cronJobs");

const connectDB = require("./db");

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// app.use('/tasks', tasksRoute)
app.use("/", taskRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json("Radhe Radhe");
});




connectDB()
  .then((res) => {
    console.log("Connected");
    app.listen(port, () => {
      console.log(`Server started at ${port}`);
    });

    //Initializing the cron job
    cron;
  })
  .catch((err) => {
    console.log(err);
  });
