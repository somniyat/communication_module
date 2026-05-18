const axios = require('axios');

function buildClient({ baseURL, headers = {}, timeoutMs = 15000 } = {}) {
  return axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json', ...headers },
    timeout: timeoutMs,
  });
}

async function callApi({ url, method = 'GET', headers = {}, data, params, timeoutMs = 15000 }) {
  if (!url) throw new Error('callApi: url is required');
  const res = await axios.request({
    url,
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    data,
    params,
    timeout: timeoutMs,
  });
  return res.data;
}

module.exports = { buildClient, callApi };
