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

type RequirementContract struct {
	contractapi.Contract
}


var logger = flogging.MustGetLogger("vacsup_cc")

type Vaccine struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Manufacturer   string `json:"manufacturer"`
	Owner   string `json:"owner"`
	Count uint64 `json:"count"`
	Temp_device_id string `json:"t_dev_id"`
	AddedAt uint64 `json:"addedAt"`
}

type Device struct {
	ID string `json:"id"`
	Min_temp uint64 `json:"min_temp"`
	Present_temp uint64 `json:"present_temp"`
	Max_temp uint64 `json:"max_temp"`
	Latitude string `json:latitude`
	Longitude string `json:longitude`
	Total_lots uint64 `json:"total_lots_watching"`
	Time string `json:"time"`
}

type Requirement struct {
	Username string `json:"username"`
	Orgname string `json:"orgname"`
	Level string `json:"level"`
	Count uint64 `json:"count"`
}

type VaccineQueryResult struct {
	Key    string `json:"Key"`
	Record *Vaccine
}
type DeviceQueryResult struct {
	Key    string `json:"Key"`
	Record *Device
}

type RequirementQueryResult struct {
	Key    string `json:"Key"`
	Record *Requirement
}


func (s *VaccineContract) CreateVaccine(ctx contractapi.TransactionContextInterface,vaccineData []string) (string, error) {

	if len(vaccineData) != 7 {
		return "", fmt.Errorf("Please pass the correct vaccine data")
	}
	count , _ := strconv.ParseUint(vaccineData[4], 0, 64)
	addedAt , _ := strconv.ParseUint(vaccineData[6], 0, 64)

	var vaccine = Vaccine{ ID:vaccineData[0], Name:vaccineData[1], Manufacturer:vaccineData[2], Owner:vaccineData[3], Count:count, Temp_device_id:vaccineData[5], AddedAt:addedAt}

	vaccineAsBytes, err := json.Marshal(vaccine)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling vaccine. %s", err.Error())
	}

	/*if len(vaccine.Temp_device_id) == 0 {
		return "", fmt.Errorf("Please pass the correct device id")
	} else {

		params := []string{"DeviceContract:GetDeviceById", vaccine.Temp_device_id}
		queryArgs := make([][]byte, len(params))
		for i, arg := range params {
			queryArgs[i] = []byte(arg)
		}

		temp := ctx.GetStub().InvokeChaincode("DeviceContract", queryArgs, "mychannel")

		if temp.Status != "OK" {
			return "",fmt.Errorf("device not Found.%s",temp.Payload)
		}
	}*/

	ctx.GetStub().SetEvent("CreateAsset", vaccineAsBytes)

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(vaccine.ID, vaccineAsBytes)
}

func (s *VaccineContract) UpdateVaccineOwner(ctx contractapi.TransactionContextInterface, vaccineID string, newOwner string) (string, error) {

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

func (s *VaccineContract) UpdateVaccineDeviceID(ctx contractapi.TransactionContextInterface, vaccineID string, newdeviceID string) (string, error) {

	if len(vaccineID) == 0 {
		return "", fmt.Errorf("Please pass the correct vaccine id")
	}

	vaccineAsBytes, err1 := ctx.GetStub().GetState(vaccineID)
	deviceAsBytes, err2 := ctx.GetStub().GetState(newdeviceID)

	if err1 != nil {
		return "", fmt.Errorf("Failed to get vaccine data. %s", err1.Error())
	}

	if err2 != nil {
		return "", fmt.Errorf("Failed to get device data. %s", err2.Error())
	}

	if vaccineAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", vaccineID)
	}

	if deviceAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", newdeviceID)
	}

	vaccine := new(Vaccine)
	_ = json.Unmarshal(vaccineAsBytes, vaccine)

	vaccine.Temp_device_id = newdeviceID

	vaccineAsBytes, err1 = json.Marshal(vaccine)
	if err1 != nil {
		return "", fmt.Errorf("Failed while marshling vaccine. %s", err1.Error())
	}

	//  txId := ctx.GetStub().GetTxID()

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(vaccine.ID, vaccineAsBytes)

}

func (s *VaccineContract) GetHistoryForVaccineAsset(ctx contractapi.TransactionContextInterface, vaccineID string) (string, error) {

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

func (s *VaccineContract) GetVaccineById(ctx contractapi.TransactionContextInterface, vaccineID string) (*Vaccine, error) {
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

func (s *VaccineContract) DeleteVaccineById(ctx contractapi.TransactionContextInterface, vaccineID string) (string, error) {
	if len(vaccineID) == 0 {
		return "", fmt.Errorf("Please provide correct contract Id")
	}

	return ctx.GetStub().GetTxID(), ctx.GetStub().DelState(vaccineID)
}

func (s *VaccineContract) GetContractsForQuery(ctx contractapi.TransactionContextInterface, queryString string) ([]Vaccine, error) {

	queryResults, err := s.GetQueryResultForQueryString(ctx, queryString)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from ----world state. %s", err.Error())
	}

	return queryResults, nil

}

func (s *VaccineContract) GetQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]Vaccine, error) {

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

func (s *VaccineContract) GetAllVaccines(ctx contractapi.TransactionContextInterface) ([]VaccineQueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []VaccineQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		vaccine := new(Vaccine)
		_ = json.Unmarshal(queryResponse.Value, vaccine)

		queryResult := VaccineQueryResult{Key: queryResponse.Key, Record: vaccine}
		if (vaccine.Owner != "") {
			results = append(results, queryResult)
		}

	}

	return results, nil
}

func (s *VaccineContract) GetMyVaccine(ctx contractapi.TransactionContextInterface, owner string) ([]VaccineQueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []VaccineQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		vaccine := new(Vaccine)
		_ = json.Unmarshal(queryResponse.Value, vaccine)

		queryResult := VaccineQueryResult{Key: queryResponse.Key, Record: vaccine}

		if (vaccine.Owner == owner) {
			results = append(results, queryResult)
		}

	}

	return results, nil
}



func (s *DeviceContract) CreateDevice(ctx contractapi.TransactionContextInterface,deviceData []string) (string, error) {

	if len(deviceData) != 8 {
		return "", fmt.Errorf("Incorrect number of arguments. Expecting 7")
	}

	min_temp, _ := strconv.ParseUint(deviceData[1],0,64)
	max_temp, _ := strconv.ParseUint(deviceData[3],0,64)
	present_temp, _ := strconv.ParseUint(deviceData[2],0,64)
	total_lots, _ :=strconv.ParseUint(deviceData[6],0,64)

	var device = Device{ID: deviceData[0],Min_temp: min_temp,Present_temp : present_temp,Max_temp : max_temp,Latitude:"",Longitude:"",Total_lots:total_lots,Time:deviceData[7]}

	deviceAsBytes, err := json.Marshal(device)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling device. %s", err.Error())
	}

	temp, err := ctx.GetStub().GetState(device.ID)

	if temp != nil {
		return "", fmt.Errorf("%s already exists", device.ID)
	}

	ctx.GetStub().SetEvent("CreateAsset", deviceAsBytes)


	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(device.ID, deviceAsBytes)
}

func (s *DeviceContract) GetDeviceById(ctx contractapi.TransactionContextInterface, deviceID string) (*Device, error) {
	if len(deviceID) == 0 {
		return nil, fmt.Errorf("Please provide correct contract Id")
		// return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	deviceAsBytes, err := ctx.GetStub().GetState(deviceID)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if deviceAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", deviceID)
	}

	device := new(Device)
	_ = json.Unmarshal(deviceAsBytes, device)

	return device, nil

}

func (s *DeviceContract) SetTemplocation(ctx contractapi.TransactionContextInterface, deviceID string, present_temp string, latitude string, longitude string, dt string) (string, error) {

	if len(deviceID) == 0 {
		return "", fmt.Errorf("Please pass the correct device id")
	}

	deviceAsBytes, err := ctx.GetStub().GetState(deviceID)

	if err != nil {
		return "", fmt.Errorf("Failed to get device data. %s", err.Error())
	}

	if deviceAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", deviceID)
	}

	device := new(Device)
	_ = json.Unmarshal(deviceAsBytes, device)

	device.Present_temp , _ = strconv.ParseUint(present_temp, 0, 64)
	device.Latitude = latitude
	device.Longitude = longitude
	device.Time = dt

	deviceAsBytes, err = json.Marshal(device)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling device. %s", err.Error())
	}

	//  txId := ctx.GetStub().GetTxID()

	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(device.ID, deviceAsBytes)

}

func (s *DeviceContract) GetAllDevices(ctx contractapi.TransactionContextInterface) ([]DeviceQueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []DeviceQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		device := new(Device)
		_ = json.Unmarshal(queryResponse.Value, device)

		queryResult := DeviceQueryResult{Key: queryResponse.Key, Record: device}
		if (device.Min_temp != 0) {
			results = append(results, queryResult)
		}
	}

	return results, nil
}

func (s *DeviceContract) DeleteDeviceById(ctx contractapi.TransactionContextInterface, deviceID string) (string, error) {
	if len(deviceID) == 0 {
		return "", fmt.Errorf("Please provide correct contract Id")
	}

	return ctx.GetStub().GetTxID(), ctx.GetStub().DelState(deviceID)
}

func (s *DeviceContract) GetHistoryForDeviceAsset(ctx contractapi.TransactionContextInterface, deviceID string) (string, error) {

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(deviceID)
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


func (s *RequirementContract) CreateRequirement(ctx contractapi.TransactionContextInterface,requirementData []string) (string, error) {

	if len(requirementData) != 4 {
		return "", fmt.Errorf("Please pass the correct requirement data")
	}

	if (requirementData[1] == "Manufacturer" || requirementData[1] == "Iot") {
		return "", fmt.Errorf("%s can't make requirements", requirementData[1])
	}
	count , _ := strconv.ParseUint(requirementData[3], 0, 64)

	var requirement = Requirement{Username:requirementData[0],Orgname:requirementData[1],Level:requirementData[2],Count:count}

	requirementAsBytes, err := json.Marshal(requirement)
	if err != nil {
		return "", fmt.Errorf("Failed while marshling requirement. %s", err.Error())
	}

	temp, err := ctx.GetStub().GetState(requirement.Username)

	if temp != nil {
		return "", fmt.Errorf("%s already exists", requirement.Username)
	}

	ctx.GetStub().SetEvent("CreateAsset", requirementAsBytes)


	return ctx.GetStub().GetTxID(), ctx.GetStub().PutState(requirement.Username, requirementAsBytes)
}

func (s *RequirementContract) GetRequirementByUsername(ctx contractapi.TransactionContextInterface, requirementUsername string) (*Requirement, error) {
	if len(requirementUsername) == 0 {
		return nil, fmt.Errorf("Please provide correct contract Username")
		// return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	requirementAsBytes, err := ctx.GetStub().GetState(requirementUsername)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if requirementAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", requirementUsername)
	}

	requirement := new(Requirement)
	_ = json.Unmarshal(requirementAsBytes, requirement)

	return requirement, nil

}

func (s *RequirementContract) GetAllRequirements(ctx contractapi.TransactionContextInterface) ([]RequirementQueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []RequirementQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		requirement := new(Requirement)
		_ = json.Unmarshal(queryResponse.Value, requirement)

		queryResult := RequirementQueryResult{Key: queryResponse.Key, Record: requirement}
		if (requirement.Username != "") {
			results = append(results, queryResult)
		}
	}

	return results, nil
}

func (s *RequirementContract) DeleteRequirementByUsername(ctx contractapi.TransactionContextInterface, requirementUsername string) (string, error) {
	if len(requirementUsername) == 0 {
		return "", fmt.Errorf("Please provide correct contract Id")
	}

	return ctx.GetStub().GetTxID(), ctx.GetStub().DelState(requirementUsername)
}

func (s *RequirementContract) GetHistoryForRequirementAsset(ctx contractapi.TransactionContextInterface, requirementID string) (string, error) {

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(requirementID)
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

func main() {

	chaincode, err := contractapi.NewChaincode(new(VaccineContract), new(DeviceContract), new(RequirementContract))
	if err != nil {
		fmt.Printf("Error create vaccine chaincode: %s", err.Error())
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincodes: %s", err.Error())
	}

}
