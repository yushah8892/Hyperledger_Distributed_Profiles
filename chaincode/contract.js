'use strict';

const { Contract } = require('fabric-contract-api');

class CertnetContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.ifmprofile-network.certnet');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Certnet Smart Contract Instantiated');
	}

	/**
	 * Create a new entity account on the network
	 * @param ctx - The transaction context object
	 * @param entityId - ID to be used for creating a new Entity account
	 * @param name - Name of the entity
	 * @param email - Email ID of the entity
	 * @returns
	 */
	async createEntity(ctx, entityId, name, amount,channel,partyType,isHighFocus) {
		// Create a new composite key for the new entity account
		const entityKey = ctx.stub.createCompositeKey('org.ifmprofile-network.certnet.entity', [entityId]);



		// Create a entity object to be stored in blockchain
		let newEntityObject = {
			entityId: entityId,
			name: name,
			amount: amount,
			channel:channel,
			partyType:partyType,
			isHighFocus,isHighFocus,
			bank: ctx.clientIdentity.getID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newEntityObject));
		await ctx.stub.putState(entityKey, dataBuffer);
		ctx.stub.setEvent('createEntity', Buffer.from(JSON.stringify(newEntityObject)));

		// Return value of new entity account created to user
		return newEntityObject;
	}

	/**
	 * Get a entity account's details from the blockchain
	 * @param ctx - The transaction context
	 * @param entityId - entity ID for which to fetch details
	 * @returns
	 */
	async getentity(ctx, entityId) {
		// Create the composite key required to fetch record from blockchain
		console.log('entity:', entityId);
		const entityKey = ctx.stub.createCompositeKey('org.ifmprofile-network.certnet.entity', [entityId]);
		console.log('entityKey:', entityKey);

		// Return value of entity account from blockchain
		let entityBuffer = await ctx.stub
			.getState(entityKey)
			.catch(err => console.log(err));
		if (!entityBuffer || entityBuffer.length == 0) {
			throw new Error(`entity with id as:${entityId} does not exist`);
		}

		return JSON.parse(entityBuffer.toString());
	}

	async getAllentity(ctx) {
		const entityStartKey = ctx.stub.createCompositeKey('org.ifmprofile-network.certnet.entity', ['0001']);
		const entityEndKey = ctx.stub.createCompositeKey('org.ifmprofile-network.certnet.entity', ['1000']);

		
		// Return value of entity account from blockchain
	//	const entityKey = ctx.stub.createCompositeKey('');

		let iterator = await ctx.stub
			.getStateByRange(entityStartKey,entityEndKey)
			.catch(err => console.log(err));
			let allResults = [];

			while (true) {
				let res = await iterator.next();
				console.log('res',res)
				if (res.value && res.value.value.toString()) {
				  let jsonRes = {};
				  console.log(res.value.value.toString('utf8'));
			  
				  jsonRes.Key = res.value.key;
				  try {
					jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
				  } catch (err) {
					console.log(err);
					jsonRes.Record = res.value.value.toString('utf8');
				  }
			  
				  allResults.push(jsonRes);
				}
				if (res.done) {
				  console.log('end of data');
				  await iterator.close();
				  console.info(allResults);
				  return JSON.stringify(allResults)
				}
			}
			  

		// if (!entityBuffer || entityBuffer.length == 0) {
		// 	throw new Error(`entity does not exist`);
		// }

	
	}

	
	
}

module.exports = CertnetContract;