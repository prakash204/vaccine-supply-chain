'use strict';

var { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

const util = require('util');

const getCCP = async (org) => {
    let ccpPath = null;
    org == 'Manufacturer' ? ccpPath = path.resolve(__dirname, '..', 'config', 'connection-manufacturer.json') : null
    org == 'Distribution' ? ccpPath = path.resolve(__dirname, '..', 'config', 'connection-distribution.json') : null
    org == 'Med' ? ccpPath = path.resolve(__dirname, '..', 'config', 'connection-med.json') : null
    org == 'Beneficiary' ? ccpPath = path.resolve(__dirname, '..', 'config', 'connection-beneficiary.json') : null
    org == 'Iot' ? ccpPath = path.resolve(__dirname, '..', 'config', 'connection-iot.json') : null
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);
    console.log(ccpPath);
    return ccp
}

const getCaUrl = async (org, ccp) => {
    let caURL = null
    org == 'Manufacturer' ? caURL = ccp.certificateAuthorities['ca.manufacturer.example.com'].url : null
    org == 'Distribution' ? caURL = ccp.certificateAuthorities['ca.distribution.example.com'].url : null
    org == 'Med' ? caURL = ccp.certificateAuthorities['ca.med.example.com'].url : null
    org == 'Beneficiary' ? caURL = ccp.certificateAuthorities['ca.beneficiary.example.com'].url : null
    org == 'Iot' ? caURL = ccp.certificateAuthorities['ca.iot.example.com'].url : null
    return caURL

}

const getWalletPath = async (org) => {
    let walletPath = null
    org == 'Manufacturer' ? walletPath = path.join(process.cwd(), 'manufacturer-wallet') : null
    org == 'Distribution' ? walletPath = path.join(process.cwd(), 'distribution-wallet') : null
    org == 'Med' ? walletPath = path.join(process.cwd(), 'med-wallet') : null
    org == 'Beneficiary' ? walletPath = path.join(process.cwd(), 'beneficiary-wallet') : null
    org == 'Iot' ? walletPath = path.join(process.cwd(), 'iot-wallet') : null
    return walletPath
}

const getAffiliation = async (org) => {
    // Default in ca config file we have only two affiliations, if you want ti use org3 ca, you have to update config file with third affiliation
    //  Here already two Affiliation are there, using i am using "org2.department1" even for org3
    return 'org1.department1'
}

const getRegisteredUser = async (username, userOrg, isJson) => {
    console.log("userOrg: "+userOrg)
    let ccp = await getCCP(userOrg)
    console.log("ccp : "+ccp)
    const caURL = await getCaUrl(userOrg, ccp)
    console.log("ca url is ", caURL)


    const caInfo = await getCaInfo(userOrg, ccp) //ccp.certificateAuthorities['ca.org1.example.com'];
    console.log("caInfo : "+ caInfo)
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        var response = {
            success: true,
            message: username + ' enrolled Successfully',
        };
        return response
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    console.log("provider : "+provider);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    console.log("admin : "+ adminUser);
    //let secret;
    console.log("ca.register");

        // Register the user, enroll the user, and import the new identity into the wallet.

      const secret = await ca.register({
        enrollmentID: username,
        role: 'client',
        affiliation: 'org1.department1'
    }, adminUser);

        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);


    console.log("ca.register");

    const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
    // const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret, attr_reqs: [{ name: 'role', optional: false }] });

    let x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: `${userOrg}MSP`,
        type: 'X.509',
    };
    await wallet.put(username, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);

    var response = {
        success: true,
        message: username + ' enrolled Successfully',
    };
    return response
}

const isUserRegistered = async (username, userOrg) => {
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} exists in the wallet`);
        return true
    }
    return false
}


const getCaInfo = async (org, ccp) => {
    let caInfo = null
    org == 'Manufacturer' ? caInfo = ccp.certificateAuthorities['ca.manufacturer.example.com'] : null
    org == 'Distribution' ? caInfo = ccp.certificateAuthorities['ca.distribution.example.com'] : null
    org == 'Med' ? caInfo = ccp.certificateAuthorities['ca.med.example.com'] : null
    org == 'Beneficiary' ? caInfo = ccp.certificateAuthorities['ca.beneficiary.example.com'] : null
    org == 'Iot' ? caInfo = ccp.certificateAuthorities['ca.iot.example.com'] : null
    return caInfo
}

const enrollAdmin = async (org, ccp) => {
    console.log('calling enroll Admin method')
    try {
        const caInfo = await getCaInfo(org, ccp) //ccp.certificateAuthorities['ca.org1.example.com'];
        console.log("caInfo : "+caInfo)
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        console.log("caTLSCACerts : "+ caTLSCACerts)
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        console.log("ca : "+ca)
        // Create a new file system based wallet for managing identities.
        const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        console.log("Enrollment object is : ", enrollment)
        let x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${org}MSP`,
            type: 'X.509',
        };

        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

const registerAndGerSecret = async (username, userOrg) => {
    console.log("userOrg: "+userOrg)
    let ccp = await getCCP(userOrg)
    console.log("ccp : "+ccp)
    const caURL = await getCaUrl(userOrg, ccp)
    console.log("ca url is ", caURL)


    const caInfo = await getCaInfo(userOrg, ccp) //ccp.certificateAuthorities['ca.org1.example.com'];
    console.log("caInfo : "+ caInfo)
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        var response = {
            success: true,
            message: username + ' enrolled Successfully',
        };
        return response
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    let secret;
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client' }, adminUser);
        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);

    } catch (error) {
        return error.message
    }

    var response = {
        success: true,
        message: username + ' enrolled Successfully',
        secret: secret
    };
    return response

}

exports.getRegisteredUser = getRegisteredUser

module.exports = {
    getCCP: getCCP,
    getWalletPath: getWalletPath,
    getRegisteredUser: getRegisteredUser,
    isUserRegistered: isUserRegistered,
    registerAndGerSecret: registerAndGerSecret

}
