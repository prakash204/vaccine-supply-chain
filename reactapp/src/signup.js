import React , {Component} from 'react';
import axios from 'axios';
import './form.css';
import Header from './base/header';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username : '',
      orgname : '',
      register : false,
      response : {},
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const orgname = event.target.elements.orgname.value;
    const passcode = event.target.elements.password.value;

    const data = {
      username : username,
      orgName :orgname,
      passcode : passcode
    };

    axios.post('http://localhost:4000/register', data)
    .then((res) => this.setState({response : res.data}))
    .catch(err => console.log(err));

    console.log("response = "+this.state.response);
  };

  render () {
  return (
    <React.Fragment>
    <Header />
    <div className="form">
        <form onSubmit={(event) => this.handleSubmit(event)}>
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
          <button type="submit"> Signup </button>
        </form>
    </div>
    </React.Fragment>
  );
}
}

export default Signup;
