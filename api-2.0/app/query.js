const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const sha256 = require('sha256');


const helper = require('./helper')
const query = async (channelName, chaincodeName, args, fcn, username, org_name) => {

    try {

        // load the network configuration
        // const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        // const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(sha256(username+org_name));
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('registerUser application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity:sha256(username+org_name), discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        let result;

        switch (fcn) {
            case "GetAllDevices":
                console.log("============");
                console.log(args);
                result = await contract.evaluateTransaction('DeviceContract:'+fcn);
                break;
            case "GetHistoryForVaccineAsset":
                console.log("=============")
                result = await contract.evaluateTransaction('VaccineContract:'+fcn, args[0]);
                break;
            case "GetHistoryForRequirementAsset":
                console.log("=============")
                result = await contract.evaluateTransaction('RequirementContract:'+fcn, args[0]);
                break;
            case "GetHistoryForDeviceAsset":
                console.log("=============")
                result = await contract.evaluateTransaction('DeviceContract:'+fcn, args);
                break;

            case "GetVaccineById":
                console.log("=============")
                result = await contract.evaluateTransaction('VaccineContract:'+fcn, args[0]);
                break;
            case "GetDeviceById":
                console.log("=============")
                result = await contract.evaluateTransaction('DeviceContract:'+fcn, String(args));
                break;
            case "GetRequirementByUsername":
                console.log("=============")
                result = await contract.evaluateTransaction('RequirementContract:'+fcn, args[0]);
                break;

            case "GetMyVaccine":
                console.log("============"+args)
                result = await contract.evaluateTransaction('VaccineContract:'+fcn, args );
                break;
            default:
                break;
        }

        console.log(result)
        console.log(`Transaction has been evaluated,${fcn}, result is: ${result.toString()}`);

        result = JSON.parse(result.toString());
        return result

    } catch (error) {

        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message

    }
}

exports.query = query
