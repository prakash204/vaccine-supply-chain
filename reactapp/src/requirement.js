import React ,{Component} from 'react';
import axios from 'axios';
import Header from './base/header';
import './dashboard.css';
import {states} from './jsondata/states.json';

const token = localStorage.getItem('token');
let jsondata;

class Requirement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username:'',
      orgname: '',
      category: '',
      phc:'',
      state_t:'',
      district:'',
      transfer: null,
      to:'',
      req_level: '',
      count:null,
      myvaccines: [],
      requirements:[],
      jsondata :[]
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({username:localStorage.getItem('username'),orgname:localStorage.getItem('orgName'),to:'',transfer:false,count:0})
    const apiurl = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllRequirements';
    axios.get(apiurl,{ headers : { 'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      .then(res => {
        this.setState({requirements:res.data.result});
        console.log(res);
      })
      .catch(err => console.log(err));
    axios.get('http://localhost:8000/states')
      .then(response => {
        this.setState({jsondata:response.data});
        console.log(response.data);
      })
      .catch(err => console.log(err));

  }

  getphcs() {
    const Requirement = this.state.requirements;
    let Phc_grouped_req = [];
    let pos;

    for (let i=0;i<Requirement.length;i++) {
      if (Requirement[i].Record.vaccinated === false && Requirement[i].Record.level === "Phc") {
        pos = -1;
        for (let j=0;j<Phc_grouped_req.length;j++) {
          if (Phc_grouped_req[j].name === Requirement[i].Record.phc) {
            pos = j;
            Phc_grouped_req[j].count++;
            break;
          }
        }
        if (pos === -1) {
          const data = {
            "name": Requirement[i].Record.phc,
            "state":Requirement[i].Record.state,
            "district":Requirement[i].Record.district,
            "count":1
          };
          Phc_grouped_req.push(data);
        }
      }
    }
    if (Phc_grouped_req.length === 0) return null;
    return Phc_grouped_req.map((item) => (
      <tr>
      <td>{item.name}</td>
      <td>{item.count}</td>
      <td><button type="button" onClick={(e) => this.sendVaccine(item.name,item.count,item.name,item.district,item.state,e)}>SEND</button></td>
      </tr>
    ))
  }

  getdistrictphcs() {
    const Requirement = this.state.requirements;
    let Phc_grouped_req = [];
    let pos;

    for (let i=0;i<Requirement.length;i++) {
      if (Requirement[i].Record.vaccinated === false && Requirement[i].Record.level === "District") {
        pos = -1;
        for (let j=0;j<Phc_grouped_req.length;j++) {
          if (Phc_grouped_req[j].name === Requirement[i].Record.phc) {
            pos = j;
            Phc_grouped_req[j].count++;
            break;
          }
        }
        if (pos === -1 ) {
          const data = {
            "name": Requirement[i].Record.phc,
            "district":Requirement[i].Record.district,
            "state":Requirement[i].Record.state,
            "count":1
          };
          Phc_grouped_req.push(data);
        }
      }
    }
    if (Phc_grouped_req.length === 0) return null;
    return Phc_grouped_req.map((item) => (
      <tr>
      <td>{item.district}</td>
      <td>{item.name}</td>
      <td>{item.count}</td>
      <td><button type="button" onClick={(e) => this.sendVaccine(item.district,item.count,item.name,item.district,item.state,e)}>SEND</button></td>
      </tr>
    ))
  }

  inputForVaccines() {
    const Myvaccines = this.state.myvaccines;
    let V = [];
    if (Myvaccines.length === null) return null
    for (let i=0;i<Myvaccines.length;i++) {
      if (Myvaccines[i].Record.count == this.state.count) V.push(Myvaccines[i].Record);
    }
    return V.map((item) => (
      <option name={item.name} value={item.id}>{item.name}-{item.id}-{item.count}</option>
    ))
  }

  sendVaccine(to,count,phc,district,state,e) {
    this.checkCategory();
    console.log(to+count);
    const apiurl_forvaccines = 'http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetMyVaccine';
    axios.get(apiurl_forvaccines,{ headers: { 'Authorization': `Bearer ${token}`}})
      .then(res => {
        console.log(res.data.result);
        this.setState({myvaccines : res.data.result,response:null,to:to,count:count,transfer:true,phc:phc,district:district,state_t:state});
      })
      .catch(err => console.log(err));
  }

  async checkCategory() {
    let flag1= false;
    let flag2 = false;
    let category;
    const S = states;

    for (const state of S) {
      if (state.name === this.state.username) {
        category='state';
        flag1=true;
        break;
      } else {
        const D = state.districts;
        for (const district of D) {

          if (district.name === this.state.username) {
            category='district';
            flag1 = true;
            break;
          } else {
            const P = district.phcs;
            for (const phc of P) {
              if (phc === this.state.username) {
                category= 'phc';
                flag1 = true;
                flag2 = true;
                break;
              }
            }
            if (flag2) break;
          }

        }
        if (flag1) break;
      }

    }

    if (flag1 === false) {
      this.setState({category:'phc'});
    } else {
      this.setState({category:category});
    }
    console.log(category);
    return null;
  }

  TransferVaccines() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <label>To : {this.state.to}</label>
        <label>Count : {this.state.count}</label>
        <select name="vaccineId">
          {this.inputForVaccines()}
        </select>
        <button type="submit">Send</button>
      </form>
    )
  }

  async post_data(apiurl,data){
    axios.post(apiurl , data, {headers : {'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'}})
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state.to +" "+this.state.count+" "+e.target.elements.vaccineId.value);
    var args = [];
    let args_2;
    let response =[];
    let data_2;
    const apiurl = "http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc";
    args.push(this.state.to);
    args.push(e.target.elements.vaccineId.value);
    console.log(args);

    /*switch(this.state.category) {
      case 'state':
        args_2 = 'Phc';
        break;
      case 'district':
        args_2 = 'Individual';
        console.log(args_2);
        break;
      default:
        break;
    }*/
    if (this.state.category === 'state') {
      args_2 = 'Phc';
    } else if (this.state.category === 'district') {
      args_2 = 'Individual';
    } else if (this.state.orgname === 'Manufacturer') {
      args_2 = 'District';
    }
    console.log(args_2);

    const data = {
      fcn:"UpdateVaccineOwner",
      peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
      chaincodeName:"vacsup_cc",
      channelName:"mychannel",
      args:args
    };

    if (this.state.orgname !== 'Med') {
      data_2 = {
        fcn:"UpdateLevel",
        peers:["peer0.manufacturer.example.com","peer0.distribution.example.com","peer0.med.example.com","peer0.beneficiary.example.com","peer0.iot.example.com"],
        chaincodeName:"vacsup_cc",
        channelName:"mychannel",
        args:[args_2,this.state.state_t,this.state.district,this.state.phc]
      };
    }

    this.post_data(apiurl, data);
    this.post_data(apiurl, data_2);
  }

  chooseForRequirements(){
    console.log(this.state.requirements);
    if (this.state.orgname === 'Manufacturer') {
      const Requirement = this.state.requirements;
      let Phc_grouped_req = [];
      let pos;

      for (let i=0;i<Requirement.length;i++) {
        if (Requirement[i].Record.level === "State" && Requirement[i].Record.vaccinated === false) {
          pos = -1;
          for (let j=0;j<Phc_grouped_req.length;j++) {
            if (Phc_grouped_req[j].name === Requirement[i].Record.phc) {
              pos = j;
              Phc_grouped_req[j].count++;
              break;
            }
          }
          if (pos === -1) {
            const data = {
              "name": Requirement[i].Record.phc,
              "district":Requirement[i].Record.district,
              "state":Requirement[i].Record.state,
              "count":1
            };
            Phc_grouped_req.push(data);
          }
        }
      }
      if (Phc_grouped_req.length === 0) return null;
      return <table>
      <thead>
      <th>State</th>
      <th>District</th>
      <th>Phc</th>
      <th>Count</th>
      <th>Send</th>
      </thead>
      <tbody>
      {Phc_grouped_req.map((item) => (
        <tr>
        <td>{item.state}</td>
        <td>{item.district}</td>
        <td>{item.name}</td>
        <td>{item.count}</td>
        <td><button type="button" onClick={(e) => this.sendVaccine(item.state,item.count,item.name,item.district,item.state,e)}>SEND</button></td>
        </tr>
      ))}
      </tbody>
      </table>
    } else if (this.state.orgname === 'Distribution') {
      let category;
      let jsondata = this.state.jsondata;
      let flag = false;
      for (let i=0;i<jsondata.length;i++) {
        if (jsondata[i].name === this.state.username) {
          category = 'state';
          break;
        } else {
          for (let j=0;j<jsondata[i].districts.length;j++) {
            if (jsondata[i].districts[j].name === this.state.username) {
              category = 'district';
              let state_t = jsondata[i].name;
              flag =true;
              break;
            }
          }
          if (flag) break;
        }
      }
      if (category === 'state') {
        return (
          <table>
            <thead>
              <th>District</th>
              <th>Phc</th>
              <th>Count</th>
              <th>Send</th>
            </thead>
            <tbody>
              {this.getdistrictphcs()}
            </tbody>
          </table>
        )
      } else if (category === 'district') {
        return (
          <table>
            <thead>
              <th>Phc</th>
              <th>Count</th>
              <th>Send</th>
            </thead>
            <tbody>
              {this.getphcs()}
            </tbody>
          </table>
        )
      }
    }

  }

  render() {
    return (
      <div className="dashboard">
        <Header />
        <div className="content">
        <h2>Requirements {this.state.id}</h2>
          {this.chooseForRequirements()}
        </div>
        {
          this.state.transfer === true ?
          <div className="content" style={{marginTop:30+'px'}}>
          <h2>Send Vaccines</h2>
            {this.TransferVaccines()}
          </div>
          : ""
        }
      </div>
    )
  }
}

export default Requirement;
