const fs = require('fs');
const Query = require('./queries/index');
const axios = require('axios');
const path = require('path');

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
    const res = await api.post('/', {query: Query.pageInfo});
    return res.data.data;
}

const getPromises = async (api, pageInfo) => {
    const promises = {
        articles: [],
        posts: [],
        topics: [],
        pages: [],
        authors: [],
        featured: [],
        constants: []
    };

    const keys = Object.keys(promises);

    keys.forEach(key => {
        let page = 1;

        if (['articles', 'posts', 'topics', 'pages', 'authors'].includes(key)) {
            while (page <= pageInfo[key].paginatorInfo.lastPage) {
                promises[key].push(api.post('/', {query: Query[key], variables: {'page': page}}));
                page++;
            }
        } else {
            promises[key].push(api.post('/', {query: Query[key]}));
        }
    })

    return promises;
}

const fetchData = async (promises) => {
    let data = [];
    const keys = Object.keys(promises);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let data = await Promise.all(promises[key])
            .then((results) => {
                let items = [];

                results.forEach(result => {
                    items = ['articles', 'posts', 'topics', 'pages', 'authors'].includes(key) ? [...items, ...result.data.data[key].data] : result.data.data[key]
                })

                if (['authors', 'topics', 'featured', 'posts'].includes(key)) {
                    items = formatData(items, key)
                }
                return items;
            })
            .catch(err => {
                console.log(err);
            })
        data.push({key, data});
    }
    return data;
}

const formatData = (items, type) => {
    const regex = /^(.*?)@0*/;
    let data = null;

    switch (type) {
        case 'topics':
            data = items.map(item => ({...item, related: item.related.map(postId => postId.replace(regex, ''))}))
            break;
        case 'authors':
            data = items.map(item => ({...item, latest: item.latest.map(postId => postId.replace(regex, ''))}))
            break;
        case 'featured':
            data = {...items, author: items.author.replace(regex, ''), topic: items.topic.replace(regex, '')};
            break;
        case 'posts':
            data = items.map(item => ({
                ...item, ...{
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

module.exports = async function (gatewayUrl, gatewayToken) {
    console.log('--Fetching data...');
    try {
        const api = getAxiosInstance(gatewayUrl, gatewayToken);

        const pageInfo = await getPageInfo(api);

        const promises = await getPromises(api, pageInfo);

        const results = await fetchData(promises);

        return results;

    } catch (err) {
        throw err;
    }
}