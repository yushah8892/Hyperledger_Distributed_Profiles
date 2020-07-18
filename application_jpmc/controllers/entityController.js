// Setting for Hyperledger Fabric
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const SETTING = require('../setting');
const yaml = require('js-yaml');
const fs = require('fs');
const ccpPath = yaml.safeLoad(fs.readFileSync(path.resolve(SETTING.APPL_ROOT_PATH, 'gateway/networkConnection.yaml'), 'utf8'));
const gateway = new Gateway();
class EntityController {


    static async getNetwork() {
        try {
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(SETTING.APPL_ROOT_PATH, '/identity/jpmc');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists('user2@jpmc.ifmprofile-network.com');
            if (!userExists) {
                console.log('An identity for the user "user2" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }

            // Create a new gateway for connecting to our peer node.
            console.log(await gateway.connect(ccpPath, { wallet, identity: 'user2@jpmc.ifmprofile-network.com', discovery: { enabled: true, asLocalhost: true } }));
            console.log('Successfully connected to gateway.')
            console.log('successfully get the network.');

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('ifmprofilechannel');
            console.log('networks',network)

            return network;
        } catch (error) {

            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({ error: error });

            //process.exit(1);

        }
    }
    static async createEntity(req, res) {
        const { entityId, name, amount,channel,partyType,isHighFocus } = req.body;
        //console.log(studentId);

        try {

            const network = await this.getNetwork();
            // Get the contract from the network.
            const contract = network.getContract('certnet', 'org.ifmprofile-network.certnet');
            console.log('Successfully get the contract')

          /*  await contract.addContractListener('createEntity', 'createEntity', (err, event, blkNum, txid, status, options) => {
                console.log('event received', status, event, blkNum, txid);
                if (err) {
                    this.emit('error', err);
                } else if (status && status === 'VALID') {
                    console.log("payload ", event.payload.toString());
                }
            });
*/
            const result = await contract.submitTransaction('createEntity',  entityId, name, amount,channel,partyType,isHighFocus);
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            await gateway.disconnect();
            res.status(200).json({ response: result.toString() });


        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({ error: error });

            // process.exit(1);
        }

    }

    static async getEntity(req, res) {

        try {
            const network = await this.getNetwork();
            // Get the contract from the network.
            const contract = network.getContract('certnet', 'org.ifmprofile-network.certnet');

            const result = await contract.evaluateTransaction('getentity', req.params.id);
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            await gateway.disconnect();
          //  console.log('result',result)
            res.status(200).json({ response: result.toString() });


        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({ error: error });

            // process.exit(1);
        }
    }

    static async getAllEntity(req, res) {

        try {
            // Get the contract from the network.
            const network = await this.getNetwork();

            const contract = network.getContract('certnet', 'org.ifmprofile-network.certnet');

            const result = await contract.evaluateTransaction('getAllentity');
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            await gateway.disconnect();
          //  console.log('result',result)
            res.status(200).json({ response: result.toString() });


        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({ error: error });

            // process.exit(1);
        }
    }


}

module.exports = EntityController;