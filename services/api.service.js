const { default: axios } = require('axios');
const {
  decompress, gunzip, unpack,
} = require('@mkdierz/json-compressor');
const { baseUrl } = require('../config');

class ApiService {
  static instances = [];

  constructor(serviceUrl) {
    this.baseUrl = baseUrl;
    this.serviceUrl = serviceUrl;
    this.defaultHeaders = {
      'Compressed-Response': 'none',
      'Compressed-Request': 'none',
      Authorization: null,
    };
    ApiService.instances.push(this);
  }

  get headers() {
    return this.defaultHeaders;
  }

  set headers(value) {
    this.defaultHeaders = value;
  }

  static setHeaders({ Authorization, compressedResponse, compressedRequest }) {
    ApiService.instances.map((instance) => {
      const newInstance = instance;
      newInstance.defaultHeaders = {
        Authorization,
        'Compressed-Request': compressedRequest,
        'Compressed-Response': compressedResponse,
      };
      return newInstance;
    });
  }

  async request(method, endpoint, data, customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const compressedResponse = this.defaultHeaders['Compressed-Response'];
    const responseType = (
      (compressedResponse === 'full') || (compressedResponse === 'gzip') ? 'arraybuffer' : false
    );
    const options = {
      method,
      url: `${this.baseUrl}${this.serviceUrl}${endpoint}`,
      data,
      headers,
      ...(responseType && { responseType }),
    };

    try {
      const response = await axios(options);
      switch (response.headers['compressed-response']) {
        case 'full':
          return decompress(response.data, true);

        case 'hpack':
          return unpack(response.data);

        case 'gzip':
          return JSON.parse(gunzip(response.data, true));

        default:
          return response.data;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async get(endpoint, customHeaders = {}) {
    return this.request('GET', endpoint, null, customHeaders);
  }

  async post(endpoint, data, customHeaders = {}) {
    return this.request('POST', endpoint, data, customHeaders);
  }

  async put(endpoint, data, customHeaders = {}) {
    return this.request('PUT', endpoint, data, customHeaders);
  }

  async delete(endpoint, customHeaders = {}) {
    return this.request('DELETE', endpoint, null, customHeaders);
  }
}
module.exports = { ApiService };
