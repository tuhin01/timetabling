import React, {useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {setError} from "../store/error";
import {getDepartments} from "../store/department";
import {addNewsubjectRequirement, getsubjectRequirements} from "../store/subjectRequirement";
import {addNewTimetable, deleteTimetable, getTimetables, setDepartmentId, setRestructure, updateTimetable,} from "../store/timetable";
import {connect} from "react-redux";
import {addNewLecturer, getLecturers} from "../store/lecturer";
import {addNewFacility, getFacilities} from "../store/facility";
import {addNewSubject, getSubjects, setMetadata} from "../store/subject";
import {updateSettings} from "../store/user";
import {addSubjectStudents, deleteSubjectStudent, getSubjectStudents} from "../store/subjectStudents";
import {getStudents} from "../store/student";
import englist from "../utility/languages/englist";
import constants from "../utility/constants";
import arabic from "../utility/languages/arabic";

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => new URLSearchParams(useLocation().search);

const TimetablePrintComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const history = useHistory();

    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;


    let urlQueryParams = useQuery();
    const departmentId = urlQueryParams.get("departmentId");

    const [timetableList, setTimetableList] = useState([]);

    /**
     * This function is responsible to create a flat list for the timetables found in the API
     */
    const __flattenTheTimetable = () => {
        let flatTimetableList = [];
        const timetableList = props.timetables.list;

        timetableList.forEach((timetable, i) => {
            const sections = timetable.sections;
            const customSubjectId = timetable.subject.customSubjectId;
            const timetableId = timetable._id;
            const credit = customSubjectId.split("-")[1];
            if (!sections) return;
            sections.forEach((section) => {
                const {
                    startTimeHour,
                    startTimeMin,
                    startTimeKey,
                    endTimeHour,
                    endTimeMin,
                    endTimeKey,
                    amPmSettings,
                } = section;

                const l1 = props.lecturers.list.find((l) => l._id === section.lecturerOne);
                let l2;
                if (section.lecturerTwo) {
                    l2 = props.lecturers.list.find((l) => l._id === section.lecturerTwo);
                }
                const facility = props.facilities.list.find((f) => f._id === section.facility);

                section.days.forEach((day, j) => {
                    let startTimeInNumber = (startTimeKey % 800) / 100 + 1;
                    let totalTimeOfClass = (endTimeKey - startTimeKey) / 100;
                    let cleanStartTimeInNUmber = startTimeInNumber;
                    for (let l = 1; l < totalTimeOfClass; l++) {
                        cleanStartTimeInNUmber += "," + (startTimeInNumber + l);
                    }
                    flatTimetableList.push({
                        facility,
                        cleanStartTimeInNUmber,
                        startTimeHour,
                        startTimeMin,
                        endTimeHour,
                        endTimeMin,
                        amPmSettings,
                        timetableId,
                        credit,
                        customSubjectId,
                        sectionId: section._id,
                        subjectId: timetable.subject._id,
                        subjectName: timetable.subject.name,
                        lecturerOne: l1,
                        lecturerTwo: l2,
                        dayKey: day.dayKey,
                        dayId: day._id,
                    });
                });
            });
        });

        let timeTableBySubjectGroup = {};
        Object.keys(flatTimetableList).forEach(function (key) {
            const timetable = flatTimetableList[key];

            timeTableBySubjectGroup[timetable.customSubjectId] =
                timeTableBySubjectGroup[timetable.customSubjectId] || {};
            timeTableBySubjectGroup[timetable.customSubjectId] = {
                customSubjectId: timetable.customSubjectId,
                subjectName: timetable.subjectName,
                lecturerOne: timetable.lecturerOne,
                lecturerTwo: timetable.lecturerTwo,
                credit: timetable.credit,
                classData: timeTableBySubjectGroup[timetable.customSubjectId].classData || [],
            };
            timeTableBySubjectGroup[timetable.customSubjectId].classData.push(timetable);
        });

        let cleanTimetableList = [];
        Object.keys(timeTableBySubjectGroup).forEach(function (key) {
            let ex = timeTableBySubjectGroup[key];
            cleanTimetableList.push(ex);
        });

        console.log({ cleanTimetableList });
        setTimetableList(cleanTimetableList);
    };

    useEffect(() => {
        __flattenTheTimetable();

        setTimeout(() => {
            window.print();
        }, 100);
    }, []);


    window.onafterprint = function () {
        console.log("Printing completed...");
        history.goBack();
    };

    const generateTdsForClassDay = (classData) => {
        let html = {
            sun: <td key="1" />,
            mon: <td key="2" />,
            tue: <td key="3" />,
            wed: <td key="4" />,
            thr: <td key="5" />,
            fri: <td key="6" />,
            sat: <td key="7" />,
        };
        classData.forEach((c, i) => {
            if (c.dayKey === "sun") {
                html.sun = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "mon") {
                html.mon = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "tue") {
                html.tue = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "wed") {
                html.wed = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "thu") {
                html.thr = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "fri") {
                html.fri = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            } else if (c.dayKey === "sat") {
                html.sat = <td key={i + c.sectionId}>{c.cleanStartTimeInNUmber}</td>;
            }
        });

        return Object.values(html);
    };

    return (
        <>
            <table className="bil-tr-print">
                <thead>
                    <tr>
                        <th style={{ backgroundColor: "black" }}>Subject ID</th>
                        <th style={{ width: "250px" }}>Subject</th>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Credits</th>
                        <th>Lecturer</th>
                        <th>Lecturer ID</th>
                    </tr>
                </thead>
                <tbody>
                    {timetableList.map((t, index) => {
                        return (
                            <tr key={index}>
                                <td>{t.customSubjectId}</td>
                                <td>{t.subjectName}</td>
                                {generateTdsForClassDay(t.classData)}
                                <td>{t.credit}</td>
                                <td>{t.lecturerOne.name}</td>
                                <td>{t.lecturerOne.customLecturerId}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
};

const mapStateToProps = (state) => ({
    students: state.students,
    facilities: state.facilities,
    lecturers: state.lecturers,
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    departments: state.departments,
    timetables: state.timetables,
    subjectStudents: state.subjectStudents,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),

    getStudents: (collegeId) => dispatch(getStudents(collegeId)),

    getLecturers: (collegeId) => dispatch(getLecturers(collegeId)),
    addNewLecturer: (lecturer) => dispatch(addNewLecturer(lecturer)),

    getFacilities: (collegeId) => dispatch(getFacilities(collegeId)),
    addNewFacility: (facility) => dispatch(addNewFacility(facility)),

    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    addNewSubjectRequirement: (subjectRequirement) => dispatch(addNewsubjectRequirement(subjectRequirement)),

    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    addNewSubject: (subject) => dispatch(addNewSubject(subject)),
    setMetadata: (metaData) => dispatch(setMetadata(metaData)),

    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getTimetables: (depertmentId) => dispatch(getTimetables(depertmentId)),
    addTimetable: (timetable) => dispatch(addNewTimetable(timetable)),
    updateTimetable: (timetable) => dispatch(updateTimetable(timetable)),
    deleteTimetable: (timetable) => dispatch(deleteTimetable(timetable)),
    setDepartmentId: (depertmentId) => dispatch(setDepartmentId(depertmentId)),
    setRestructure: (data) => dispatch(setRestructure(data)),

    updateSettings: (data) => dispatch(updateSettings(data)),

    getSubjectStudents: (subjectId) => dispatch(getSubjectStudents(subjectId)),
    addSubjectStudents: (data) => dispatch(addSubjectStudents(data)),
    deleteSubjectStudent: (subjectId) => dispatch(deleteSubjectStudent(subjectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TimetablePrintComponent);
