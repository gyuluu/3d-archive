const db = require("./utils/db");
const express = require("express");
const app = express();
const s3 = require("./s3");
const config = require("./config");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2897152
    }
});

app.use(express.static("public"));
app.use(express.json());

app.get("/images", (req, res) => {
    db.getImages().then(result => {
        res.json(result);
    });
});

app.get("/moreimages/:id", (req, res) => {
    db.getMoreImages(req.params.id).then(result => {
        res.json(result);
    });
});

app.get("/image/:id", (req, res) => {
    db.getImage(req.params.id)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("err", err);
        });
});

app.get("/comments/:id", (req, res) => {
    db.getComments(req.params.id).then(result => {
        res.json(result);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { filename } = req.file;
    const url = config.s3Url + filename;
    const { title, username, description } = req.body;
    db.insertImages(url, username, title, description)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("uploading error", err);
        });
});

app.post("/comment", (req, res) => {
    const { comment, username, id } = req.body;
    db.insertComment(comment, username, id)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("uploading error", err);
        });
});

app.listen(8080, () => console.log("My image board server is Up!"));
