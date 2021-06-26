export CORE_PEER_TLS_ENABLED=true

export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export PEER0_MANUFACTURER_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/ca.crt
export PEER0_DISTRIBUTION_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/ca.crt
export PEER0_MED_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/ca.crt
export PEER0_BENEFICIARY_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/ca.crt
export PEER0_IOT_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/ca.crt

export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=mychannel

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

createChannel(){
    rm -rf ./channel-artifacts/*
    setGlobalsForPeer0Manufacturer

    peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer.example.com \
    -f ./artifacts/channel/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

removeOldCrypto(){

    rm -rf ./api-2.0/manufacturer-wallet/*
    rm -rf ./api-2.0/distribution-wallet/*
    rm -rf ./api-2.0/med-wallet/*
    rm -rf ./api-2.0/beneficiary-wallet/*
    rm -rf ./api-2.0/iot-wallet/*
}


joinChannel(){
    setGlobalsForPeer0Manufacturer
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0Distribution
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0Med
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0Beneficiary
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

    setGlobalsForPeer0Iot
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block

}

updateAnchorPeers(){
    setGlobalsForPeer0Manufacturer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Distribution
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Med
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Beneficiary
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Iot
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

}

removeOldCrypto

createChannel
joinChannel
updateAnchorPeers
