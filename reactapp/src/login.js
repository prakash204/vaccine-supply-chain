import React, {Component} from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import './Form.css';
import Header from './base/header';


const jwt = require('jsonwebtoken');

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token : '',
      success : null,
      flag : null,
    };
  }

  componentDidMount() {
    this.setState({success:null, flag: false});
  }

  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('orgName');
    localStorage.removeItem('expirationDate');
    console.log("loggedOUT");
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const orgname = event.target.elements.orgname.value;
    const passcode = event.target.elements.password.value;

    axios.post('http://localhost:4000/users/login', {
    username : username,
    orgName :orgname,
    passcode : passcode
    })
    .then((res) => this.setState({token : res.data.message.token,success : res.data.success}))
    .catch(err => console.log(err));

    if (this.state.success === true) {

      localStorage.setItem('token',this.state.token);
      const token = localStorage.getItem('token');
      console.log("token in localstorage = "+token);
      try {

        var decoded = jwt.verify(token,'thisismysecret');
        console.log(decoded);
        this.setState({flag: true})
        localStorage.setItem('username',decoded.username);
        localStorage.setItem('orgName',decoded.orgName);
        localStorage.setItem('expirationDate',decoded.exp);

        setTimeout(function() {
          this.logout();
        },decoded.exp - Math.floor(Date.now() / 1000));

      } catch(err) {
        console.log(err);
      }
    }

  };

  render () {
    if (this.state.flag === true ) {
      return <Redirect to="/" />
    }

  return (
    <React.Fragment>
      <Header />
      <div className="form-login">
      { this.state.success === false ? <span>User credentials incorrect</span> : ''}
          <form className="login" action="/home" onSubmit={(event) => this.handleSubmit(event)}>

            <label>
              Username:
              <input type="text" name="username" />
            </label><br/>

            <label>
              Org. name :
              <select type="select" name="orgname">
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distribution">Distribution</option>
                <option value="Med">Medical-Unit</option>
                <option value="Beneficiary">Beneficiary</option>
                <option value="Iot">IOT</option>
              </select>
            </label><br/>

            <label>
              Password:
              <input type="password" name="password" />
            </label><br/>

            <button className="submit-button" type="submit"> Login </button>
          </form>
      </div>
    </React.Fragment>
  );
}
}

export default Login;
