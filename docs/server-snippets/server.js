import express from "express";

const app = express();
app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(30000, () => {
  console.log("this is my server http://localhost:30000");
});