import React, {Component} from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Header from './base/header';
import './transfer.css';

import Data from './jsondata/states.json';

class TransferVaccine extends Component {

  constructor(props) {
    super(props);
    this.state= {
      myvaccines: [],
      response: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  componentDidMount() {

    const token = localStorage.getItem('token');
    const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';
    axios.get(apiurl,{ headers: { 'Authorization': `Bearer ${token}`}})
      .then(res => {
        this.setState({myvaccines : res.data.result,response:null});
        console.log(res.data.result);
      })
      .catch(err => console.log(err));
  }

  componentWillMount() {
    this.checkedVaccines = new Set();
  }

  renderMyVaccines = () => {
      const MyVaccines = this.state.myvaccines;
      if (MyVaccines === null) return null;
      return MyVaccines.map((item) => (
        <tr>
          <td>{item.Record.id}</td>
          <td>{item.Record.name}</td>
          <td>{item.Record.t_dev_id}</td>
          <td>{item.Record.count}</td>
          <td><input type="checkbox" name={item.Record.id} onChange={this.handleChange}/></td>
        </tr>
      ))
  };

  InputsForState = () => {

    const States = Data.states;
    return States.map((item) => (
      <option value={item.name}>{item.name}</option>
    ))

  }

  InputsForDistricPhc = () => {

    const States = Data.states;
    let flag = false;
    for (const item of States) {
      if (item.name === localStorage.getItem('username')) {
        const District = item.districts;
        return District.map((district) => (
          <option value={district.name}>{district.name}</option>
        ))
      } else {
        const District = item.districts;
        for (const district of District) {
          if (localStorage.getItem('username') === district.name) {
            const Phcs = district.phcs;
            return Phcs.map((phc) => (
              <option value={phc}>{phc}</option>
            ))
          }
        }
      }
    }

  }

  getInputOptionsForTransfer = () => {
    if (localStorage.getItem('orgName') === 'Manufacturer') {
      return (
        <select type="select" name="to" >
            {this.InputsForState()}
        </select>
      )
    } else if (localStorage.getItem('orgName') === 'Distribution') {
      return (
        <select type="select" name="to" >
            {this.InputsForDistricPhc()}
        </select>
      )
    }
  }

  handleChange(event) {
    const name = event.target.name;
    if (this.checkedVaccines.has(name)) {
      this.checkedVaccines.delete(name);
    } else {
      this.checkedVaccines.add(name);
    }
  }

  handleSubmit(event){
    event.preventDefault();


    var args = [];
    const apiurl = "http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc";
    const token = localStorage.getItem('token');
    args.push(event.target.elements.to.value);
    for (const checked of this.checkedVaccines) {
      args.push(checked);
    };
    console.log(args);

    const data = {
      fcn:"UpdateVaccineOwner",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:args
    };

    axios.post(apiurl , data, {headers : {'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'}})
      .then(res => {
        console.log(res);
        this.setState({response:res})
      })
      .catch(err => console.log(err));


  }

  render() {
    return (
      <React.Fragment>
      <Header />
      <div className="form-transfer">
      <span>{this.state.response}</span>
      <form className="transfer" onSubmit={event => this.handleSubmit(event)}>
        <label>
          To :
          {this.getInputOptionsForTransfer()}
        </label>
        <button className="submit-transfer" type="submit">Submit</button>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>IOT device</th>
              <th>Count</th>
              <th>ADD</th>
            </tr>
          </thead>
          <tbody>
            {this.renderMyVaccines()}
          </tbody>
        </Table>
      </form>

      </div>
      </React.Fragment>
    )
  };
}

export default TransferVaccine;
