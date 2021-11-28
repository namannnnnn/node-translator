# Introduction

I've made a backend server which uses googles's translator api to translate text while smart-caching our outputs for better efficiency.

# Design decisions

Here I've created a NodeJS based backend working with ejs as views engine and for database I've used PostgreSQL. I'm using NodeJs as the backend script because it is ligtweight and has modules which can be easily imported and learnt. I've used EJS views as my frontend because my main focus was on the backend and just wanted to show my results being rendered. I've used PostgreSQL for my database as it supports complex structures and a breadth of built-in and user-defined data types.

# Insight to the project

I've used PostgreSQL queries to post and get information from database and the google-translator api to translate the text. While I've used worker module of node to run a thread parallely to store the translation of other languages without affecting the time of the API call.

Logic : 

    if(databse has such translation){
        it will fetch the data
    }
    else{
        it will post the translation in the required language by user
        now another thread is being used parallely so that we can save the text that needs to be translated in all languages to increase efficiency of the code.
    }



# Installing dependencies

npm i axios

npm i bootstrap

npm i ejs

npm i fs

npm i jest

npm i path

npm i pg

npm i qs

npm i @vitalets/google-translate-api


# Running the project

node app.js

# Running the tests

npm run test

--> This testing was done using JEST

test 1: to check if it can translate
test 2: to check if our time has been minimised after smartly caching rather than calling the api




