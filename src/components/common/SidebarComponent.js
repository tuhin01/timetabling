import React from "react";
import MenuItem from "./MenuItem";
import {useHistory} from "react-router-dom";
import englist from "../../utility/languages/englist";
import arabic from "../../utility/languages/arabic";
import constants from "../../utility/constants";

const SidebarComponent = ({ user }) => {
    const history = useHistory();
    const userData = JSON.parse(localStorage.getItem("user"));
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    let activePage = history.location.pathname;
    const queryParam = history.location.search;

    if (queryParam.indexOf("departmentId") > -1) {
        activePage = "/dashboard/departments";
    }

    const isDashboardActive = activePage === "/dashboard";
    const isDepartmentsActive = activePage === "/dashboard/departments";
    const isLecturerActive = activePage === "/dashboard/lecturer-list";
    const isStudentActive = activePage === "/dashboard/student-list";
    const isFacilityActive = activePage === "/dashboard/facility-list";
    const isInviteActive = activePage === "/dashboard/invite";
    const isSharableFormActive = activePage === "/dashboard/sharable-forms";

    return (
        <div className="bil-sidebar">
            <div className="bil-brand p-3">
                <i className="fa fa-calendar" aria-hidden="true" /> {language.app_title}
            </div>

            <div className="bil-welcome p-3">
                <p className="m-0">{language.welcome},</p>
                <p>{user.name}</p>
            </div>

            <div className="bil-menu">
                <p className="p-3 mt-4 mb-0 bil-menu-head">{language.general}</p>
                <div className="bil-m-list">
                    <ul className="p-0">
                        <MenuItem
                            active={isDashboardActive}
                            redirectTo="/dashboard"
                            icon="fa fa-home"
                            label={language.academic_dashboard}
                        />
                        <MenuItem
                            active={isDepartmentsActive}
                            redirectTo="/dashboard/departments"
                            icon="fa fa-university"
                            label={language.departments}
                        />
                        {/*<MenuItem*/}
                        {/*    active={isLecturerActive}*/}
                        {/*    redirectTo="/dashboard/lecturer-list"*/}
                        {/*    icon="fa fa-user"*/}
                        {/*    label={language.lecturers}*/}
                        {/*/>*/}
                        {/*<MenuItem*/}
                        {/*    active={isStudentActive}*/}
                        {/*    redirectTo="/dashboard/student-list"*/}
                        {/*    icon="fa fa-group"*/}
                        {/*    label={language.students}*/}
                        {/*/>*/}
                        {/*<MenuItem*/}
                        {/*    active={isFacilityActive}*/}
                        {/*    redirectTo="/dashboard/facility-list"*/}
                        {/*    icon="fa fa-hand-o-right"*/}
                        {/*    label={language.facilities}*/}
                        {/*/>*/}
                        <MenuItem
                            active={isInviteActive}
                            redirectTo="/dashboard/invite"
                            icon="fa fa-user-plus"
                            label={language.invite_user}
                        />
                        <MenuItem
                            active={isSharableFormActive}
                            redirectTo="/dashboard/sharable-forms"
                            icon="fa fa-share"
                            label={language.shareable_form}
                        />
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SidebarComponent;
