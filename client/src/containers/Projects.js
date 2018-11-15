import React, { Component } from "react";
import { API, Storage, Auth } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel, PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import config from "../config";
import "./Projects.css";



export default class projects extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      project: null,
      team: [],
      content: "",
      attachmentURL: null
    };
  }

  async componentDidMount() {

    try {
      let attachmentURL;
      const team = await this.team();
      this.state.team = team
      const project = await this.getproject();
      const {content} = project;
      this.setState({
        project,
        content,
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

  validateForm() {
    return this.state.content.length > 0;
  }

  formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  saveProject(project) {
    return API.put("pma-api", `/projects/${this.props.match.params.id}`, {
      body: project
    });
  }

  handleSubmit = async event => {
    let attachment;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.saveProject({
        content: this.state.content,
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  deleteProject() {
    return API.del("pma-api", `/projects/${this.props.match.params.id}`);
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



  renderTeam() {
        alert(this.state.team[0].userId)
    return (
      <div className="team">
        <PageHeader>Team</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderTeamList(this.state.team)}
        </ListGroup>
      </div>
    );
  }

  renderTeamList(team) {
    return [{}].concat(team).map(
      (member, i) =>
        i !== 0
          ? <LinkContainer
              key={member.linkId}
              to={`/users/${member.linkId}`}
            >
              <ListGroupItem header={member.userId}>
                {"Created: " + new Date(member.addedAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/teams/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Add member
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }


  render() {
    return (
      <div className="projects">
        {this.state.project &&
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="content">
              <FormControl
                onChange={this.handleChange}
                value={this.state.content}
                componentClass="textarea"
              />
            </FormGroup>
            {this.state.project.attachment &&
              <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={this.state.attachmentURL}
                  >
                    {this.formatFilename(this.state.project.attachment)}
                  </a>
                </FormControl.Static>
              </FormGroup>}

            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Save"
              loadingText="Saving…"
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

            <div className="Team">
              { this.renderTeam()}
            </div>

          </form>}
      </div>
    );
  }
}
