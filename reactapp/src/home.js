import {Component} from 'react';
import './home.css';
import Header from './base/header';
import axios from 'axios';
import GetCertificate from './getcertificate';

import {states} from './jsondata/states.json';

class Home extends Component {
  constructor(props) {
      super(props);
      this.state= {
        username : '',
        orgname : '',
        state_t:null,
        district: '',
        category: '',
        vaccines:[],
        selected_state:null,
        selected_district:null,
        selected_phc:null,
        notcalled: true,
        needforform: null
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
      const token = localStorage.getItem('token');
      if (token !== null) {
        this.setState({username : localStorage.getItem('username') , orgname : localStorage.getItem('orgName'),selected_state:'Andhra Pradesh',selected_district:'Anantapur'});
        const headers = {
          'Authorization': `Bearer ${token}`
        }
        axios.get('http://localhost:4000/channels/mychannel/chaincodes/vacsup_cc?fcn=GetAllVaccines',{headers:headers})
          .then(res => {
            console.log(res.data);
            this.setState({vaccines:res.data.result});
          })
          .catch(err => console.log(err));
      }
  }

  async checkCategory() {
    let flag1= false;
    let flag2 = false;
    let category, needforform;
    const S = states;

    for (const state of S) {
      if (state.name === this.state.username) {
        category='state';
        needforform=false;
          flag1=true;
          break;
      } else {
        const D = state.districts;
        for (const district of D) {

          if (district.name === this.state.username) {
            category='district';
            needforform=false;
            flag1 = true;
            break;
          } else {
            const P = district.phcs;
            for (const phc of P) {
              if (phc === this.state.username) {
                category= 'phc';
                needforform=false;
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
      this.setState({category:'phc', needforform:true});
    } else {
      this.setState({category:category, needforform: needforform});
    }
    return null;
  }

  getstates = () => {
    const South_states = states;
    return South_states.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  };

  getdistricts = () => {
    const state = this.state.state_t;
    var Districts = [];
    const South_states = states;

    South_states.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));

    return Districts.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  }

  getAllVaccines_groupby_state(){
    const S = states;
    let group = [0,0,0,0,0,0];
    for (let i=0;i<this.state.vaccines.length;i++) {
      for (const state of S) {
        if (this.state.vaccines[i].Record.owner === state.name) {
          group[state.id -1] = group[state.id -1] + this.state.vaccines[i].Record.count;
        }
      }
    }

    return S.map((item) => (
      <tr>
        <td>{item.name}</td>
        <td>{group[item.id -1]}</td>
      </tr>
    ))
  }

  getAllVaccines_groupby_district(){
    const S = states;
    let D = [];
    let Group = [];
    let flag = true;
    for (let i=0;i<this.state.vaccines.length;i++) {
      for (const state of S) {
        if (this.state.selected_state === state.name) {
          D = state.districts;
          if (flag) {
            for (let j=0;j<D.length;j++) {
              Group.push(0);
            }
          }
          for (const district of D) {
            if (this.state.vaccines[i].Record.owner === district.name) {
              Group[district.id -1]=Group[district.id - 1]+this.state.vaccine[i].Record.owner;
            }
          }
        }
      }
    }

    return D.map((item) => (
      <tr>
        <td>{item.name}</td>
        <td>{Group[item.id -1]}</td>
      </tr>
    ))
  }

  getAllVaccines_groupby_phc(){
    const S = states;
    let D = [];
    let P =[];
    let Group = [];
    let flag = true;
    for (let i=0;i<this.state.vaccines.length;i++) {
      for (const state of S) {
        if (this.state.selected_state === state.name) {
          D = state.districts;
          for (const district of D) {
            if (this.state.selected_district===district.name) {
              P = district.phcs;
              if (flag) {
                for (let j=0;j<P.length;j++) {
                  Group.push({
                    name:P[j],
                    count:0
                  });
                }
                flag= false;
              }
              for (let j=0;j<Group.length;j++) {
                if (this.state.vaccines[i].Record.owner === Group[j].name) {
                  Group[j].count=Group[j].count + this.state.vaccines[i].Record.count;
                }
              }
            }
          }
        }
      }
    }
    return Group.map((item) => (
      <tr>
        <td>{item.name}</td>
        <td>{item.count}</td>
      </tr>
    ))
  }

  getinputsforselectedDistricts() {
    const state = this.state.selected_state;
    var Districts = [];
    const S = states;

    S.map((item) => (
      item.name === state ? Districts = item.districts : ""
    ));

    return Districts.map((item) => (
      <option value={item.name}>{item.name}</option>
    ));
  }

  chooseForForm() {
    if (this.state.username === '') return null;
    if (this.state.orgname !== 'Med') return null;
    console.log(this.state.category);
    if (this.state.notcalled === true) {
      this.checkCategory();
      this.setState({notcalled:false});
    }
    if (this.state.needforform === true && this.state.orgname === 'Med') {
      return (
        //write a form
        <div className="content">
          <h3>***Please fill this form carefully, Can be filled only once!!!</h3>
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

            <button className="submit-button" type="submit">Register</button>
          </form>
        </div>
      )
    } else return null;
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
      case 'selected_state': {
        this.setState({selected_state:event.target.value});
        break;
      }
      case 'selected_district': {
        this.setState({selected_district:event.target.value});
        break;
      }
    }
  };

  handleSubmit(event) {
    event.preventDefault();

    let S = states;
    let state_data = [];
    let s_id;
    axios.get('http://localhost:8000/states?name=Telangana')
      .then(res => {
        s_id = res.data[0].id;
        state_data = S[parseInt(s_id) - 1].districts;
        for (let i=0; i<state_data.length;i++) {
          if (state_data[i].name === event.target.elements.district.value){
            state_data[i].phcs.push(this.state.username);
          }
        }
        axios.put(`http://localhost:8000/states/${s_id}`,{
          "id":parseInt(s_id),
          "name":event.target.elements.state_t.value,
          "districts":state_data
        })
          .then(res => console.log("hello"+res))
          .catch((err) => console.log(err));
      })
      .catch(err => console.log(err));


  }

  vaccineCountTables(){

    if (this.state.username !== '') return (
      <>
      <div className="home_content" style={{marginTop:100+'px'}}>
        <select name="selected_state" value={this.state.selected_state} onChange={this.handleChange}>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Kerala">Kerala</option>
          <option value="Puducherry">Puducherry</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
        </select>
        <select name="selected_district" value={this.state.selected_district} onChange={this.handleChange}>
          {this.getinputsforselectedDistricts()}
        </select>
      </div>

      <div className="home_content" style={{marginTop:30+'px'}}>
        <div className="table">
        <table>
          <thead>
            <th>State</th>
            <th>Vaccine Count</th>
          </thead>
          <tbody>
            {this.getAllVaccines_groupby_state()}
          </tbody>
        </table>
        </div>

        <div className="table">
        <table>
          <thead>
            <th>District</th>
            <th>Vaccine Count</th>
          </thead>
          <tbody>
            {this.getAllVaccines_groupby_district()}
          </tbody>
        </table>
        </div>

        { this.state.selected_district !== null
          ?
          <div className="table">
          <table>
            <thead>
              <th>Phc</th>
              <th>Vaccine Count</th>
            </thead>
            <tbody>
              {this.getAllVaccines_groupby_phc()}
            </tbody>
          </table>
          </div>
          :
          ""
        }

      </div>
      </>
    );
    else return <>
      <h1 style={{marginTop:100+'px',color:"white"}}>Welcome&emsp;<a href="/login" style={{color:"white"}}>Login</a>&nbsp;/ &nbsp;<a href="/signup" style={{color:"white"}}>Signup</a></h1>
      <GetCertificate/>
      </>
  }

  render() {
    return (
      <div className="home">
        <Header />
        <div className="Total_Content">
        {this.chooseForForm()}
        {this.vaccineCountTables()}
        </div>
      </div>
    )
  };
}

export default Home;
