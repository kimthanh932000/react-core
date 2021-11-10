require('dotenv').config();
const fetchData = require('./index');
const fs = require('fs');
const path = require('path');

const writeDataToFile = (data, dir) => {
    const des = path.resolve(__dirname, dir);

    if (!fs.existsSync(des)) {
        fs.mkdirSync(des);
    }

    data.forEach(data => {
        console.log(`--Writing ${data.key} to file...`);
        fs.writeFile(`${des}/${data.key}.json`, JSON.stringify(data, null, 2), err => {
            if (err) {
                console.log(err);
            }
        });
    });
};

fetchData(process.env.GATEWAY_URL, process.env.GATEWAY_TOKEN)
    .then(res => {
        writeDataToFile(res, '../src/data');
    })
    .catch((e) => {
        console.log('Network error!');
    });