import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "subjectStudents",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
        deleted: false,
    },
    reducers: {
        subjectStudentsRequested: (subjectStudents, action) => {
            subjectStudents.loading = true;
            subjectStudents.added = false;
            subjectStudents.deleted = false;
        },
        subjectStudentsRequesteFailed: (subjectStudents, action) => {
            subjectStudents.loading = false;
        },
        subjectStudents: (subjectStudents, action) => {
            subjectStudents.list = action.payload;
            subjectStudents.loading = false;
            subjectStudents.initial = false;
        },
        setSubjectInitial: (subjectStudents, action) => {
            subjectStudents.initial = true;
        },
        subjectStudentAdded: (subjectStudents, action) => {
            subjectStudents.list.push(action.payload);
            subjectStudents.loading = false;
            subjectStudents.added = true;
        },
        subjectStudentDeleted: (subjectStudents, action) => {
            subjectStudents.list = subjectStudents.list.filter(
                (studentSubject) => studentSubject._id !== action.payload._id
            );
            subjectStudents.loading = false;
            subjectStudents.deleted = true;
        },
    },
});

const {
    subjectStudents,
    subjectStudentAdded,
    subjectStudentDeleted,
    subjectStudentsRequested,
    subjectStudentsRequesteFailed,
} = slice.actions;

export default slice.reducer;

export const {setSubjectInitial} = slice.actions;


// Action Creators
const url = "/subjects/students";

export const getSubjectStudents = (studentId) => {
    return apiRequestStart({
        url: url + "/?subjectId=" + studentId,
        method: "GET",
        data: {},
        onStart: subjectStudentsRequested.type,
        onError: subjectStudentsRequesteFailed.type,
        onSuccess: subjectStudents.type,
    });
};

export const addSubjectStudents = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: subjectStudentsRequested.type,
        onError: subjectStudentsRequesteFailed.type,
        onSuccess: subjectStudentAdded.type,
    });
};

export const deleteSubjectStudent = (studentSubjectId) => {
    return apiRequestStart({
        url: url + "/remove/" + studentSubjectId,
        method: "DELETE",
        data: {},
        onStart: subjectStudentsRequested.type,
        onError: subjectStudentsRequesteFailed.type,
        onSuccess: subjectStudentDeleted.type,
    });
};
