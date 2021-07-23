import {createSlice} from "@reduxjs/toolkit";
import {apiRequestStart} from "./api";

// Reducers
const slice = createSlice({
    name: "subjects",
    initialState: {
        list: [],
        departmentId: "",
        subjectRequirementId: "",
        loading: false,
        added: false,
    },
    reducers: {
        setMetadata: (subjects, action) => {
            subjects.subjectRequirementId = action.payload.subjectRequirementId;
            subjects.departmentId = action.payload.departmentId;
        },
        subjectsRequested: (subjects, action) => {
            subjects.loading = true;
            subjects.added = false;
        },
        subjectsRequesteFailed: (subjects, action) => {
            subjects.loading = false;
        },
        subjects: (subjects, action) => {
            subjects.list = action.payload;
            subjects.loading = false;
            subjects.initial = false;
        },
        subjectAdded: (subjects, action) => {
            subjects.list.push(action.payload);
            subjects.loading = false;
            subjects.added = true;
        },
        subjectUpdated: (subjects, action) => {
            const index = subjects.list.findIndex((subject) => subject._id === action.payload._id);
            subjects.list[index] = action.payload;
            subjects.loading = false;
            subjects.added = true;
        },
        subjectDeleted: (subjects, action) => {
            subjects.list = subjects.list.filter((subject) => subject._id !== action.payload._id);
            subjects.loading = false;
            subjects.added = true;
        },
    },
});

const {
    subjectAdded,
    subjectUpdated,
    subjectDeleted,
    subjectsRequested,
    subjectsRequesteFailed,
} = slice.actions;

export default slice.reducer;

export const {setMetadata, subjects} = slice.actions;


// Action Creators
const url = "/subjects";

export const getSubjects = (subjectRequirementId) => {
    return apiRequestStart({
        url : url + "/?bySubjectRequirementId="+subjectRequirementId,
        method: "GET",
        data: {},
        onStart: subjectsRequested.type,
        onError: subjectsRequesteFailed.type,
        onSuccess: subjects.type,
    });
};

export const addNewSubject = (data) => {
    return apiRequestStart({
        url ,
        method: "POST",
        data,
        onStart: subjectsRequested.type,
        onError: subjectsRequesteFailed.type,
        onSuccess: subjectAdded.type,
    });
};
export const updateSubject = (subject) => {
    const id = subject._id;
    delete subject._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: subject,
        onStart: subjectsRequested.type,
        onError: subjectsRequesteFailed.type,
        onSuccess: subjectUpdated.type,
    });
};
export const deleteSubject = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: subjectsRequested.type,
        onError: subjectsRequesteFailed.type,
        onSuccess: subjectDeleted.type,
    });
};
