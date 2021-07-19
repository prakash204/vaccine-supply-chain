import React , {Component} from 'react';
import {BrowserRouter as Router,Switch,Route}  from 'react-router-dom';
import { Redirect } from 'react-router-dom';

import './App.css';
import Signup from './signup';
import Login from './login';
import Home from './home';
import Dashboard from './dashboard';
import AddDevice from './adddevice';
import AddVaccine from './addvaccine';
import TransferVaccine from './transfervaccine';
import UpdateDevice from './updatedevice';
import Requirement from './requirement';
import Vaccinate from './vaccinate';
import VaccineData from './vaccinedata';
import GetFeedbacks from './getfeedbacks';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedIn : false,
      orgname: ''
    }
  }

  componentDidMount(){
    const a = localStorage.getItem('token');
    if (a !== null) {
      this.setState({loggedIn : true, orgname: localStorage.getItem('orgName')})
    }
  }

  render () {
  return (
    <div className="App">
    <Router>
    <Switch>
      <Route exact path ="/signup">
        <Signup />
      </Route>
      <Route exact path ="/login">
        {this.state.loggedIn ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route exact path="/">
        <Home loggedIn={this.state.loggedIn}/>
      </Route>
      <Route exact path="/dashboard">
        <Dashboard/>
      </Route>
      <Route exact path="/transfer-vaccine">
        <TransferVaccine />
      </Route>
      <Route exact path="/requirement">
      <Requirement />
      </Route>
      <Route exact path="/verify-vaccinate">
      <Vaccinate />
      </Route>
      <Route path="/vaccineID/:id/" component={VaccineData} />

      { this.state.orgname === 'Manufacturer'
        ?
          <>
            <Route exact path="/add-vaccine">
              <AddVaccine />
            </Route>
            <Route exact path="/add-device">
              <AddDevice />
            </Route>
            <Route path="/feedbacks/" component={GetFeedbacks} />
          </>
        :
        ""
      }
      <Route path="/vaccine_temp_location/:id/" component={UpdateDevice}/>
    </Switch>
    </Router>
    </div>

  );
}
}

export default App;
