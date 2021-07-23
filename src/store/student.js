import {createSlice} from "@reduxjs/toolkit";
import {apiRequestStart} from "./api";

// Reducers
const slice = createSlice({
    name: "students",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
    },
    reducers: {
        studentsRequested: (students, action) => {
            students.loading = true;
            students.added = false;
        },
        studentsRequesteFailed: (students, action) => {
            students.loading = false;
        },
        students: (students, action) => {
            students.list = action.payload;
            students.loading = false;
            students.initial = false;
        },
        studentAdded: (students, action) => {
            students.list.push(action.payload);
            students.loading = false;
            students.added = true;
        },
        studentUpdated: (students, action) => {
            const index = students.list.findIndex((student) => student._id === action.payload._id);
            students.list[index] = action.payload;
            students.loading = false;
            students.added = true;
        },
        studentDeleted: (students, action) => {
            students.list = students.list.filter((student) => student._id !== action.payload._id);
            students.loading = false;
            students.added = true;
        },
    },
});

const {
    students,
    studentAdded,
    studentUpdated,
    studentDeleted,
    studentsRequested,
    studentsRequesteFailed,
} = slice.actions;

export default slice.reducer;

// Action Creators
const url = "/students";

export const getStudents = (collegeId) => {
    return apiRequestStart({
        url: url + "/?byCollegeId=" + collegeId,
        method: "GET",
        data: {},
        onStart: studentsRequested.type,
        onError: studentsRequesteFailed.type,
        onSuccess: students.type,
    });
};


export const addNewStudent = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: studentsRequested.type,
        onError: studentsRequesteFailed.type,
        onSuccess: studentAdded.type,
    });
};
export const updateStudent = (student) => {
    const id = student._id;
    delete student._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: student,
        onStart: studentsRequested.type,
        onError: studentsRequesteFailed.type,
        onSuccess: studentUpdated.type,
    });
};
export const deleteStudent = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: studentsRequested.type,
        onError: studentsRequesteFailed.type,
        onSuccess: studentDeleted.type,
    });
};
