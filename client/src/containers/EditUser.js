import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, DropdownButton, MenuItem, ListGroupItem, ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./EditUser.css";
import { API, Auth} from "aws-amplify";

export default class EditUser extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isDeleting: null,
      isSaving: null,
      user: null,
      firstName: "",
      lastName: "",
      bio: "",
      skills: ""
    };
  }


  async componentDidMount() {
    const user = await this.getUser();
    const{firstName, lastName, bio, skills} = user;
    try {
      this.setState({
        user,
        firstName,
        lastName,
        bio,
        skills
     });

    } catch (e) {
      alert(e);
    }
  }

  getUser(userId){
    return API.get("pma-api", `/users/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.firstName.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }


  handleStatusChange = async event => {
    const statuses = ["Active", "Pending", "Completed"];
    this.setState({projectStatus: statuses[event]});
  }


  handleDelete = async event => {
  event.preventDefault();

  const confirmed = window.confirm(
    "Are you sure you want to delete this note?"
  );

  if (!confirmed) {
    return;
  }

  this.setState({ isDeleting: true });

  try {
    await this.deleteNote();
    this.props.history.push("/");
  } catch (e) {
    alert(e);
    this.setState({ isDeleting: false });
  }
}


  async removeLinks(){
    const links = await this.getUserLinks();
    for(const l of links){
      await this.deleteLink(l.projectId);
    }
  }


  getUserLinks(){
    return API.get("pma-api", "/teams");
  }



  saveUser(user) {
    return API.put("pma-api", `/users/${this.props.match.params.id}`, {
      body: user
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isSaving: true });

    try {
      await this.saveUser({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        bio: this.state.bio,
        skills: this.state.skills
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isSaving: false });
    }
  }

    handleDelete = async event => {
      event.preventDefault();

      const confirmed = window.confirm(
        "Are you sure you want to delete this account?"
      );

      if (!confirmed) {
        return;
      }

      this.setState({ isDeleting: true });

      try {
        await this.removeLinks();
        await this.deleteUser();
        await Auth.signOut();
        this.props.history.push("/login");

      } catch (e) {
        alert(e);
        this.setState({ isDeleting: false });
      }
    }


  render() {
    return (
      <div className="EditUser">
        <form onSubmit={this.handleSubmit}>
        <h2>Edit Profile </h2>
          <h3>First Name </h3>
          <FormGroup controlId="firstName">
            <FormControl
              onChange={this.handleChange}
              value={this.state.firstName}
              componentClass="textarea"
              className="name"
            />
          </FormGroup>
          <h3>Last Name </h3>
          <FormGroup controlId="lastName">
            <FormControl
              onChange={this.handleChange}
              value={this.state.lastName}
              componentClass="textarea"
              className="name"
            />
          </FormGroup>
      <h3>  Bio </h3>
          <FormGroup controlId="bio">
            <FormControl
              onChange={this.handleChange}
              value={this.state.bio}
              componentClass="textarea"
              className="desc"
            />
          </FormGroup>
      <h3>  Skills </h3>
          <FormGroup controlId="skills">
            <FormControl
              onChange={this.handleChange}
              value={this.state.skills}
              componentClass="textarea"
              className="name"
            />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isSaving}
            text="Save changes"
            loadingText="Saving…"
            className="ldButton"
          />
          {this.state.team &&
          <div>
          {this.renderTeam()}
          </div>}


        </form>
      </div>
    );
  }
}
