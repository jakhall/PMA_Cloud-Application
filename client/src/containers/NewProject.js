import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, DropdownButton, MenuItem } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewProject.css";
import { API } from "aws-amplify";

export default class NewProject extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      newProject: null,
      name: "New Project",
      description: "",
      status: "Active"
    };
  }

  validateForm() {
    return (this.state.name.length > 0 && this.state.description.length > 0);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    try {
      this.state.newProject = await this.createProject({
        title: this.state.name,
        description: this.state.description,
        projectStatus: this.state.status
      });
      this.addMember({
        userId: null,
        projectId: this.state.newProject.projectId,
        role: "Creator"
      });
      window.location.assign(`/`);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  handleStatusChange = async event => {
    const statuses = ["Active", "Pending", "Completed"];
    this.setState({status: statuses[event]});
  }

  createProject(project) {
    return API.post("pma-api", "/projects", {
      body: project
    });
  }

  addMember(link) {
    const newLink = API.post("pma-api", "/teams", {
      body: link
    });

    return newLink;
  }

  render() {
    return (
      <div className="NewProject">
      <h3> Project Name </h3>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="name">
            <FormControl
              onChange={this.handleChange}
              value={this.state.name}
              componentClass="textarea"
            />
          </FormGroup>
      <h3> Description </h3>
          <FormGroup controlId="description">
            <FormControl
              onChange={this.handleChange}
              value={this.state.description}
              componentClass="textarea"
              className="desc"
            />
          </FormGroup>
      <h3> Status </h3>
          <DropdownButton
           key={0}
           title={this.state.status}
           id="role"
           onSelect={this.handleStatusChange}
           className="drop"
           >
            <MenuItem eventKey={0}>Active</MenuItem>
            <MenuItem eventKey={1}>Pending</MenuItem >
            <MenuItem eventKey={2}>Completed</MenuItem >

          </DropdownButton>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create"
            loadingText="Creating…"
            className="ldButton"
          />
        </form>
      </div>
    );
  }
}
