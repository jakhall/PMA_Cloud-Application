import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, DropdownButton, MenuItem, ListGroupItem, ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./ManageProject.css";
import { API } from "aws-amplify";

export default class ManageProject extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isSaving: null,
      description: "",
      projectName: "",
      projectStatus: null,
      projectDesc: null
    };
  }


  async componentDidMount() {

    try {
      const teamIds = await this.team();
      const team = await this.getTeamUsers(teamIds);
      const project = await this.getproject();
      const {title, description, projectStatus} = project;
      this.setState({
        team,
        project,
        projectStatus,
        projectName: title,
        projectDesc: description,
     });

    } catch (e) {
      alert(e);
    }
  }

  team() {
    return API.get("pma-api", `/teams/${this.props.match.params.id}`);
  }

  getproject() {
    return API.get("pma-api", `/projects/${this.props.match.params.id}`);
  }

  async getTeamUsers(team){
    var newList = [];
    var member = null;

    for(const m of team){
      member = await this.getUserObject(m);
      newList.push(member);
    }

    return newList;
  }

  getUser(userId){
    return API.get("pma-api", `/users/${userId}`);
  }


  async getUserObject(user){
   var res = null;
   await this.getUser(user.userId).then(function(result){
      res = result;
    })
    res.addedAt = user.addedAt;
    res.role = user.role;
    return res;
  }

  validateForm() {
    return this.state.projectName.length > 0;
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

  deleteProject() {
    return API.del("pma-api", `/projects/${this.props.match.params.id}`);
  }

  saveProject(project) {
    return API.put("pma-api", `/projects/${this.props.match.params.id}`, {
      body: project
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isSaving: true });

    try {
      await this.saveProject({
        title: this.state.projectName,
        description: this.state.projectDesc,
        projectStatus: this.state.projectStatus
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
        "Are you sure you want to delete this project?"
      );

      if (!confirmed) {
        return;
      }

      this.setState({ isDeleting: true });

      try {
        await this.deleteProject();
        this.props.history.push("/");
      } catch (e) {
        alert(e);
        this.setState({ isDeleting: false });
      }
    }


    renderTeamList(team) {
      return [{}].concat(team).map(
        (member, i) =>
          i !== 0
            ? <LinkContainer
                key={member.userId}
                to={`/users/${member.userId}`}
              >
                <ListGroupItem header={member.firstName + " " + member.lastName + " (" + member.role + ")"}>
                  {"Added: " + new Date(member.addedAt).toLocaleString()}
                </ListGroupItem>
              </LinkContainer>
            : <LinkContainer

                to={`/projects/${this.props.match.params.id}/manage`}
              >
                <ListGroupItem>
                  <h4>
                    <b>{"\uFF0B"}</b> Manage Team
                  </h4>
                </ListGroupItem>
              </LinkContainer>
      );
    }


      renderTeam() {
        return (
          <div className="team">
            <h3>Team</h3>
            <ListGroup>
              {!this.state.isLoading && this.renderTeamList(this.state.team)}
            </ListGroup>
          </div>
        );
      }


  render() {
    return (
      <div className="ManageProject">
        <form onSubmit={this.handleSubmit}>
          <h3> Project Name </h3>
          <FormGroup controlId="projectName">
            <FormControl
              onChange={this.handleChange}
              value={this.state.projectName}
              componentClass="textarea"
              className="name"
            />
          </FormGroup>
      <h3> Description </h3>
          <FormGroup controlId="projectDesc">
            <FormControl
              onChange={this.handleChange}
              value={this.state.projectDesc}
              componentClass="textarea"
              className="desc"
            />
          </FormGroup>
      <h3> Status </h3>
        {this.state.projectStatus &&
          <DropdownButton
           key={0}
           title={this.state.projectStatus}
           id="role"
           onSelect={this.handleStatusChange}
           className="drop"
           >
            <MenuItem eventKey={0}>Active</MenuItem>
            <MenuItem eventKey={1}>Pending</MenuItem >
            <MenuItem eventKey={2}>Completed</MenuItem >

          </DropdownButton>}
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
          <LoaderButton
            block
            bsStyle="danger"
            bsSize="large"
            isLoading={this.state.isDeleting}
            onClick={this.handleDelete}
            text="Delete"
            loadingText="Deleting…"
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
