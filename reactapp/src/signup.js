import React , {Component} from 'react';
import axios from 'axios';
import './Form.css';
import Header from './base/header';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username : '',
      //password : '',
      register : false,
      response : {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event) => {

    switch (event.target.name) {
      case 'username' : {
        this.setState({username:event.target.value});
        break;
      }
      /*case 'password' : {
        this.setState({password:event.target.value});
        break;
      }*/
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const orgname = event.target.elements.orgname.value;
    //const passcode = event.target.elements.password.value;

    const data = {
      username : username,
      orgName :orgname,
      //passcode : passcode
    };

    axios.post('http://localhost:4000/register', data)
    .then((res) => this.setState({response : res.data}))
    .catch(err => console.log(err));


    if (this.state.response.success === true) {
      this.setState({register : true,username:''});
    }
    console.log("response = "+this.state.response);
  };

  render () {
  return (
    <React.Fragment>
    <Header />
    <div className="form-login">
      {
        this.state.register === true

        ?

        <span>You are successfully signed up!!!</span>

        :

        ""
      }
        <form className="login" onSubmit={(event) => this.handleSubmit(event)}>
          <label>
            Username:
            <input type="text" name="username" value={this.state.username} onChange={this.handleChange}/>
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

          <button className="submit-button" type="submit"> Signup </button>
        </form>
    </div>
    </React.Fragment>
  );
}
}
/*<label>
  Password:
  <input type="password" name="password" value={this.state.password} onChange={this.handleChange}/>
</label><br/>*/

export default Signup;
