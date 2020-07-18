/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');



const yaml = require('js-yaml');
const ccp = yaml.safeLoad(fs.readFileSync('./gateway/networkConnection.yaml', 'utf8'));

async function main() {
    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.jpmc.ifmprofile-network.com'];
        const caTLSCACerts = fs.readFileSync(caInfo.tlsCACerts.path).toString();
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), './identity/jpmc');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('Admin@jpmc.ifmprofile-network.com');
        if (adminExists) {
            console.log('An identity for the admin user "Admin@jpmc.ifmprofile-network.com" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity('jpmcMSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('Admin@jpmc.ifmprofile-network.com', identity);
        console.log('Successfully enrolled admin user "Admin@jpmc.ifmprofile-network.com" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "Admin@jpmc.ifmprofile-network.com": ${error}`);
        process.exit(1);
    }
}

main();
