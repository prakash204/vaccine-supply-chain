sudo  rm -rf ./artifacts/channel/create-certificate-with-ca/fabric-ca/

docker-compose -f ./artifacts/channel/create-certificate-with-ca/docker-compose.yaml up -d

./artifacts/channel/create-certificate-with-ca/create-certificate-with-ca.sh

./artifacts/channel/create-artifacts.sh

docker-compose -f ./artifacts/docker-compose.yaml up -d

./createChannel.sh

./deployChaincode.sh
