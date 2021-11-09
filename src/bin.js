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

const url = 'https://yeti-cms.dev/api';
const token = '2b0c615afb1b72cf093a5fa6d48c7ef1';

fetchData(url, token)
    .then(res => console.log(res))
    .catch((e) => {
        console.log(e);
    });