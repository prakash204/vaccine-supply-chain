import React , {Component} from 'react';
import AddVaccine from './addvaccine';
import AddDevice from './adddevice';
import Header from './base/header';
import './App.css';

const Tabs = () => {
  return (
    <div className="tabs">
      <ul>
        <li><button onClick={Dashboard.addVaccine}>Add Vaccine</button></li>
        <li><button onClick={Dashboard.addDevice}>Add Device</button></li>
      </ul>
    </div>
)};

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state ={
      username : '',
      orgname : '',
      showAddvaccine: false,
      showAdddevice: false
    }
  }

  componentDidMount() {
    this.setState({username:localStorage.getItem('username'), orgname : localStorage.getItem('orgName')});
  }

  addVaccine = () => {
    const a = this.state.showAddvaccine;
    this.setState({showAddvaccine:!a})
  }

  addDevice = () => {
    const a = this.state.showAdddevice;
    this.setState({showAdddevice:!a})
  }


  render() {
    return (
      <React.Fragment>
      <Header />
      <div className="App-header">
      <div className="tabs">
      {
        this.state.orgname === 'Manufacturer'

        ?
        <React.Fragment>
        <ul>
          <li><button onClick={this.addVaccine}>Add Vaccine</button></li>
          <li><button onClick={this.addDevice}>Add Device</button></li>
        </ul>
        {
          this.state.showAddvaccine === true
          ?
          <AddVaccine />
          :
          ''
        }
        {
          this.state.showAdddevice === true
          ?
          <AddDevice />
          :
          ''
        }
        </React.Fragment>
        :

        ""
      }
      </div>
      </div>
      </React.Fragment>
    );
  }
}

export default Dashboard;
