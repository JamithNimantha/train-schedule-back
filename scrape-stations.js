const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const db = require('./config/keys').mongoTestURI;
const Station = require('./model/Station');
const Promise = require('bluebird');

mongoose.Promise = Promise;

mongoose
    .connect(
        db,
        {
            useNewUrlParser: true,
            useCreateIndex: true
        })
    .then(() => {
        console.log("MongoTest DB Connected !!!");
        scrapeData();

    })
    .catch((err) => {
        console.log(err)
    });


function scrapeData() {
    const options = {
        url: 'https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en',
        method: 'GET',
        headers: {
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'eservices.railway.gov.lk',
            'Origin': 'https://eservices.railway.gov.lk',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
        }
    };

    request(options, (err, res, body) => {
        addDb(body);
    });

    async function addDb(body) {
        const $ = cheerio.load(body);

        for (let i = 2; i <= 408; i++) {
            const stationId = $('#startStation > option:nth-child(' + i + ')')[0].attribs.value;
            console.log(stationId);
            const stationName = $('#startStation > option:nth-child(' + i + ')')[0].children[0].data;
            console.log(stationName);

            const newStation = new Station({
                _id: stationId,
                name: stationName
            });

            await newStation.save()
                .then(data =>
                    console.log(data)
                )
                .catch(err =>
                    console.log(err)
                );
        }
    }
}
