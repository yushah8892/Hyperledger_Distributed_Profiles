
/*
 * SPDX-License-Identifier: Apache-2.0
 * node regUser.js <enrollmentID>
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const ccpPath = yaml.safeLoad(fs.readFileSync('./gateway/networkConnection.yaml', 'utf8'));


async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), './identity/jpmc');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);


        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user2@jpmc.ifmprofile-network.com');

        if (userExists) {
            console.log('An identity for the user ' + ' already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('Admin@jpmc.ifmprofile-network.com');
        if (!adminExists) {
            console.log('An identity for the admin user "Admin@jpmc.ifmprofile-network.com" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'Admin@jpmc.ifmprofile-network.com', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'user2@jpmc.ifmprofile-network.com',enrollmentSecret:'user2@jpmc', role: 'client' }, adminIdentity);
        console.log('Successfully registered user '  + ' and the secret is ' + secret);

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: "user2@jpmc.ifmprofile-network.com", enrollmentSecret: secret });
        const identity = X509WalletMixin.createIdentity('jpmcMSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('user2@jpmc.ifmprofile-network.com', identity);
        console.log(`Successfully enrolled user and imported it into the wallet`);


    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }
}

main();
