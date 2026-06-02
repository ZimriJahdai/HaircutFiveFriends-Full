 'use strict'

import Client from '../src/client/client.model.js'

const increasePointsForSale = async ({ clientId, saleTotal }) => {
	if (!clientId) return

	const total = Number(saleTotal)
	if (!Number.isFinite(total) || total <= 0) return

	const pointsToAdd = Number((total * 0.1).toFixed(2))
	if (pointsToAdd <= 0) return

	await Client.findByIdAndUpdate(clientId, { $inc: { points: pointsToAdd } })
}

export default increasePointsForSale
