export CORE_PEER_TLS_ENABLED=true

export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export PEER0_MANUFACTURER_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/ca.crt
export PEER0_DISTRIBUTION_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/ca.crt
export PEER0_MED_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/ca.crt
export PEER0_BENEFICIARY_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/ca.crt
export PEER0_IOT_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/ca.crt

export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=mychannel

setGlobalsForOrderer() {
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp

}

setGlobalsForPeer0Manufacturer(){
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.example.com/users/Admin@manufacturer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Distribution(){
    export CORE_PEER_LOCALMSPID="DistributionMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DISTRIBUTION_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distribution.example.com/users/Admin@distribution.example.com/msp
    export CORE_PEER_ADDRESS=localhost:8051

}

setGlobalsForPeer0Med(){
    export CORE_PEER_LOCALMSPID="MedMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MED_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/med.example.com/users/Admin@med.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051

}

setGlobalsForPeer0Beneficiary(){
    export CORE_PEER_LOCALMSPID="BeneficiaryMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_BENEFICIARY_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/beneficiary.example.com/users/Admin@beneficiary.example.com/msp
    export CORE_PEER_ADDRESS=localhost:10051

}

setGlobalsForPeer0Iot(){
    export CORE_PEER_LOCALMSPID="IotMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_IOT_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/iot.example.com/users/Admin@iot.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051

}

presetup() {
    echo Vendoring Go dependencies ...
    pushd ./artifacts/src/github.com/vacsup/go
    GO111MODULE=on go mod vendor
    popd
    echo Finished vendoring Go dependencies
}
#presetup

CHANNEL_NAME="mychannel"
CC_RUNTIME_LANGUAGE="golang"
VERSION="1"
SEQUENCE="1"
CC_SRC_PATH="./artifacts/src/github.com/vacsup/go"
CC_NAME="vacsup_cc"

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo "===================== Chaincode is packaged ===================== "
}
#packageChaincode

installChaincode() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.manufacturer ===================== "

    setGlobalsForPeer0Distribution
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.distribution ===================== "

    setGlobalsForPeer0Med
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.med ===================== "

    setGlobalsForPeer0Beneficiary
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.med ===================== "

    setGlobalsForPeer0Iot
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.med ===================== "
}

#installChaincode

queryInstalled() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.manufacturer on channel ===================== "
}

#queryInstalled

# --collections-config ./artifacts/private-data/collections_config.json \
#         --signature-policy "OR('ManufacturerMSP.member','DistributionMSP.member')" \

approveForMyManufacturer() {
    setGlobalsForPeer0Manufacturer
    # set -x
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}
    # set +x

    echo "===================== chaincode approved from Manufacturer ===================== "

}
#queryInstalled
#approveForMyManufacturer

# --signature-policy "OR ('ManufacturerMSP.member')"
# --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA
# --peerAddresses peer0.manufacturer.example.com:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA --peerAddresses peer0.distribution.example.com:9051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA
#--channel-config-policy Channel/Application/Admins
# --signature-policy "OR ('ManufacturerMSP.peer','DistributionMSP.peer')"

checkCommitReadynessManufacturer() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --sequence ${SEQUENCE} --output json --init-required
    echo "===================== checking commit readyness from Manufacturer ===================== "
}

#checkCommitReadynessManufacturer

approveForMyDistribution() {
    setGlobalsForPeer0Distribution

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Distribution ===================== "
}

#queryInstalled
#approveForMyDistribution

checkCommitReadynessDistribution() {

    setGlobalsForPeer0Distribution
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --name ${CC_NAME} --version ${VERSION} --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from Distribution ===================== "
}

#checkCommitReadynessManufacturer

approveForMyMed() {
    setGlobalsForPeer0Med

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Med ===================== "
}

#queryInstalled
#approveForMyMed
#checkCommitReadynessManufacturer

checkCommitReadynessMed() {

    setGlobalsForPeer0Med
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --name ${CC_NAME} --version ${VERSION} --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from Med ===================== "
}

approveForMyBeneficiary() {
    setGlobalsForPeer0Beneficiary

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Beneficiary ===================== "
}

#queryInstalled
#approveForMyBeneficiary
#checkCommitReadynessManufacturer

checkCommitReadynessBeneficiary() {

    setGlobalsForPeer0Beneficiary
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --name ${CC_NAME} --version ${VERSION} --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from Beneficiary ===================== "
}

approveForMyIot() {
    setGlobalsForPeer0Iot

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode approved from Iot ===================== "
}

#queryInstalled
#approveForMyIot
#checkCommitReadynessManufacturer

checkCommitReadynessIot() {

    setGlobalsForPeer0Iot
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        --name ${CC_NAME} --version ${VERSION} --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from Iot ===================== "
}


# checkCommitReadyness

commitChaincodeDefination() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        --version ${VERSION} --sequence ${SEQUENCE} --init-required

}

#commitChaincodeDefination

queryCommitted() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}

#queryCommitted

chaincodeInvokeInit() {
    setGlobalsForPeer0Manufacturer
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        --isInit -c '{"Args":[]}'

}

#chaincodeInvokeInit

chaincodeInvoke1() {
    setGlobalsForPeer0Manufacturer

    # Create Car
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME}  \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        -c '{"function": "DeviceContract:CreateDevice","Args":["{\"id\":\"dev1\",\"min_temp\":10,\"present_temp\":15,\"max_temp\":17, \"total_lots_watching\":0}"]}'
}

chaincodeInvoke2() {
    setGlobalsForPeer0Manufacturer

    # Create Car
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME}  \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        -c '{"function": "VaccineContract:CreateVaccine","Args":["{\"id\":\"asd23ass\",\"name\":\"covishield\",\"manufacturer\":\"nutical pharma\",\"owner\":\"nutical pharma\",\"count\":30,\"t_dev_id\":\"dev1\", \"addedAt\":221034}"]}'
}
#'{"function": "DeviceContract:CreateDevice","Args":["{\"id\":\"dev1\",\"type\":\"temp\",\"min_temp\":10,\"present_temp\":15,\"max_temp\":17, \"total_lots_watching\":0}"]}'
#'{"function": "VaccineContract:CreateVaccine","Args":["{\"id\":\"asd23ass\",\"name\":\"covishield\",\"manufacturer\":\"nutical pharma\",\"owner\":\"nutical pharma\",\"count\":30,\"t_dev_id\":\"dev1\", \"addedAt\":221034}"]}'

#chaincodeInvoke

chaincodeInvokeDeleteAsset() {
    setGlobalsForPeer0Manufacturer

    # Create Car
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME}  \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_DISTRIBUTION_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MED_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_BENEFICIARY_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_IOT_CA \
        -c '{"function": "DeviceContract:DeleteDeviceById","Args":["dev2"]}'

}
#chaincodeInvokeDeleteAsset

chaincodeQuery() {
    setGlobalsForPeer0Manufacturer
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "DeviceContract:GetDeviceById","Args":["dev1"]}'
}

# chaincodeQuery

# Run this function if you add any new dependency in chaincode
presetup

packageChaincode
installChaincode
queryInstalled

approveForMyManufacturer
checkCommitReadynessManufacturer
approveForMyDistribution
checkCommitReadynessManufacturer
approveForMyMed
checkCommitReadynessManufacturer
#checkCommitReadynessMed
approveForMyBeneficiary
checkCommitReadynessManufacturer
#checkCommitReadynessBeneficiary
approveForMyIot
checkCommitReadynessManufacturer
#checkCommitReadynessIot


commitChaincodeDefination
queryCommitted
chaincodeInvokeInit
sleep 5
chaincodeInvoke1
sleep 3
chaincodeInvoke2
sleep 3
chaincodeInvokeDeleteAsset
chaincodeQuery
