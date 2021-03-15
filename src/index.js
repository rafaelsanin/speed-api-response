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

var cachedChunks = {}
// runs faster than slow_function by using cache functions
function memoize(slow_function) {

    // console.log(typeof(slow_function))

    async function fast_function(input) {

        return new Promise((resolve, reject) => {

            // var cachedChunks = {}
            console.log(input)
            cachedChunks[input] = '9'
            // 1.Cache the result of slow_function using the caching functions.
            if (!cachedChunks[input]) {
                var promiseFresh = new Promise((resolve, reject) => {
                    // const value = slow_function(input)
                    // cache_store(input, value)
                    // resolve(value)
                    setTimeout(() => {
                        resolve('promised1stFresh After 2 secs')
                    }, 3000)
                })

                promiseFresh.then((data) => {
                    console.log(data)
                })
            }

            // 2. Return the fastest:
            else {
                var promiseCached = new Promise((resolve, reject) => {
                    // const value = cache_retrieve(input)
                    // resolve(value)
                    setTimeout(() => {
                        resolve('promiseCached After 3 sec')
                    }, 3000)
                })

                var promiseFresh = new Promise((resolve, reject) => {
                    const value = slow_function(input)
                    resolve(value)

                    // // cache_store(input, value)
                    // // resolve(value)
                    // setTimeout(() => {
                    //     resolve('promiseFresh after 2 secs')
                    // }, 1000)
                })

                Promise.race([promiseCached, promiseFresh]).then((value) => {
                    console.log(`fastest response: ${value}`)
                    cache_store(input, value)
                    console.log(cachedChunks)
                    resolve(value)
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
async function slow_function(input) {

    return new Promise((resolve, reject) => {

        const options = {
            "method": "GET",
            "hostname": "mashvisor-api.p.rapidapi.com",
            "port": null,
            "path": input,
            "headers": {
                "x-rapidapi-key": "a4cb807fdfmshda5b5c2af63a1f8p166619jsn381026d83439",
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

    // // PROBLEM!!! slow API response
    // const value = await slow_function(input)
    // res.send(value)

    // SOLUTION
    const fast_function = memoize(slow_function)
    const value = await fast_function(input)
    console.log(`dinal ${value}`) 
    res.send(value)

});

