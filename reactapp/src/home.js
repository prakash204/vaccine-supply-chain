import {Component} from 'react';
import './home.css';
import './dashboard.css';
import Header from './base/header';
import axios from 'axios';

import {states} from './jsondata/states.json';

/*const writeJsonFile = require('write-json-file');
const jsonfile = require('jsonfile')*/
const file = './jsondata/ses.json'

class Home extends Component {
  constructor(props) {
      super(props);
      this.state= {
        username : '',
        orgname : '',
        state_t:'Andhra Pradesh',
        district: '',
        category: '',
        notcalled: true,
        needforform: null
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
      const token = localStorage.getItem('token');
      if (token !== null) {
        this.setState({username : localStorage.getItem('username') , orgname : localStorage.getItem('orgName')});
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

  chooseForForm() {
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
          "name":this.state.state_t,
          "districts":state_data
        })
          .then(res => console.log("hello"+res))
          .catch((err) => console.log(err));
      })
      .catch(err => console.log(err));


  }

  render() {
    return (
      <div className="home">
        <Header />
        <h1>welcome {this.state.username}</h1>
        {this.chooseForForm()}
      </div>
    )
  };
}

export default Home;
