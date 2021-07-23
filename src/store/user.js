import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "user",
    initialState: {
        data: {},
        loading: false,
    },
    reducers: {
        authenticated: (user, action) => {
            user.data = action.payload;
        },
        defaultDataAdded: (user, action) => {
            user.loading = false;
        },
        updated: (user, action) => {
            user.data = action.payload;
            user.loading = false;
        },
        invited: (user, action) => {
            user.loading = false;
        },
        authRequested: (user, action) => {
            user.loading = true;
        },
        authRequesteFailed: (user, action) => {
            user.loading = false;
        },
    },
});

const { authenticated, updated, invited, defaultDataAdded, authRequested, authRequesteFailed } = slice.actions;

export default slice.reducer;

// Action Creators
const authUrl = "/auth";
const userUrl = "/users";

export const login = (data) => {
    return apiRequestStart({
        url: authUrl,
        method: "post",
        data,
        onStart: authRequested.type,
        onError: authRequesteFailed.type,
        onSuccess: authenticated.type,
    });
};
export const updateSettings = (data) => {
    return apiRequestStart({
        url: userUrl + "/updateSettings",
        method: "put",
        data,
        onStart: authRequested.type,
        onError: authRequesteFailed.type,
        onSuccess: updated.type,
    });
};
export const update = (data) => {
    return apiRequestStart({
        url: userUrl + "/me",
        method: "put",
        data,
        onStart: authRequested.type,
        onError: authRequesteFailed.type,
        onSuccess: updated.type,
    });
};

export const invite = (data) => {
    return apiRequestStart({
        url: userUrl + "/invite",
        method: "post",
        data,
        onStart: authRequested.type,
        onError: authRequesteFailed.type,
        onSuccess: invited.type,
    });
};

export const register = (data) => {
    return apiRequestStart({
        url: userUrl,
        method: "post",
        data,
        onStart: authRequested.type,
        onError: authRequesteFailed.type,
        onSuccess: authenticated.type,
    });
};
export const addDefaultDataForCollege = () => {
    return apiRequestStart({
        url: userUrl + "/addDefaultDataForCollege",
        method: "post",
        data: {},
        onStart: authRequested.type,
        onSuccess: defaultDataAdded.type,
    });
};
