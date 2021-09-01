createcertificatesForManufacturer() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/


  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca.manufacturer.example.com --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-manufacturer-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.manufacturer.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  echo
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.manufacturer.example.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  echo
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.manufacturer.example.com --id.name manufactureradmin --id.secret manufactureradminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0
  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.manufacturer.example.com -M ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/msp --csr.hosts peer0.manufacturer.example.com --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.manufacturer.example.com -M ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls --enrollment.profile tls --csr.hosts peer0.manufacturer.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/tlsca/tlsca.manufacturer.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/ca/ca.manufacturer.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/users/User1@manufacturer.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca.manufacturer.example.com -M ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/users/User1@manufacturer.example.com/msp --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/manufacturer.example.com/users/Admin@manufacturer.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://manufactureradmin:manufactureradminpw@localhost:7054 --caname ca.manufacturer.example.com -M ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/users/Admin@manufacturer.example.com/msp --tls.certfiles ${PWD}/fabric-ca/manufacturer/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/manufacturer.example.com/users/Admin@manufacturer.example.com/msp/config.yaml

}

# createcertificatesForManufacturer

createCertificatesForDistribution() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/distribution.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/distribution.example.com/

  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca.distribution.example.com --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-distribution-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-distribution-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-distribution-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-distribution-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/distribution.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo

  fabric-ca-client register --caname ca.distribution.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  echo
  echo "Register user"
  echo

  fabric-ca-client register --caname ca.distribution.example.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  echo
  echo "Register the org admin"

  fabric-ca-client register --caname ca.distribution.example.com --id.name distributionadmin --id.secret distributionadminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/distribution.example.com/peers
  mkdir -p ../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.distribution.example.com -M ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/msp --csr.hosts peer0.distribution.example.com --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.distribution.example.com -M ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls --enrollment.profile tls --csr.hosts peer0.distribution.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/tlsca/tlsca.distribution.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/peers/peer0.distribution.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/ca/ca.distribution.example.com-cert.pem

  # --------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/distribution.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/distribution.example.com/users/User1@distribution.example.com

  echo
  echo "## Generate the user msp"
  echo

  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca.distribution.example.com -M ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/users/User1@distribution.example.com/msp --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/distribution.example.com/users/Admin@distribution.example.com

  echo
  echo "## Generate the org admin msp"
  echo

  fabric-ca-client enroll -u https://distributionadmin:distributionadminpw@localhost:8054 --caname ca.distribution.example.com -M ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/users/Admin@distribution.example.com/msp --tls.certfiles ${PWD}/fabric-ca/distribution/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/distribution.example.com/users/Admin@distribution.example.com/msp/config.yaml

}

# createCertificateForDistribution

createCertificatesForMed() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/med.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/med.example.com/


  fabric-ca-client enroll -u https://admin:adminpw@localhost:10054 --caname ca.med.example.com --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-med-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-med-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-med-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-med-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/med.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo

  fabric-ca-client register --caname ca.med.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  echo
  echo "Register user"
  echo

  fabric-ca-client register --caname ca.med.example.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  echo
  echo "Register the org admin"

  fabric-ca-client register --caname ca.med.example.com --id.name medadmin --id.secret medadminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/med.example.com/peers
  mkdir -p ../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:10054 --caname ca.med.example.com -M ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/msp --csr.hosts peer0.med.example.com --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:10054 --caname ca.med.example.com -M ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls --enrollment.profile tls --csr.hosts peer0.med.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/med.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/med.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/tlsca/tlsca.med.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/med.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/peers/peer0.med.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/med.example.com/ca/ca.med.example.com-cert.pem

  # --------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/med.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/med.example.com/users/User1@med.example.com

  echo
  echo "## Generate the user msp"
  echo

  fabric-ca-client enroll -u https://user1:user1pw@localhost:10054 --caname ca.med.example.com -M ${PWD}/../crypto-config/peerOrganizations/med.example.com/users/User1@med.example.com/msp --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/med.example.com/users/Admin@med.example.com

  echo
  echo "## Generate the org admin msp"
  echo

  fabric-ca-client enroll -u https://medadmin:medadminpw@localhost:10054 --caname ca.med.example.com -M ${PWD}/../crypto-config/peerOrganizations/med.example.com/users/Admin@med.example.com/msp --tls.certfiles ${PWD}/fabric-ca/med/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/med.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/med.example.com/users/Admin@med.example.com/msp/config.yaml

}

createCertificatesForBeneficiary() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/beneficiary.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/


  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca.beneficiary.example.com --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-beneficiary-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-beneficiary-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-beneficiary-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-beneficiary-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo

  fabric-ca-client register --caname ca.beneficiary.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  echo
  echo "Register user"
  echo

  fabric-ca-client register --caname ca.beneficiary.example.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  echo
  echo "Register the org admin"

  fabric-ca-client register --caname ca.beneficiary.example.com --id.name beneficiaryadmin --id.secret beneficiaryadminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/beneficiary.example.com/peers
  mkdir -p ../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca.beneficiary.example.com -M ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/msp --csr.hosts peer0.beneficiary.example.com --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca.beneficiary.example.com -M ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls --enrollment.profile tls --csr.hosts peer0.beneficiary.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/tlsca/tlsca.beneficiary.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/peers/peer0.beneficiary.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/ca/ca.beneficiary.example.com-cert.pem

  # --------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/beneficiary.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/beneficiary.example.com/users/User1@beneficiary.example.com

  echo
  echo "## Generate the user msp"
  echo

  fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca.beneficiary.example.com -M ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/users/User1@beneficiary.example.com/msp --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/beneficiary.example.com/users/Admin@beneficiary.example.com

  echo
  echo "## Generate the org admin msp"
  echo

  fabric-ca-client enroll -u https://beneficiaryadmin:beneficiaryadminpw@localhost:11054 --caname ca.beneficiary.example.com -M ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/users/Admin@beneficiary.example.com/msp --tls.certfiles ${PWD}/fabric-ca/beneficiary/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/beneficiary.example.com/users/Admin@beneficiary.example.com/msp/config.yaml

}

createCertificatesForIot() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/iot.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/iot.example.com/


  fabric-ca-client enroll -u https://admin:adminpw@localhost:12054 --caname ca.iot.example.com --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-iot-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-iot-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-iot-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-iot-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/iot.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo

  fabric-ca-client register --caname ca.iot.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  echo
  echo "Register user"
  echo

  fabric-ca-client register --caname ca.iot.example.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  echo
  echo "Register the org admin"

  fabric-ca-client register --caname ca.iot.example.com --id.name iotadmin --id.secret iotadminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/iot.example.com/peers
  mkdir -p ../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:12054 --caname ca.iot.example.com -M ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/msp --csr.hosts peer0.iot.example.com --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo

  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:12054 --caname ca.iot.example.com -M ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls --enrollment.profile tls --csr.hosts peer0.iot.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/iot.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/iot.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/tlsca/tlsca.iot.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/iot.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/peers/peer0.iot.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/iot.example.com/ca/ca.iot.example.com-cert.pem

  # --------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/iot.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/iot.example.com/users/User1@iot.example.com

  echo
  echo "## Generate the user msp"
  echo

  fabric-ca-client enroll -u https://user1:user1pw@localhost:12054 --caname ca.iot.example.com -M ${PWD}/../crypto-config/peerOrganizations/iot.example.com/users/User1@iot.example.com/msp --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  mkdir -p ../crypto-config/peerOrganizations/iot.example.com/users/Admin@iot.example.com

  echo
  echo "## Generate the org admin msp"
  echo

  fabric-ca-client enroll -u https://iotadmin:iotadminpw@localhost:12054 --caname ca.iot.example.com -M ${PWD}/../crypto-config/peerOrganizations/iot.example.com/users/Admin@iot.example.com/msp --tls.certfiles ${PWD}/fabric-ca/iot/tls-cert.pem


  cp ${PWD}/../crypto-config/peerOrganizations/iot.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/iot.example.com/users/Admin@iot.example.com/msp/config.yaml

}

createCertificatesForOrderer() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/ordererOrganizations/example.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/ordererOrganizations/example.com


  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml

  echo
  echo "Register orderer"
  echo

  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo
  echo "Register orderer2"
  echo

  fabric-ca-client register --caname ca-orderer --id.name orderer2 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo
  echo "Register orderer3"
  echo

  fabric-ca-client register --caname ca-orderer --id.name orderer3 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

  echo
  echo "Register orderer4"
  echo

  fabric-ca-client register --caname ca-orderer --id.name orderer4 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

  echo
  echo "Register orderer5"
  echo

  fabric-ca-client register --caname ca-orderer --id.name orderer5 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo
  echo "Register the orderer admin"
  echo

  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers
  # mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/example.com

  # ---------------------------------------------------------------------------
  #  Orderer

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com

  echo
  echo "## Generate the orderer msp"
  echo

  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo

  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls --enrollment.profile tls --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # -----------------------------------------------------------------------
  #  Orderer 2

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com

  echo
  echo "## Generate the orderer msp"
  echo

  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo

  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls --enrollment.profile tls --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer 3
  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com

  echo
  echo "## Generate the orderer msp"
  echo

  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo

  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls --enrollment.profile tls --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer 4

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com

  echo
  echo "## Generate the orderer msp"
  echo

  fabric-ca-client enroll -u https://orderer4:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp --csr.hosts orderer4.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo

  fabric-ca-client enroll -u https://orderer4:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls --enrollment.profile tls --csr.hosts orderer4.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer 5

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com

  echo
  echo "## Generate the orderer msp"
  echo

  fabric-ca-client enroll -u https://orderer5:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp --csr.hosts orderer5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo

  fabric-ca-client enroll -u https://orderer5:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls --enrollment.profile tls --csr.hosts orderer5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  mkdir -p ../crypto-config/ordererOrganizations/example.com/users
  mkdir -p ../crypto-config/ordererOrganizations/example.com/users/Admin@example.com

  echo
  echo "## Generate the admin msp"
  echo

  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/config.yaml

}

# createCretificateForOrderer

sudo rm -rf ../crypto-config/*
# sudo rm -rf fabric-ca/*
createcertificatesForManufacturer
createCertificatesForDistribution
createCertificatesForMed
createCertificatesForBeneficiary
createCertificatesForIot

createCertificatesForOrderer
