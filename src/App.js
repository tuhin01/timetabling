import React from "react";
import "./App.css";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import LoginComponent from "./components/LoginComponent";
import NotFound from "./components/NotFound";
// import RegisterComponent from "./components/RegisterComponent";
import MainComponent from "./components/MainComponent";
import ForgetPasswordComponent from "./components/ForgetPasswordComponent";
import configureStore from "./store/configureStore";
import {Provider} from "react-redux";
import SharedFormComponent from "./components/SharedFormComponent";

/**
 * This is the startup function which is called when the app starts
 * Redux store is configured here in  <Provider store={}> component
 * Routing for the app is configured here as well
 **/
function App() {
    const store = configureStore();

    return (
        <Provider store={store}>
            <Router>
                <Switch>
                    {/*<Route exact path="/register">*/}
                    {/*    <RegisterComponent />*/}
                    {/*</Route>*/}
                    <Route exact path="/login">
                        <LoginComponent />
                    </Route>
                    <Route exact path="/reset-password">
                        <ForgetPasswordComponent />
                    </Route>
                    <Route exact path="/shared-form">
                        <SharedFormComponent />
                    </Route>
                    <Route path="/">
                        <MainComponent />
                    </Route>
                    <Route exact path="/not-found">
                        <NotFound />
                    </Route>
                    <Route exact path="">
                        <MainComponent />
                    </Route>
                    <Redirect to="/not-found">
                        <NotFound />
                    </Redirect>
                </Switch>
            </Router>
        </Provider>
    );
}

export default App;
