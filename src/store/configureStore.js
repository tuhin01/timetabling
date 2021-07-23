import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import api from "./middleware/api";
import {combineReducers} from "redux";
import lectureReducer from "./lecturer";
import facilityReducer from "./facility";
import shareableFormReducer from "./shareableForm";
import studentReducer from "./student";
import studentSubjectReducer from "./studentSubjects";
import subjectStudentsReducer from "./subjectStudents";
import departmentReducer from "./department";
import subjectRequirementReducer from "./subjectRequirement";
import subjectReducer from "./subject";
import timetableReducer from "./timetable";
import userReducer from "./user";
import errorReducer from "./error";

const reducer = combineReducers({
    lecturers: lectureReducer,
    facilities: facilityReducer,
    shareableForms: shareableFormReducer,
    students: studentReducer,
    studentSubjects: studentSubjectReducer,
    subjectStudents: subjectStudentsReducer,
    subjectRequirements: subjectRequirementReducer,
    subjects: subjectReducer,
    timetables: timetableReducer,
    departments: departmentReducer,
    user: userReducer,
    error: errorReducer,
});

export default function () {
    return configureStore({
        reducer,
        middleware: [...getDefaultMiddleware(), api],
    });
}
