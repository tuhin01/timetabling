import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "facilities",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
    },
    reducers: {
        facilitiesRequested: (facilities, action) => {
            facilities.loading = true;
            facilities.added = false;
        },
        facilitiesRequesteFailed: (facilities, action) => {
            facilities.loading = false;
        },
        facilities: (facilities, action) => {
            facilities.list = action.payload;
            facilities.loading = false;
            facilities.initial = false;
        },
        facilityAdded: (facilities, action) => {
            facilities.list.push(action.payload);
            facilities.loading = false;
            facilities.added = true;
        },
        facilityUpdated: (facilities, action) => {
            const index = facilities.list.findIndex((facilitie) => facilitie._id === action.payload._id);
            facilities.list[index] = action.payload;
            facilities.loading = false;
            facilities.added = true;
        },
        facilityDeleted: (facilities, action) => {
            facilities.list = facilities.list.filter((facilitie) => facilitie._id !== action.payload._id);
            facilities.loading = false;
            facilities.added = true;
        },
    },
});

const {
    facilities,
    facilityAdded,
    facilityUpdated,
    facilityDeleted,
    facilitiesRequested,
    facilitiesRequesteFailed,
} = slice.actions;

export default slice.reducer;

// Action Creators
const url = "/facilities";

export const getFacilities = (collegeId) => {
    return apiRequestStart({
        url: url + "/?byCollegeId=" + collegeId,
        method: "GET",
        data: {},
        onStart: facilitiesRequested.type,
        onError: facilitiesRequesteFailed.type,
        onSuccess: facilities.type,
    });
};

export const addNewFacility = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: facilitiesRequested.type,
        onError: facilitiesRequesteFailed.type,
        onSuccess: facilityAdded.type,
    });
};
export const updateFacility = (facilitie) => {
    const id = facilitie._id;
    delete facilitie._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: facilitie,
        onStart: facilitiesRequested.type,
        onError: facilitiesRequesteFailed.type,
        onSuccess: facilityUpdated.type,
    });
};
export const deleteFacility = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: facilitiesRequested.type,
        onError: facilitiesRequesteFailed.type,
        onSuccess: facilityDeleted.type,
    });
};
