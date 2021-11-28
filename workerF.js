//Function to store the cache for every translation in sql
"use strict";
import { workerData } from "worker_threads";
import pg from "pg";
const Client = pg.Client;
import translate from "@vitalets/google-translate-api";



const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "1234",
  port: 5432,
});

client.connect();

function addAll(textss) {
  var arr = ["en", "gu", "hi", "fr", "es"];


  for (var i in arr) {
    if(arr[i] !== textss.languaged){
    translate(textss.textss, { to: arr[i] })
      .then((textResponse) => {
        client.query(
          "INSERT INTO translations(text_to_translate, text_translated,text_translated_language )VALUES($1,$2,$3)",
          [textss.textss, textResponse.text, arr[i]],
          (err) => {
            if (err) {
              console.log("Error", err);
            } else {
            }
          }
        );
      })
      .catch((err) => {
        console.log("Error", err);
      });
    }
  }
}

addAll(workerData);
