const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const db = require('./config/keys').mongoTestURI;
const Route = require('./model/Route');
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
        beginScrape();

    })
    .catch((err) => {
        console.log(err)
    });

async function beginScrape() {
    let stationArr = new Array(5)
        .join().split(',')
        .map(function (item, index) { return ++index; });

    let stat = [...stationArr];

    for (let i = 0; i < stationArr.length; i++) {
        const startStation = stationArr[i];

        for (let j = 0; j < stat.length; j++) {
            const endStation = stat[j];
            console.log(startStation, endStation);
            await getRequest(startStation, endStation);

        }
    }
}

function getRequest(startStation, endStation) {
    const options = {
        url: 'https://eservices.railway.gov.lk/schedule/searchTrain.action?lang=en',
        method: 'POST',
        headers: {
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'eservices.railway.gov.lk',
            'Origin': 'https://eservices.railway.gov.lk',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
        },
        form: {
            'selectedLocale': 'en',
            'searchCriteria.startStationID': startStation,
            'searchCriteria.endStationID': endStation,
            'searchCriteria.startTime': '-1',
            'searchCriteria.endTime': '-1',
            'searchDate': '13/07/2019'
        }
    };
    let promise = new Promise(function(resolve, reject) {
        request(options, (err, res, body)=> {
            if (!err && res && res.statusCode == 200) {
                let count = 1;
                const $ = cheerio.load(body);
                let totalDistance = 0;
                try {
                    totalDistance = $('#es-content > div.hero-unit > table > tbody > tr:nth-child(3) > td')[0].children[1].next.data.replace(/\s+/, '');
                    console.log("TOTAL_DISTANCE : " + totalDistance);
                } catch (e) {
                    console.log("NO TRAINS AVIALABLE");
                    return promise;
                }
        
                const secondClass = $('#es-content > div.hero-unit > table > tbody > tr:nth-child(1) > td:nth-child(2)')[0].children[0].data.replace(/\s+/, '');
                console.log("SECOND_CLASS : " + secondClass);
        
                const thirdClass = $('#es-content > div.hero-unit > table > tbody > tr:nth-child(2) > td:nth-child(2)')[0].children[0].data.replace(/\s+/, '');
                console.log("THIRD_CLASS : " + thirdClass);
        
                const newRoute = new Route({
                    startStation: startStation,
                    endStation: endStation,
                    distance: totalDistance,
                    secondClassPrice: secondClass,
                    thirdClassPrice: thirdClass
                });
        
                newRoute.save()
                .then(data => {
                    const availableTrains = $('#es-content > div:nth-child(3) > div > strong')[0].children[0].data.replace(/[^0-9]+/g, "")
                let i = 1;
                let trains = Number(availableTrains) * 3;
                for (i; i < trains; i += 3) {
                    console.log(count++);
                    console.log(i);
        
                    try {
                        let yourStation = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(1)')[0].children[0].data;
                        console.log("Your Station : " + yourStation);
                    } catch (e) {
                        console.log("NO Direct TRAINS AVIALABLE : WARNING FIX THIS ISSUED");
                        return;
                    }
                    let arrivalTime = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(2)')[0].children[0].children[0].data;
                    console.log("Arrival Time : " + arrivalTime);
        
                    let departureTime = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(3)')[0].children[0].children[0].data;
                    console.log("Departure Time	: " + departureTime);
        
        
                    const destinationTime = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(4)')[0].children[0].data;
                    let splited = destinationTime.split('\n\t\t\t\t\t\t\t\t\t\t\t');
                    const destination = splited[0];
                    console.log("Destination : " + destination);
                    const timeOfDestination = splited[1].replace(/\s+/, '');
                    console.log("Destination Time : " + timeOfDestination);
        
        
        
                    const EndStationTime = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(5)')[0].children[0].data;
                    splited = EndStationTime.split('\n\t\t\t\t\t\t\t\t\t\t\t');
                    const endStation = splited[0];
                    const timeOfEndStation = splited[1].replace(/\s+/, '');
                    console.log("End Station : " + endStation);
                    console.log("End Station Time : " + timeOfEndStation);
        
                    const frequency = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(6)')[0].children[0].data;
                    console.log("Frequency	: " + frequency);
        
                    let trainName;
                    try {
                        // $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(4) > td:nth-child(7)')[0].children[0].data;
                        trainName = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(7)')[0].children[0].data;
                    } catch (e) {
                        trainName = "";
                    }
                    console.log("Train Name	: " + trainName);
        
                    const trainType = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + i + ') > td:nth-child(8)')[0].children[0].data;
                    console.log("Train Type	: " + trainType);
        
                    const trainNumber = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3)')[0].children[0].next.data.replace(/\s+/, '');
                    console.log("Train Number : " + trainNumber);
        
                    const avialableClasses = $('#es-content > div:nth-child(6) > div > div > table > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1)')[0].children[0].next.next.data.replace(/[^0-9]+/g, "").split('');
                    console.log("Avialable Classes	: " + avialableClasses);
                }
                resolve('now');
                })
                .catch(err => console.log(err));
                
            } else {
                console.log("Error Occured !!!");
            }
        });
      });
    return promise;
    
}


  
async function run(err, res, body){
    

}