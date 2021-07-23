import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "studentSubjects",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
        deleted: false,
    },
    reducers: {
        studentSubjectsRequested: (studentSubjects, action) => {
            studentSubjects.loading = true;
            studentSubjects.added = false;
            studentSubjects.deleted = false;
        },
        studentSubjectsRequesteFailed: (studentSubjects, action) => {
            studentSubjects.loading = false;
        },
        studentSubjects: (studentSubjects, action) => {
            studentSubjects.list = action.payload;
            studentSubjects.loading = false;
            studentSubjects.initial = false;
        },
        setStudentInitial: (studentSubjects, action) => {
            studentSubjects.initial = true;
        },
        studentSubjectAdded: (studentSubjects, action) => {
            studentSubjects.list.push(action.payload);
            studentSubjects.loading = false;
            studentSubjects.added = true;
        },
        studentSubjectDeleted: (studentSubjects, action) => {
            studentSubjects.list = studentSubjects.list.filter(
                (studentSubject) => studentSubject._id !== action.payload._id
            );
            studentSubjects.loading = false;
            studentSubjects.deleted = true;
        },
    },
});

const {
    studentSubjects,
    studentSubjectAdded,
    studentSubjectDeleted,
    studentSubjectsRequested,
    studentSubjectsRequesteFailed,
} = slice.actions;

export default slice.reducer;

export const {setStudentInitial} = slice.actions;


// Action Creators
const url = "/students/subjects";

export const getStudentSubjects = (studentId) => {
    return apiRequestStart({
        url: url + "/?studentId=" + studentId,
        method: "GET",
        data: {},
        onStart: studentSubjectsRequested.type,
        onError: studentSubjectsRequesteFailed.type,
        onSuccess: studentSubjects.type,
    });
};

export const addStudentSubject = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: studentSubjectsRequested.type,
        onError: studentSubjectsRequesteFailed.type,
        onSuccess: studentSubjectAdded.type,
    });
};

export const deleteStudentSubject = (studentSubjectId) => {
    return apiRequestStart({
        url: url + "/remove/" + studentSubjectId,
        method: "DELETE",
        data: {},
        onStart: studentSubjectsRequested.type,
        onError: studentSubjectsRequesteFailed.type,
        onSuccess: studentSubjectDeleted.type,
    });
};
