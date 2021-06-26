package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric/common/flogging"
)

type VaccineContract struct {
	contractapi.Contract
}

type DeviceContract struct {
	contractapi.Contract
}

var logger = flogging.MustGetLogger("vacsup_cc")

type Vaccine struct {
	ID      string `json:"id"`
	name    string `json:"name"`
	manufacturer   string `json:"manufacturer"`
	owner   string `json:"owner"`
	count uint64 `json:"count"`
	temp_device_id string `json:"t_dev_id"`
	AddedAt uint64 `json:"addedAt"`
}

type Device struct {
	ID string `json:"id"`
	Type string `json:"type"`
	Min_temp uint64 `json:"min_temp"`
	Present_temp uint64 `json:"present_temp"`
	Max_temp uint64 `json:"max_temp"`
	Longitude unint64 `json:"longitude"`
	Latitude uint64 `json:"latitude"`
	total_lots uint64 `json:"total_lots_watching"`
}

func (s *SmartContract) CreateVaccine(ctx contractapi.TransactionContextInterface,vaccineData string) (string, error) {

	if len(vaccineData) == 0 {
		return "", fmt.Errorf("Please pass the correct vaccine data")
	}

	var vaccine Vaccine
	err := json.Unmarshal([]byte(vaccineData), &vaccine)
	if err != nil {
		return "", fmt.Errorf("Failed while unmarshling vaccine. %s", err.Error())
	}

	vaccineAsBytes, err := json.Marshal(vaccine)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling vaccine. %s", err.Error())
	}
  if len(vaccine.ID) == 0 {
		return "", fmt.Errorf("Please pass the correct vaccine id")
	} else {
		temp, err := ctx.GetStub().GetState(vaccine.ID)

		if temp != nil {
			return nil, fmt.Errorf("%s already exists", vaccine.ID)
		}
	}

	if len(vaccine.temp_device_id) == 0 {
		return "". fmt.Errorf("Please pass the correct device id")
	} else {
		temp, err := ctx.GetStub().GetState()

		if temp == nil {
			return nil, fmt.Errorf("%s not exists", vaccine.temp_device_id)
		}
	}

	ctx.GetStub().SetEvent("CreateAsset", vaccineAsBytes)

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(vaccine.ID, vaccineAsBytes)
}

func (s *SmartContract) CreateDevice(ctx contractapi.TransactionContextInterface,deviceData string) (string, error) {

	if len(deviceData) == 0 {
		return "", fmt.Errorf("Please pass the correct device data")
	}

	var device Device
	err := json.Unmarshal([]byte(deviceData), &device)
	if err != nil {
		return "", fmt.Errorf("Failed while unmarshling device. %s", err.Error())
	}

	deviceAsBytes, err := json.Marshal(device)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling device. %s", err.Error())
	}

	temp, err := ctx.GetStub().GetState(deviceID)

	if temp != nil {
		return nil, fmt.Errorf("%s already exists", deviceID)
	}

	ctx.GetStub().SetEvent("CreateAsset", deviceAsBytes)


	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(device.ID, deviceAsBytes)
}

func (s *SmartContract) UpdateVaccineOwner(ctx contractapi.TransactionContextInterface, vaccineID string, newOwner string) (string, error) {

	if len(vaccineID) == 0 {
		return "", fmt.Errorf("Please pass the correct vaccine id")
	}

	vaccineAsBytes, err := ctx.GetStub().GetState(vaccineID)

	if err != nil {
		return "", fmt.Errorf("Failed to get vaccine data. %s", err.Error())
	}

	if vaccineAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", vaccineID)
	}

	vaccine := new(Vaccine)
	_ = json.Unmarshal(vaccineAsBytes, vaccine)

	vaccine.Owner = newOwner

	vaccineAsBytes, err = json.Marshal(vaccine)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling vaccine. %s", err.Error())
	}

	//  txId := ctx.GetStub().GetTxID()

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(vaccine.ID, vaccineAsBytes)

}

func (s *SmartContract) UpdateVaccineTempDeviceID(ctx contractapi.TransactionContextInterface, vaccineID string, newdeviceID string) (string, error) {

	if len(vaccineID) == 0 {
		return "", fmt.Errorf("Please pass the correct vaccine id")
	}

	vaccineAsBytes, err1 := ctx.GetStub().GetState(vaccineID)
	deviceAsBytes, err2 := ctx.GetStub().GetState(newdeviceID)

	if err1 != nil {
		return "", fmt.Errorf("Failed to get vaccine data. %s", err.Error())
	}

	if vaccineAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", vaccineID)
	}

	if deviceAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", newdeviceID)
	}

	vaccine := new(Vaccine)
	_ = json.Unmarshal(vaccineAsBytes, vaccine)

	vaccine.temp_device_id = newdeviceID

	vaccineAsBytes, err = json.Marshal(vaccine)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling vaccine. %s", err.Error())
	}

	//  txId := ctx.GetStub().GetTxID()

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(vaccine.ID, vaccineAsBytes)

}

func (s *SmartContract) GetHistoryForAsset(ctx contractapi.TransactionContextInterface, vaccineID string) (string, error) {

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(vaccineID)
	if err != nil {
		return "", fmt.Errorf(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", fmt.Errorf(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return string(buffer.Bytes()), nil
}

func (s *SmartContract) GetVaccineById(ctx contractapi.TransactionContextInterface, vaccineID string) (*Vaccine, error) {
	if len(vaccineID) == 0 {
		return nil, fmt.Errorf("Please provide correct contract Id")
		// return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	vaccineAsBytes, err := ctx.GetStub().GetState(vaccineID)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if vaccineAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", vaccineID)
	}

	vaccine := new(Vaccine)
	_ = json.Unmarshal(vaccineAsBytes, vaccine)

	return vaccine, nil

}

func (s *SmartContract) DeleteVaccineById(ctx contractapi.TransactionContextInterface, vaccineID string) (string, error) {
	if len(vaccineID) == 0 {
		return "", fmt.Errorf("Please provide correct contract Id")
	}

	return ctx.GetStub().GetTxID(), ctx.GetStub().DelState(vaccineID)
}

func (s *SmartContract) DeleteDeviceById(ctx contractapi.TransactionContextInterface, deviceID string) (string, error) {
	if len(deviceID) == 0 {
		return "", fmt.Errorf("Please provide correct contract Id")
	}

	return ctx.GetStub().GetTxID(), ctx.GetStub().DelState(deviceID)
}

func (s *SmartContract) GetContractsForQuery(ctx contractapi.TransactionContextInterface, queryString string) ([]Vaccine, error) {

	queryResults, err := s.getQueryResultForQueryString(ctx, queryString)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from ----world state. %s", err.Error())
	}

	return queryResults, nil

}

func (s *SmartContract) getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]Vaccine, error) {

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []Vaccine{}

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		newVaccine := new(Vaccine)

		err = json.Unmarshal(response.Value, newVaccine)
		if err != nil {
			return nil, err
		}

		results = append(results, *newVaccine)
	}
	return results, nil
}


func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("Error create vaccine chaincode: %s", err.Error())
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincodes: %s", err.Error())
	}

}
