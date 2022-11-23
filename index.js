'use strict'

const createQueue = require('queue')
const pick = require('lodash.pick')
const fs = require('fs')
const bboxPolygon = require('@turf/bbox-polygon').default
const req = require('./request')

const getNrOfPages = () => {
	return req({ q: '' })
		.then(data => Math.ceil(data.number_result / data.results.length))
}

const fetchAll = (nrOfPages) => {
	return new Promise((yay, nay) => {
		const queue = createQueue({ concurrency: 8, autostart: true })
		let results = []

		const fetch = (i) => {
			const job = (cb) => {
				req({ q: '', page: i })
					.then((data) => {
						results = results.concat(data.results)
						cb()
					})
					.catch(cb)
			}

			job.title = i + ''
			return job
		}

		queue.once('error', (err) => {
			queue.stop()
			nay(err)
		})
		queue.once('end', (err) => {
			if (!err) yay(results)
		})
		queue.on('success', (_, job) => {
			console.error(job.title + '/' + nrOfPages)
		})

		for (let i = 1; i <= nrOfPages; i++) {
			queue.push(fetch(i))
		}
	})
}

const parseResult = (res) => {
	return Object.assign(pick(res, [
		'code'
	]), {
		proj4: res.proj4 || null,
		bbox: res.bbox ? [res.bbox[1], res.bbox[2], res.bbox[3], res.bbox[0]] : null
	})
}

const storeAll = (index) => {
	return new Promise((yay, nay) => {
		const all = index.reduce((all, result) => {
			if (result.bbox == null)
				console.log(`Skipping ${result.code}`);
			else
			{
				const polygon = bboxPolygon(result.bbox)
				delete result.bbox
				result.geometry = polygon.geometry
				all[result.code] = result
			}				
			return all
		}, {})

		fs.writeFile('projections.json', JSON.stringify(all), (err) => {
			if (err) nay(err)
			else yay()
		})
	})
}

getNrOfPages()
	.then(fetchAll)
	.then((results) => {
		const index = results.map(parseResult)
		return storeAll(index)
	})
	.catch(console.error)
