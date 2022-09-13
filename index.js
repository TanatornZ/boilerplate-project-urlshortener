require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var bodyParser = require("body-parser");
var validUrl = require("valid-url");
const mongoose = require("mongoose");
const shortid = require("shortid");

const mongoURL =
  "mongodb+srv://bank2545:bank2545@shorturl.jc5hdtn.mongodb.net/?retryWrites=true&w=majority";

// database connection
mongoose.connect(mongoURL, { useNewUrlParser: true });

// Schema
let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number,
});

let URL = mongoose.model("Url", urlSchema);
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.post(
  "/api/shorturl/new",
  bodyParser.urlencoded({ extended: false }),
  async function (req, res) {
    // get data from body html
    const url = req.body["url"];
    const urlCode = randomIntFromInterval(1, 100);

    if (!validUrl.isUri(url)) {
      res.status(401).json({ error: "invalid URL" });
    } else {
      try {
        let find = await URL.findOne({ original: url });
        if (find) {
          res.json({ original: findOne.original, short: find.short });
        } else {
          find = new URL({ original: url, short: urlCode });
        }
        await find.save();
        res.json({ original: find.original, short: find.short });
      } catch (err) {
        console.error(err);
      }
    }
  }
);

app.get("/api/shorturl/:short_url?", async function (req, res) {
  try {
    const urlParams = await URL.findOne({
      short: req.params.short_url,
    });

    if (urlParams) {
      return res.redirect(urlParams.original);
    } else {
      return res.status(404).json("NO URL found");
    }
  } catch (err) {
    console.error(err);
  }
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
