import React, { Component } from 'react';
import FormRegister from '../components/form-register/FormRegister';
import FormLogin from '../components/form-login/FormLogin';
import 'assets/css/SignPage.css'

class SignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path : this.props.match.path
    };
  }

  render () {
    console.log(this.state)
    return (
      <div className="SignPage">
        <div className="Over"></div>
        {
          this.state.path === '/login' ?
            <FormLogin />
          :
            <FormRegister />
        }
      </div>
    )
  }
}

export default SignPage;