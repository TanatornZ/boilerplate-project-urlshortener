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
  original_url: { type: String, required: true },
  short_url: String,
});

let URL = new mongoose.model("Url", urlSchema);

app.post(
  "/api/shorturl",
  bodyParser.urlencoded({ extended: false }),
  async function (req, res) {
    // get data from body html
    const url = req.body["url"];
    const urlCode = shortid.generate();

    console.log(urlCode);
    if (url == "http://www.example.com") {
      res.json({ error: "invalid url" });
    }

    if (!validUrl.isUri(url)) {
      res.status(401).json({ error: "invalid URL" });
    } else {
      try {
        let find = await URL.findOne({ original_url: url });
        if (find) {
          res.json({
            original_url: find.original_url,
            short_url: find.short_url,
          });
        } else {
          find = new URL({ original_url: url, short_url: urlCode });
        }
        await find.save();
        res.json({ original_url: find.original_url, short_url: find.short_url });
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
      return res.redirect(urlParams.original_url);
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
