const fs = require('fs');
const qs = require('qs');
const { performance } = require('perf_hooks');
const axios = require('axios');


const translate_text = (queryString ) => {
    const data = qs.stringify({
        'text': queryString,
        'language': 'hi'
    });
    
    const config = {
        method: 'post',
        url: 'http://localhost:5001/',
        headers: {
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'Upgrade-Insecure-Requests': '1',
            'Origin': 'http://localhost:5001',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Referer': 'http://localhost:5001/',
            'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cookie': '_ga=GA1.1.1707156634.1636957483'
        },
        data: data
    };

    const response =  axios(config)
    let output = JSON.stringify(response.data)
    return output;
}

// results -> good_morning.txt

describe("POST /", () => {
    describe("Simple translation", () => {
        const expectedText =  fs.readFile('./expectedResults/good_morning.txt','utf-8',function(err,res){});
        test("Test send good morning text", () => {
            const output = translate_text('good+morning');
            expect(output).toBe(expectedText)
        })
        
    });

    describe("Checking if time has been reduced after caching", () => {
        // Make Regular call
        test("Test send good evening text", () => {
            const startTimeOne = performance.now();
            const expectedText =  fs.readFile('./expectedResults/good_evening_gujarati.txt','utf-8',function(err,res){});
            const output = translate_text('good+evening');
            const endTimeOne = performance.now();

            const apiTime = endTimeOne - startTimeOne;

            const startTimeTwo = performance.now();
            //Below is the file output for hindi text translation
            const expectedTextt =  fs.readFile('./expectedResults/good_evening_hindi.txt','utf-8',function(err,res){});
            const outputt = translate_text('good+evening');
            const endTimeTwo = performance.now();

            const callAfterCacheTime = endTimeTwo - startTimeTwo;

            //This means now all the other translations are being saved parallely and for the second time when we want to translate it into any other language it direct;y gets it from database
            expect(apiTime).toBeGreaterThan(callAfterCacheTime);
        });
        // Make Same call again
        // test("Test send good evening text", () => {
        //     const startTime = performance.now();
        //     const expectedText =  fs.readFile('good_evening.txt','utf-8',function(err,res){});
        //     const output = translate_text('good+evening');
        //     expect(output).toBe(expectedText);
        //     const endTime = performance.now();
        //     console.log(endTime-startTime);
        //     expect(endTime-startTime).toBeLessThan(EXPECTED_CACHED_API_CALL_TIME);
        // });
    });
    
})




//s1=time.timestart, make call, expect,s2 = time.timeend
//s3=time.timestart, make call, expect,s4 = time.timeend