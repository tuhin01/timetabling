import {createSlice} from "@reduxjs/toolkit";
import {apiRequestStart} from "./api";

// Reducers
const slice = createSlice({
    name: "shareableForms",
    initialState: {
        list: [],
        single: {},
        initial: true,
        loading: false,
        added: false,
    },
    reducers: {
        shareableFormsRequested: (shareableForms, action) => {
            shareableForms.loading = true;
            shareableForms.added = false;
        },
        shareableFormsRequesteFailed: (shareableForms, action) => {
            shareableForms.loading = false;
            shareableForms.initial = false;
        },
        shareableForms: (shareableForms, action) => {
            shareableForms.list = action.payload;
            shareableForms.loading = false;
            shareableForms.initial = false;
        },
        shareableFormById: (shareableForms, action) => {
            shareableForms.single = action.payload;
            shareableForms.loading = false;
            shareableForms.initial = false;
        },
        shareableFormAdded: (shareableForms, action) => {
            shareableForms.list.push(action.payload);
            shareableForms.loading = false;
            shareableForms.added = true;
        },
        shareableFormUpdated: (shareableForms, action) => {
            const index = shareableForms.list.findIndex((facilitie) => facilitie._id === action.payload._id);
            shareableForms.list[index] = action.payload;
            shareableForms.loading = false;
            shareableForms.added = true;
        },
        shareableFormDeleted: (shareableForms, action) => {
            shareableForms.list = shareableForms.list.filter((facilitie) => facilitie._id !== action.payload._id);
            shareableForms.loading = false;
            shareableForms.added = true;
        },
    },
});

const {
    shareableForms,
    shareableFormById,
    shareableFormAdded,
    shareableFormUpdated,
    shareableFormDeleted,
    shareableFormsRequested,
    shareableFormsRequesteFailed,
} = slice.actions;

export default slice.reducer;

// Action Creators
const url = "/shareable-forms";

export const getShareableForms = (collegeId) => {
    return apiRequestStart({
        url: url + "/?byCollegeId=" + collegeId,
        method: "GET",
        data: {},
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableForms.type,
    });
};
export const getShareableFormById = (formId) => {
    return apiRequestStart({
        url: url + "/" + formId,
        method: "GET",
        data: {},
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableFormById.type,
    });
};
export const addNewTimetableFromSharedForm = (data) => {
    return apiRequestStart({
        url: "/timetables/shared-form",
        method: "POST",
        data,
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableFormAdded.type,
    });
};

export const addNewShareableForm = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableFormAdded.type,
    });
};
export const updateShareableForm = (facilitie) => {
    const id = facilitie._id;
    delete facilitie._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: facilitie,
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableFormUpdated.type,
    });
};
export const deleteShareableForm = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: shareableFormsRequested.type,
        onError: shareableFormsRequesteFailed.type,
        onSuccess: shareableFormDeleted.type,
    });
};
