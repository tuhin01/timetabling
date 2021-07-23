import React, {useState} from "react";
import SidebarComponent from "./common/SidebarComponent";
import TopbarComponent from "./common/TopbarComponent";
import {Redirect, Route, Switch} from "react-router-dom";
import TimetableComponent from "./TimetableComponent";
import SubjectRequirementComponent from "./SubjectRequirementComponent";
import SubjectComponent from "./SubjectComponent";
import LecturerComponent from "./LecturerComponent";
import StudentComponent from "./StudentComponent";
import FacilityComponent from "./FacilityComponent";
import NotFound from "./NotFound";
import DepartmentComponent from "./DepartmentComponent";
import DashboardComponent from "./DashboardComponent";
import jwt from "jsonwebtoken";
import ProfileComponent from "./ProfileComponent";
import UserInviteComponent from "./UserInviteComponent";
import StudentDetailComponent from "./StudentDetailComponent";
import SubjectDetailsComponent from "./SubjectDetailComponent";
import SharableFormComponent from "./ShareableFormComponent";
import TimetablePrintComponent from "./TimetablePrintComponent";

function MainComponent() {
    const userData = JSON.parse(localStorage.getItem("user"));

    let sidebar = localStorage.getItem("sidebarOpen");
    if (!sidebar) {
        sidebar = "open";
    }
    const [sidebarOpen, setSidebarOpen] = useState(sidebar);

    const handleHanburgerMenu = () => {
        let s = sidebar === "open" ? "closed" : "open";
        localStorage.setItem("sidebarOpen", s);
        setSidebarOpen(s);
    };

    // Before doing anything, check if there is already a token.
    // If token found then redirect to dashboard
    const token = localStorage.getItem("token");
    if (!token) return (window.location = "/login");

    const dateNow = Math.floor(Date.now() / 1000);
    const decodedToken = jwt.decode(token);
    if (decodedToken.exp < dateNow) {
        localStorage.removeItem("token");
        window.location = "/login";
    }

    return (
        <main className="bil-dashboard">
            {sidebarOpen === "open" && <SidebarComponent user={userData} />}
            <div className="bil-main-content">
                <TopbarComponent user={userData} onBarsPress={handleHanburgerMenu} />
                <div className="bil-main-content-body">
                    <Switch>
                        <Route exact path="/">
                            <Redirect to="/dashboard">
                                <DashboardComponent />
                            </Redirect>
                        </Route>
                        <Route exact path="/dashboard">
                            <DashboardComponent />
                        </Route>
                        <Route exact path="/dashboard/profile">
                            <ProfileComponent />
                        </Route>
                        <Route exact path="/dashboard/invite">
                            <UserInviteComponent />
                        </Route>
                        <Route exact path="/dashboard/subject-requirements">
                            <SubjectRequirementComponent />
                        </Route>
                        <Route exact path="/dashboard/subject-list">
                            <SubjectComponent />
                        </Route>
                        <Route exact path="/dashboard/departments">
                            <DepartmentComponent />
                        </Route>
                        <Route exact path="/dashboard/timetable/">
                            <TimetableComponent />
                        </Route>
                        <Route exact path="/dashboard/timetable-print/">
                            <TimetablePrintComponent />
                        </Route>
                        <Route exact path="/dashboard/subjects/">
                            <SubjectComponent/>
                        </Route>
                        <Route exact path="/dashboard/subject-details/">
                            <SubjectDetailsComponent />
                        </Route>
                        <Route exact path="/dashboard/lecturer-list">
                            <LecturerComponent/>
                        </Route>
                        <Route exact path="/dashboard/student-list">
                            <StudentComponent/>
                        </Route>
                        <Route exact path="/dashboard/student">
                            <StudentDetailComponent/>
                        </Route>
                        <Route exact path="/dashboard/facility-list">
                            <FacilityComponent/>
                        </Route>
                        <Route exact path="/dashboard/sharable-forms">
                            <SharableFormComponent/>
                        </Route>
                        <Route exact path="/dashboard/not-found">
                            <NotFound/>
                        </Route>
                        <Redirect to="/dashboard/not-found">
                            <NotFound/>
                        </Redirect>
                    </Switch>
                </div>
            </div>
        </main>
    );
}

export default MainComponent;
