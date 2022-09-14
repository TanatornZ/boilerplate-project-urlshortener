require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");
const mongoURL =
  "mongodb+srv://bank2545:bank2545@shorturl.jc5hdtn.mongodb.net/?retryWrites=true&w=majority";

// database connection
mongoose.connect(mongoURL, { useNewUrlParser: true });
console.log("mongoose connection", mongoose.connection.readyState);
let schema = new mongoose.Schema({ url: String });
const Url = mongoose.model("Url", schema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  console.log(req.body.url);
  // get url from body html
  const bodyUrl = req.body.url;

  // check address of bodyUrl
  const someThing = dns.lookup(
    urlparser.parse(bodyUrl).hostname,
    (error, address) => {
      
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        // create row have url field with bodyUrl
        const url = new Url({ url: bodyUrl });
        // save and response
        url.save((err, data) => {
          res.json({ original_url: data.url, short_url: data.id });
        });
      }
      console.log("error", error);
      console.log("address", address);
    }
  );

  console.log("something", someThing);
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;

  // get row from id
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
