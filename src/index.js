const https = require("https");
const express = require("express");
const Datastore = require('nedb');
const { resolve } = require("path");

const app = express();
// const X_RAPID_API_KEY = process.env.X_RAPID_API_KEY
port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening at ${port}`));
app.use(express.static("public"));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

// // runs faster than slow_function by using cache functions
// function memoize(slow_function) {

//     // 1.Cache the result of slow_function using the caching functions.
//     if (cachedChunks.indexOf(input)) {
//         //2.1 
//         const value = slow_function(input)
//         cache_store(input, value)
//         return value
//     } else {
        
//     }
    

//     if key()

//     res.on('data', function (chunk) {
//         cachedChunks.push(chunk);
//     });

//     res.on('end', function () {
//         const body = Buffer.concat(chunks);
//         resData = body.toString()
//         resolve(resData)

//     })

//     return fast_function;
// }

// const cachedChunks = [];
// // // stores data (value) by key
// async function cache_store(key, value) {
//     cachedChunks.push({'key': key, 'value': value})
// }

// // // retrieves data by key (if it exists) 
// // async function cache_retrieve(key) {
// // }

// fetches data from a slow data source 
async function slow_function(input) {

    return new Promise((resolve, reject) => {

        const options = {
            "method": "GET",
            "hostname": "mashvisor-api.p.rapidapi.com",
            "port": null,
            "path": input,
            "headers": {
                "x-rapidapi-key": "",
                "x-rapidapi-host": "mashvisor-api.p.rapidapi.com",
                "useQueryString": true
            }
        };

        const req = https.request(options, (res) => {

            const chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const body = Buffer.concat(chunks);
                resData = body.toString()
                resolve(resData)

            })

            res.on('err', (e) => {
                reject(e)
            })
        });

        req.end()

    })
}

app.get("/historicalPerformance/:state", async (req, res) => {
    const state = req.params.state
    const timestamp = Date.now()
    reqData = { state, timestamp }
    database.insert(reqData)
    console.log(reqData);
    const input = `/city/list?state=${state}&page=1&items=10`

    // PROBLEM!!! slow API response
    const resData = await slow_function(input)

    // SOLUTION In-Memory cache
    //  fast_function = memoize(slow_function)
    //  const resData = fast_function(input)

    res.send(resData)

});

