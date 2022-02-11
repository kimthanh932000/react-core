const fetch = require('./index');
const fs = require('fs');
const path = require('path');

const createDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const writeDataToFile = async (data) => {

    const dataPath = path.resolve(__dirname, `../src/data`);

    createDir(dataPath);

    let files = [];
    const promises = [];

    data.forEach(data => {
        if (data.key === 'resources') {
            files = data.data;
        }
        promises.push(new Promise((resolve, reject) => {
            fs.writeFile(`${dataPath}/${data.key}.json`, JSON.stringify(data, null, 2), err => {
                if (!err) {
                    if (data.data.length) {
                        console.log(`--Saving ${data.key} successfully.`);
                    }
                    resolve();
                }
                reject(err);
            })
        }));
    });

    try {
        Promise.all(promises).then(() => console.log('--Done!'));
    } catch(e) {
        throw e;
    }
};

fetch('https://yeti-cms.dev/api', '2b0c615afb1b72cf093a5fa6d48c7ef1', ['articles', 'pages', 'topics'])
    .then((res) => writeDataToFile(res))
.catch(e => {
    throw new Error('Network error!');
});