import {Component} from 'react';
import './home.css';
import Header from './base/header';

class Home extends Component {
  constructor(props) {
      super(props);
      this.state= {
        username : '',
        orgname : ''
      }
  }

  componentDidMount() {
      const token = localStorage.getItem('token');
      if (token !== null) {
        this.setState({username : localStorage.getItem('username') , orgname : localStorage.getItem('orgName')});
      }
  }

  render() {
    return (
      <div className="home">
        <Header />
        <h1>welcome {this.state.username}</h1>
      </div>
    )
  };
}

export default Home;
