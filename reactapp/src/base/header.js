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
      this.setState({loggedIn : true,username: localStorage.getItem('username'),orgname: localStorage.getItem('orgName')});
    } else {
      this.setState({loggedIn : false});
    }
    console.log(localStorage.getItem('orgname'));
  }

  chooseForTransfer(){
    if (this.state.orgname !== 'Beneficiary' && this.state.orgname !== 'Iot') {
      return <a href="/transfer-vaccine">Transfer Vaccine</a>
    }
    else return null;
  }

  chooseForAdd(){
    if (this.state.orgname === 'Manufacturer') {
      return (
        <>
        <a href="/add-vaccine">Add Vaccine</a>
        <a href="/add-device">Add Device</a>
        </>
      )
    }
  }

  chooseForRequirement(){
    if (this.state.orgname === 'Manufacturer' || this.state.orgname === 'Distribution') {
      return (
        <a href="/requirement">Requirement</a>
      )
    }
  }

  chooseForVerifyandVaccinate(){
    if (this.state.orgname === 'Med') {
      return <a href="/verify-vaccinate">Vaccinate</a>
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
          {this.chooseForTransfer()}
          {this.chooseForAdd()}
          {this.chooseForRequirement()}
          {this.chooseForVerifyandVaccinate()}
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
