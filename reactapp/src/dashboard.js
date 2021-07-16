import React , {Component} from 'react';
import Header from './base/header';
import './dashboard.css';
import axios from 'axios';
import States from './jsondata/states.json';
import GetDevices from './getdevices';


const token = localStorage.getItem('token');
const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';
const apiurl_get = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllDevices';
var QRCode = require('qrcode.react');
const sha256 = require('sha256');


class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state ={
      username : '',
      orgname : '',
      showAddvaccine: false,
      myvaccines:[],
      showAdddevice: false,
      registered:null,
      state_t:'Andhra Pradesh',
      district:'',
      phc:'',
      qrvalue:null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  componentDidMount() {
    this.setState({username:localStorage.getItem('username'), orgname : localStorage.getItem('orgName')});

    axios.get(apiurl, { headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res => {
        this.setState({ myvaccines :res.data.result});
        console.log(res.data.result);
      })
      .catch(err => console.log(err));
    //console.log(this.state.myvaccines);
  }

  addVaccine = () => {
    const a = this.state.showAddvaccine;
    this.setState({showAddvaccine:!a})
  }

  addDevice = () => {
    const a = this.state.showAdddevice;
    this.setState({showAdddevice:!a})
  }

  renderMyVaccines = () => {
    const MyVaccines = this.state.myvaccines;
    if (MyVaccines === null) return null;
    return MyVaccines.map((item) => (
      <tr>
        <td>{item.Record.id}</td>
        <td>{item.Record.name}</td>
        <td>{item.Record.manufacturer}</td>
        <td>{item.Record.owner}</td>
        <td><a href={`/update_temp_location/${item.Record.t_dev_id}/`}>{item.Record.t_dev_id}</a></td>
        <td>{item.Record.count}</td>
      </tr>
    ))
  }

  getstates = () => {
    const South_states = States.states;
    return South_states.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  };

  getdistricts = () => {
    const state = this.state.state_t;
    var Districts = [];
    const South_states = States.states;

    South_states.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));

    return Districts.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  }

  getphcs = () => {
    const state = this.state.state_t;
    const district = this.state.district;
    const South_states = States.states;
    var Districts = [];
    var Phcs =[];

    South_states.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));
    Districts.map((item) => (
      item.name === district ? Phcs = item.phcs : ""
    ));

    return Phcs.map((item) => (
      <option value={item}>{item}</option>
    ));
  }

  registerForVaccine = () => {
    return (
      <>
        <h2>Register for vaccine here!!!</h2><p>***provide the same password as provided while logging in to the website</p>
        <form className="update" onSubmit={(event) => this.handleSubmit(event)}>

          <label>
            State:
            <select type="select" name="state_t" onChange={this.handleChange}>
              {this.getstates()}
            </select>
          </label>

          <label>
            District:
            <select type="select" name="district" onChange={this.handleChange}>
              {this.getdistricts()}
            </select>
          </label>

          <label>
            PHC:
            <select type="select" name="phc" onChange={this.handleChange}>
              {this.getphcs()}
            </select>
          </label>

          <label>
            Password:
            <input type="password" name="passcode"/>
          </label>

          <button className="submit-button" type="submit">Register</button>
        </form>
      </>
    )
  };

  downloadQR = () => {
    const canvas = document.getElementById("qrcode");
    const pngUrl = canvas.toDataURL("image/png").replace("mage/png","image/octe-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  chooseForMyVaccines = () => {
    const myorgs = ["Manufacturer","Distribution","Med"];
    if (myorgs.includes(this.state.orgname)) {

      return (
        <>
          <h1>Myvaccines</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Owner</th>
                <th>IOT device</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {this.renderMyVaccines()}
            </tbody>
          </table>
        </>
      )

    } else  if (this.state.orgname === 'Beneficiary') {

      if (this.state.registered) {

        return <><h2>You are already registered!!!</h2><QRCode id="qrcode" value={this.state.qrvalue} /><a href="#" onClick={this.downloadQR}>download</a></>

      } else {

        return <>{this.registerForVaccine()}</>

      }

    } else if (this.state.orgname === 'Iot') {

      return <GetDevices />

    }
  }

  handleChange(event) {
    switch (event.target.name) {
      case 'state_t': {
        this.setState({state_t: event.target.value});
        break;
      }
      case 'district': {
        this.setState({district:event.target.value});
        break;
      }
      case 'phc': {
        this.setStae({phc: event.target.value});
      }
    }
  };

  handleSubmit(event) {
    event.preventDefault();

    const passcode = event.target.elements.passcode.value;
    const data = {
      fcn:"RegisterForVaccine",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:[this.state.state, this.state.district, passcode]
    };

    /*axios.post('http://localhost:4000/channels/mychannel/chaincodes/vacsu_cc/',data,{ headers: { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json' } })
      .then(res => console.log(res))
      .catch(err => console.log(err));*/
    this.setState({qrvalue : sha256(this.state.username + passcode), registered:true });
  }


  render() {
    return (
      <div className="dashboard">
        <Header />
        <div className="content">
    {this.chooseForMyVaccines()}
        </div>
      </div>
    );
  }
}

export default Dashboard;
