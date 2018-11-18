import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import AppliedRoute from "./components/AppliedRoute";
import Signup from "./containers/Signup";
import NewProject from "./containers/NewProject";
import ManageTeam from "./containers/ManageTeam";
import ManageProject from "./containers/ManageProject";
import Projects from "./containers/Projects";
import Users from "./containers/Users";
import EditUser from "./containers/EditUser";
import Search from "./containers/Search";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";


export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
    <AuthenticatedRoute path="/projects/new" exact component={NewProject} props={childProps} />
    <AuthenticatedRoute path="/projects/:id" exact component={Projects} props={childProps} />
    <AuthenticatedRoute path="/projects/:id/manage" exact component={ManageTeam} props={childProps} />
    <AuthenticatedRoute path="/projects/:id/edit" exact component={ManageProject} props={childProps} />
    <AuthenticatedRoute path="/users/:id/" exact component={Users} props={childProps} />
    <AuthenticatedRoute path="/users/:id/edit" exact component={EditUser} props={childProps} />
    <AuthenticatedRoute path="/search/:type/:search" exact component={Search} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;
