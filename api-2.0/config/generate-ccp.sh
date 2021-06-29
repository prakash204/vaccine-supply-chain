#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG1}/$1/" \
        -e "s/\${ORG2}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ccp-template.json
}

#function yaml_ccp {
#    local PP=$(one_line_pem $5)
#    local CP=$(one_line_pem $6)
#    sed -e "s/\${ORG1}/$1/" \
#        -e "s/\${ORG2}/$2/" \
#        -e "s/\${P0PORT}/$3/" \
#        -e "s/\${CAPORT}/$4/" \
#        -e "s#\${PEERPEM}#$PP#" \
#        -e "s#\${CAPEM}#$CP#" \
#        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
#}

ORG1=Manufacturer
ORG2=manufacturer
P0PORT=7051
CAPORT=7054
PEERPEM=../../artifacts/channel/crypto-config/peerOrganizations/manufacturer.example.com/tlsca/tlsca.manufacturer.example.com-cert.pem
CAPEM=../../artifacts/channel/crypto-config/peerOrganizations/manufacturer.example.com/ca/ca.manufacturer.example.com-cert.pem

echo "$(json_ccp $ORG1 $ORG2 $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-manufacturer.json

ORG1=Distribution
ORG2=distribution
P0PORT=8051
CAPORT=8054
PEERPEM=../../artifacts/channel/crypto-config/peerOrganizations/distribution.example.com/tlsca/tlsca.distribution.example.com-cert.pem
CAPEM=../../artifacts/channel/crypto-config/peerOrganizations/distribution.example.com/ca/ca.distribution.example.com-cert.pem

echo "$(json_ccp $ORG1 $ORG2 $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-distribution.json

ORG1=Med
ORG2=med
P0PORT=9051
CAPORT=10054
PEERPEM=../../artifacts/channel/crypto-config/peerOrganizations/med.example.com/tlsca/tlsca.med.example.com-cert.pem
CAPEM=../../artifacts/channel/crypto-config/peerOrganizations/med.example.com/ca/ca.med.example.com-cert.pem


echo "$(json_ccp $ORG1 $ORG2 $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-med.json

ORG1=Beneficiary
ORG2=beneficiary
P0PORT=10051
CAPORT=11054
PEERPEM=../../artifacts/channel/crypto-config/peerOrganizations/beneficiary.example.com/tlsca/tlsca.beneficiary.example.com-cert.pem
CAPEM=../../artifacts/channel/crypto-config/peerOrganizations/beneficiary.example.com/ca/ca.beneficiary.example.com-cert.pem


echo "$(json_ccp $ORG1 $ORG2 $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-beneficiary.json

ORG1=Iot
ORG2=iot
P0PORT=11051
CAPORT=12054
PEERPEM=../../artifacts/channel/crypto-config/peerOrganizations/iot.example.com/tlsca/tlsca.iot.example.com-cert.pem
CAPEM=../../artifacts/channel/crypto-config/peerOrganizations/iot.example.com/ca/ca.iot.example.com-cert.pem


echo "$(json_ccp $ORG1 $ORG2 $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-iot.json
