'use strict'

const { stringify } = require('qs');
const originalFetch = require('isomorphic-fetch');
const fetch = require('fetch-retry')(originalFetch, {
	retryOn: [422],
	retries: 5,
	retryDelay: function (attempt, error, response) {
		return Math.pow(2, attempt) * 1000; // 1000, 2000, 4000
	}
});

// This code is mostly obtained from https://github.com/derhuerst/epsg-index

const endpoint = 'https://epsg.io/'
const userAgent = 'https://mete.dev'

const request = (query) => {
	query = Object.assign({ format: 'json' }, query)

	return fetch(endpoint + '?' + stringify(query), {
		mode: 'cors', redirect: 'follow',
		headers: { 'User-Agent': userAgent }
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.json()
	})
}

module.exports = request
