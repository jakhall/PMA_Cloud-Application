
import { Link, withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { Nav, Navbar, NavItem, Button, DropdownButton, MenuItem, FormGroup, FormControl} from "react-bootstrap";
import Routes from "./Routes";
import React, { Component, Fragment} from "react";
import "./App.css";
import { Auth } from "aws-amplify";
import logo from'./proton-web.png';

class App extends Component {

    constructor(props) {
      super(props);

      this.state = {
        isAuthenticated: false,
        isAuthenticating: true,
        selectedSearch: 0,
        query: ""
      };
    }

    userHasAuthenticated = authenticated => {
      this.setState({ isAuthenticated: authenticated });
    }


  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });
  }


  handleLogout = async event => {
  await Auth.signOut();

  this.userHasAuthenticated(false);

  this.props.history.push("/login");
}

  handleSearch(query) {
    const options = ["users", "projects"];

    window.location.assign('/search/' + options[this.state.selectedSearch] + '/' + query)

  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };

    const glob = this;

    const searchOptions = ["User", "Project"]


    return (

      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect className="nav">
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">
              <img className="logo" src={logo}/>
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse className="collapse">
            <Nav pullRight>
              {this.state.isAuthenticated
                ? <NavItem onClick={this.handleLogout}>Logout</NavItem>
                : <Fragment>
                    <LinkContainer to="/signup">
                      <NavItem>Signup</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/login">
                      <NavItem>Login</NavItem>
                    </LinkContainer>
                  </Fragment>
              }
            </Nav>
              <Navbar.Form pullRight onSubmit={this.handleSubmit}>
                <FormGroup>


                  <FormControl
                   onKeyPress={event => {if (event.key === "Enter") {
                       this.handleSearch(event.target.value); }}}
                  type="text"
                  placeholder="Search" />

                  </FormGroup>{' '}
                  <DropdownButton
                   key={0}
                   title={"Search for: " + searchOptions[this.state.selectedSearch]}
                   id="type"
                   onSelect={function(evt){glob.setState({selectedSearch: evt})}}
                   className="drop"
                   >
                    <MenuItem eventKey={0}>User</MenuItem >
                    <MenuItem eventKey={1}>Project</MenuItem >

                  </DropdownButton>

              </Navbar.Form>

          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }

}

export default withRouter(App);
