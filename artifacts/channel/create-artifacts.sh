
# Delete existing artifacts
rm genesis.block mychannel.tx
rm -rf ../../channel-artifacts/*

#Generate Crypto artifactes for organizations
# cryptogen generate --config=./crypto-config.yaml --output=./crypto-config/



# System channel
SYS_CHANNEL="sys-channel"

# channel name defaults to "mychannel"
CHANNEL_NAME="mychannel"

echo $CHANNEL_NAME

# Generate System Genesis block
configtxgen -profile OrdererGenesis -configPath . -channelID $SYS_CHANNEL  -outputBlock ./genesis.block


# Generate channel configuration block
configtxgen -profile BasicChannel -configPath . -outputCreateChannelTx ./mychannel.tx -channelID $CHANNEL_NAME

echo "#######    Generating anchor peer update for ManufacturerMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./ManufacturerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ManufacturerMSP

echo "#######    Generating anchor peer update for DistributionMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./DistributionMSPanchors.tx -channelID $CHANNEL_NAME -asOrg DistributionMSP

echo "#######    Generating anchor peer update for MedMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./MedMSPanchors.tx -channelID $CHANNEL_NAME -asOrg MedMSP

echo "#######    Generating anchor peer update for BeneficiaryMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./BeneficiaryMSPanchors.tx -channelID $CHANNEL_NAME -asOrg BeneficiaryMSP

echo "#######    Generating anchor peer update for IotMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./IotMSPanchors.tx -channelID $CHANNEL_NAME -asOrg IotMSP
