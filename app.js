import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import translate from "@vitalets/google-translate-api";
import pg from "pg";

import { Worker } from "worker_threads";

const threads = new Set();

const port = 5001;

//setting up my db in PostgreSQL
const Client = pg.Client;

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "1234",
  port: 5432,
});

//Connecting to client
client.connect();

//clearing all data if any exists and then creating another table so that results are more clear and there aren't already translations
client.query(
  "DROP TABLE IF EXISTS translations",
  (err, res) => {
    console.log(err, res);
  }
);

//creating table in pgsql
client.query(
  "CREATE TABLE IF NOT EXISTS translations (id SERIAL PRIMARY KEY,text_to_translate TEXT NOT NULL, text_translated TEXT NOT NULL,text_translated_language TEXT NOT NULL)",
  (err, res) => {
    console.log(err, res);
  }
);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Getting basic ejs file and renedering it
app.get("/", (req, res) => {
  return res.render("index.ejs", {
    title: "Text Translator",
    translatedText: "",
    text: "",
    language: "",
  });
});

//Posting data to db and rendering it
app.post("/", (req, res) => {
  client.query(
    "SELECT text_translated FROM translations WHERE (text_to_translate = $1) AND (text_translated_language  = $2)",
    [req.body.text, req.body.language],
    (err, translation) => {
      if (err) {
        console.log("Error", err);
        return res.status(500).send(" Internal Server Error :(");
      }

      if (translation.rows.length === 0) {
        translate(req.body.text, { to: req.body.language })
          .then((textResponse) => {
            client.query(
              "INSERT INTO translations(text_to_translate, text_translated,text_translated_language )VALUES($1,$2,$3)",
              [req.body.text, textResponse.text, req.body.language],
              (err) => {
                if (err) {
                  console.log("Error", err);
                  return res
                    .status(500)
                    .send(" Internal Server Error from Client Query");
                } else {
                  return res.render("index.ejs", {
                    title: "Text Translator",
                    translatedText: textResponse.text,
                  });
                }
              }
            );
          })
          .catch((err) => {
            console.log("Error", err);
            return res
              .status(500)
              .send(" Internal Server Error in Translate function");
          });
      } else {
        console.log(translation.rows[0].text_translated);
        return res.render("index.ejs", {
          title: "Text Translator",
          translatedText: translation.rows[0].text_translated,
          language: req.body.language,
          text: req.body.text,
        });
      }
    }
  );

  let str = req.body.text;
  let str2 = req.body.language;

  //threads were used to cache smartly in a parallel way
  threads.add(
    new Worker("./workerF.js", {
      workerData: { textss: str, languaged: req.body.language },
    })
  );
  for (let worker of threads) {
    worker.on("error", (err) => {
      throw err;
    });
    worker.on("exit", () => {
      threads.delete(worker);
      console.log(`Thread exiting, ${threads.size} running...`);
    });
  }
});

app.listen(port, (err) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log(`Server running on port: ${port}`);
  }
});

export default app;