import React from "react";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import SubjectComponent from "./SubjectComponent";
import DepartmentComponent from "./DepartmentComponent";
import LecturerComponent from "./LecturerComponent";
import StudentComponent from "./StudentComponent";
import FacilityComponent from "./FacilityComponent";
import constants from "../utility/constants";
import SubjectRequirementComponent from "./SubjectRequirementComponent";

const DashboardComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    return (
        <div className="p-3">
            <h3>{language.academic_dashboard}</h3>

            <DepartmentComponent showDataSection={true} />
            <SubjectComponent showDataSection={true} />
            <SubjectRequirementComponent showDataSection={true} />
            <LecturerComponent showDataSection={true} />
            <StudentComponent showDataSection={true} />
            <FacilityComponent showDataSection={true} />
        </div>
    );
};

export default DashboardComponent;
