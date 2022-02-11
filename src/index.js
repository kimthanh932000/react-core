const Query = require('./queries/index');
const axios = require('axios');
const masterDataListOptions = ['articles', 'posts', 'topics', 'pages', 'authors', 'constants', 'featured', 'resources'];

const getAxiosInstance = (gatewayUrl, gatewayToken) => {
    if (!gatewayUrl) {
        throw new Error('Gateway URL is not configured.');
    }
    const api = axios.create({
        baseURL: gatewayUrl
    })
    api.interceptors.request.use(
        config => {
            config.headers['Authorization'] = 'Bearer ' + gatewayToken;
            return config;
        }
    )
    return api;
}

const getPageInfo = async (api) => {
    const res = await api.post('/', { query: Query.pageInfo });
    return res.data.data;
}

const getPromises = async (api, pageInfo, options = []) => {
    const promises = {};
    if(!options.length) {
        options = masterDataListOptions;
    }
    options.forEach(option => promises[option] = []);

    const keys = Object.keys(promises);

    if(keys.length) {
        keys.forEach(key => {
            let page = 1;

            if (['articles', 'posts', 'topics', 'pages', 'authors'].includes(key)) {
                while (page <= pageInfo[key].paginatorInfo.lastPage) {
                    promises[key].push(api.post('/', { query: Query[key], variables: { 'page': page } }));
                    page++;
                }
            } else {
                promises[key].push(api.post('/', { query: Query[key] }));
            }
        })
    }

    if(options.length !== masterDataListOptions.length) {
        const optionForEmptyData = masterDataListOptions.filter(opt => !options.includes(opt));
        optionForEmptyData.forEach(x => {
            promises[x] = [];
        });
    }

    return promises;
}

const fetchData = async (promises) => {
    let results = [];
    const keys = Object.keys(promises);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let data = await Promise.all(promises[key])
            .then((results) => {
                let items = [];

                if(!results || !results.length) {
                    return items;
                } else {
                    results.forEach(result => {
                        items = ['articles', 'posts', 'topics', 'pages', 'authors'].includes(key) ? [...items, ...result?.data?.data[key]?.data || []] : result?.data?.data[key] || [];
                    })

                    if (['authors', 'topics', 'featured', 'posts'].includes(key)) {
                        items = formatData(items, key);
                    }
                }
                return items;
            });
        results.push({key, data});
    }
    return results;
}

const formatData = (items, type) => {
    const regex = /^(.*?)@0*/;
    let data = null;

    switch (type) {
        case 'topics':
            data = items.map(item => ({ ...item, related: item.related.map(postId => postId.replace(regex, '')) }))
            break;
        case 'authors':
            data = items.map(item => ({ ...item, latest: item.latest.map(postId => postId.replace(regex, '')) }))
            break;
        case 'featured':
            data = {
                ...items,
                author: items.author.replace(regex, ''),
                topic: items.topic.replace(regex, '')
            };
            break;
        case 'posts':
            data = items.map(item => ({
                ...item,
                ...{
                    topic: item.topic.replace(regex, ''),
                    author: item.author.replace(regex, '')
                }
            }));
            break;
        default:
            break
    }
    return data;
}

module.exports = async function (gatewayUrl, gatewayToken, options = []) {
    console.log('--Fetching data...');
    try {
        const api = getAxiosInstance(gatewayUrl, gatewayToken);

        return await getPageInfo(api)
            .then(pageInfo => getPromises(api, pageInfo, options))
            .then(promises => fetchData(promises));
    } catch (err) {
        throw err;
    }
}