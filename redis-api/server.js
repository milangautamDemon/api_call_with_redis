import express from "express";
import redis from "redis";
import { createClient } from "redis";
import axios from "axios";

const app = express();
const PORT = 3000;

//create redis client to connect redis server
let redisClient;
(async () => {
  redisClient = createClient();
  redisClient.on("error", (error) => {
    console.log(error);
  });
  await redisClient.connect();
})();

app.get("/", (req, res) => res.status(200).send("Hello world"));

//api call with redis using axios
app.get("/data", async (req, res) => {
  try {
    let fetchedData;

    //check if data is already cached in redius
    const cachedData = await redisClient.get("data");
    if (cachedData) {
      return res.json({ data: cachedData });
    }

    const rawData = await axios("https://jsonplaceholder.typicode.com/todos");
    fetchedData = await rawData.data;
    console.log(fetchedData);
    await redisClient.set("data", JSON.stringify(fetchedData));
    res.json({ data: fetchedData });
  } catch (error) {
    console.error("error occurs", error);
  }
});

//with out redis
app.get("/calc", (req, res) => {
  try {
    let calcData = 0;
    for (let index = 0; index < 1000000009; index++) {
      calcData += index;
    }
    return res.status(200).send({ data: calcData });
  } catch (error) {
    console.error("error occurs", error);
  }
});

//with out redis
app.get("/calc-with-redis", async (req, res) => {
  try {
    let calcData = 0;

    //check if data is already cached in redius
    const cachedData = await redisClient.get("calcData");
    if (cachedData) {
      return res.json({ data: cachedData });
    }

    for (let index = 0; index < 1000000009; index++) {
      calcData += index;
    }

    //store data in redis
    await redisClient.set("calcData", calcData);
    return res.status(200).send({ data: calcData });
  } catch (error) {
    console.error("error occurs", error);
  }
});

app.listen(PORT, () => console.log("server is running at port: ", PORT));
