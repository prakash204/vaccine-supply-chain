import React, {Component} from 'react';
import { NavLink } from 'react-router-dom';
import './header.css';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      orgname: '',
      loggedIn : false,
    };
  };

  componentDidMount() {
    if (localStorage.getItem('token') !== null) {
      this.setState({loggedIn : true,username: localStorage.getItem('username'),orgname: localStorage.getItem('orgname')});
    } else {
      this.setState({loggedIn : false});
    }
  }


  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('orgName');
    localStorage.removeItem('expirationDate');
    console.log("loggedOUT");
  }

  render() {
    return (
    <div className="header">
      <div className="brand">
        <NavLink to="/">VACSUP</NavLink>
      </div>
      { this.state.loggedIn===true

        ?

        <div className="components">
          <a href="/dashboard">Dashboard</a>
          { this.state.orgname !== 'Beneficiary'
            ?
            <a href="/transfer-vaccine">Transfer Vaccine</a>
            :
            ""
          }
          { this.state.orgname === 'Manufacturer'
            ?
            <>
            <a href="/add-vaccine">Add Vaccine</a>
            <a href="/add-device">Add Device</a>
            </>
            :
            ""
          }
          <a href="/" onClick={this.logout}>logout</a>
        </div>

        :

          <div className="components">
            <NavLink to="/login">Login</NavLink>
          </div>

      }
      {
        this.state.loggedIn === false

        ?

        <div className="components">
          <NavLink to="/signup">Signup</NavLink>
        </div>

        :

        ""
      }


    </div>
  )}
}

export default Header;
