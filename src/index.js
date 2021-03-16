const https = require("https");
const express = require("express");
const Datastore = require('nedb');
const { resolve } = require("path");
require('dotenv').config()

const app = express();
// const X_RAPID_API_KEY = process.env.X_RAPID_API_KEY
port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening at ${port}`));
app.use(express.static("public"));
app.use(express.json({ limit: '1mb' }));
// console.log(process.env)

const database = new Datastore('database.db');
database.loadDatabase();

var cachedChunks = {}
// runs faster than slow_function by using cache functions
function memoize(slow_function) {

    function fast_function(input) {

        return new Promise((resolve, reject) => {
            // 1.Cache the result of slow_function using the caching functions.
            if (!cachedChunks[input]) {
                slow_function(input)
                    .then((value) => {
                        // 3. Update the cache in either scenario
                        cache_store(input, value)
                        resolve(value)
                    })
                    .catch((e) => {
                        reject(e)
                    })
            }

            // 2. Return the fastest:
            else {
                const promiseCached = cache_retrieve(input)
                const promiseFresh = slow_function(input)
                    .then((value) => {
                        // 3. Update the cache in either scenario
                        cache_store(input, value)
                    })
                    .catch((e) => {
                        reject(e)
                    })

                Promise.race([promiseCached, promiseFresh])
                    .then((value) => {
                        resolve(value)
                    })
                    .catch((e) => {
                        reject(e)
                    })
            }

        })
    }
    return fast_function;
}

// // stores data (value) by key
async function cache_store(key, value) {
    cachedChunks[key] = value;
}

// // retrieves data by key (if it exists) 
async function cache_retrieve(key) {
    return cachedChunks[key];
}

// fetches data from a slow data source 
function slow_function(input) {

    return new Promise((resolve, reject) => {

        const options = {
            "method": "GET",
            "hostname": "mashvisor-api.p.rapidapi.com",
            "port": null,
            "path": input,
            "headers": {
                "x-rapidapi-key": "73c88b652dmsh50c98cdc792e212p130dcfjsna7e2d23f2abb",
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

// This endpoint retrieves the cities has the biggest occupancy in a specific state.
app.get("/biggestOccupancyByState/:state", async (req, res) => {

    const state = req.params.state
    const timestamp = Date.now()
    reqData = { state, timestamp }
    database.insert(reqData)
    console.log(reqData);
    const input = `/city/list?state=${state}&page=1&items=10`

    // // PROBLEM!!! slow API response
    // const value = await slow_function(input)
    // res.send(value)

    // SOLUTION
    const fast_function = memoize(slow_function)
    try {
        const value = await fast_function(input)
        // console.log(`before sending ${value}`) 
        res.send(value)
    } catch {
        res.status(503).send({ 'error': 'Server unavailable' })
    }
});

