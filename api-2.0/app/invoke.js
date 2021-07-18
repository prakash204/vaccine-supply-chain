const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const sha256 = require('sha256');


const helper = require('./helper');
const { blockListener, contractListener } = require('./Listeners');

const invokeTransaction = async ( channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        const ccp = await helper.getCCP(org_name);
        const walletPath = await helper.getWalletPath(org_name);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let identity = await wallet.get(sha256(username+org_name));
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const connectOptions = {
            wallet, identity: sha256(username+org_name), discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: EventStrategies.NONE
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        await contract.addContractListener(contractListener);
        await network.addBlockListener(blockListener);

        // Multiple smartcontract in one chaincode
        let result;
        let message;

        switch (fcn) {
            case "CreateVaccine":
                const Vaccine = args;
                prereq = await contract.evaluateTransaction('DeviceContract:GetDeviceById',Vaccine[5])
                if (prereq != "") {
                  result = await contract.submitTransaction('VaccineContract:'+fcn, JSON.stringify(args));
                  result = {txid: result.toString()}
                } else result = "Device not found";
                break;
            case "CreateDevice":
                result = await contract.submitTransaction('DeviceContract:'+fcn,JSON.stringify(args));
                result = {txid: result.toString()}
                break;
            case "CreateRequirement":
                result = await contract.submitTransaction('RequirementContract:'+fcn,JSON.stringify(args));
                result = {txid: result.toString()}
                break;
            case "UpdateVaccineOwner":
                console.log("=============")
                let temp_result_1 = {txid:[]}
                for ( let i=1; i<args.length; i++ ) {
                  res = await contract.submitTransaction('VaccineContract:'+fcn, args[i] ,args[0]);
                  temp_result_1.txid.push(res.toString());
                }
                result = temp_result_1;
                break;
            case "SetTemplocation":
                console.log("=============");
                result = await contract.submitTransaction('DeviceContract:'+fcn, args[0], args[1], args[2], args[3], args[4] );
                result = {txid: result.toString()}
                break;
            case "Vaccinated":
                console.log("=============");
                result = await contract.submitTransaction('RequirementContract:'+fcn, args );
                result = {txid: result.toString()}
                break;
            case "UpdateLevel":
                console.log("=============");
                let requirements;
                let data =[];
                let temp_result_2 = {txid:[]};
                requirements = await contract.evaluateTransaction('RequirementContract:GetAllRequirements');
                console.log(requirements);
                requirements = JSON.parse(requirements.toString());
                console.log("hoho"+requirements+requirements.length+data.length);
                for (let i=0;i<requirements.length;i++) {
                  if (requirements[i].Record.state == args[1] && requirements[i].Record.district == args[2] && requirements[i].Record.phc == args[3]) {
                    console.log(typeof requirements[i].Record.username);
                    console.log(typeof args[0]);
                    data = [requirements[i].Record.username,args[0]];
                    console.log(typeof data);
                    temp_res = await contract.submitTransaction('RequirementContract:'+fcn, JSON.stringify(data) );
                    temp_result_2.txid.push(temp_res.toString());
                  }
                }
                result = temp_result_2;
                break;
            default:
                break;
        }

        await gateway.disconnect();

        // result = JSON.parse(result.toString());

        let response = {
            message: message,
            result
        }

        return response;


    } catch (error) {

        console.log(`Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;
