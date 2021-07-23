import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "lecturers",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
    },
    reducers: {
        lecturersRequested: (lecturers, action) => {
            lecturers.loading = true;
            lecturers.added = false;
        },
        lecturersRequesteFailed: (lecturers, action) => {
            lecturers.loading = false;
        },
        lecturers: (lecturers, action) => {
            lecturers.list = action.payload;
            lecturers.loading = false;
            lecturers.initial = false;
        },
        lecturerAdded: (lecturers, action) => {
            lecturers.list.push(action.payload);
            lecturers.loading = false;
            lecturers.added = true;
        },
        lecturerUpdated: (lecturers, action) => {
            const index = lecturers.list.findIndex((lecturer) => lecturer._id === action.payload._id);
            lecturers.list[index] = action.payload;
            lecturers.loading = false;
            lecturers.added = true;
        },
        lecturerDeleted: (lecturers, action) => {
            lecturers.list = lecturers.list.filter((lecturer) => lecturer._id !== action.payload._id);
            lecturers.loading = false;
            lecturers.added = true;
        },
    },
});

const {
    lecturers,
    lecturerAdded,
    lecturerUpdated,
    lecturerDeleted,
    lecturersRequested,
    lecturersRequesteFailed,
} = slice.actions;

export default slice.reducer;

// Action Creators
const url = "/lecturers";

export const getLecturers = (collegeId) => {
    return apiRequestStart({
        url: url + "/?byCollegeId=" + collegeId,
        method: "GET",
        data: {},
        onStart: lecturersRequested.type,
        onError: lecturersRequesteFailed.type,
        onSuccess: lecturers.type,
    });
};

export const addNewLecturer = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: lecturersRequested.type,
        onError: lecturersRequesteFailed.type,
        onSuccess: lecturerAdded.type,
    });
};
export const updateLecturer = (lecturer) => {
    const id = lecturer._id;
    delete lecturer._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: lecturer,
        onStart: lecturersRequested.type,
        onError: lecturersRequesteFailed.type,
        onSuccess: lecturerUpdated.type,
    });
};
export const deleteLecturer = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: lecturersRequested.type,
        onError: lecturersRequesteFailed.type,
        onSuccess: lecturerDeleted.type,
    });
};
