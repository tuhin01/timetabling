import {createSlice} from "@reduxjs/toolkit";
import {apiRequestStart} from "./api";

// Reducers
const slice = createSlice({
    name: "departments",
    initialState: {
        list: [],
        initial: true,
        loading: false,
        added: false,
    },
    reducers: {
        departmentsRequested: (departments, action) => {
            departments.loading = true;
            departments.added = false;
        },
        departmentsRequesteFailed: (departments, action) => {
            departments.loading = false;
        },
        departments: (departments, action) => {
            departments.list = action.payload;
            departments.loading = false;
            departments.initial = false;
        },
        departmentAdded: (departments, action) => {
            departments.list.push(action.payload);
            departments.loading = false;
            departments.added = true;
        },
        departmentUpdated: (departments, action) => {
            const index = departments.list.findIndex((department) => department._id === action.payload._id);
            departments.list[index] = action.payload;
            departments.loading = false;
            departments.added = true;
        },
        departmentDeleted: (departments, action) => {
            departments.list = departments.list.filter((department) => department._id !== action.payload._id);
            departments.loading = false;
            departments.added = true;
        },
    },
});

const {
    departmentAdded,
    departmentUpdated,
    departmentDeleted,
    departmentsRequested,
    departmentsRequesteFailed,
} = slice.actions;

export default slice.reducer;

export const { departments } = slice.actions;



// Action Creators
const url = "/departments";

export const getDepartments = (collegeId) => {
    return apiRequestStart({
        url: url  + "/?byCollegeId=" + collegeId,
        method: "GET",
        data: {},
        onStart: departmentsRequested.type,
        onError: departmentsRequesteFailed.type,
        onSuccess: departments.type,
    });
};

export const addNewDepartment = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: departmentsRequested.type,
        onError: departmentsRequesteFailed.type,
        onSuccess: departmentAdded.type,
    });
};
export const updateDepartment = (department) => {
    const id = department._id;
    delete department._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: department,
        onStart: departmentsRequested.type,
        onError: departmentsRequesteFailed.type,
        onSuccess: departmentUpdated.type,
    });
};
export const deleteDepartment = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: departmentsRequested.type,
        onError: departmentsRequesteFailed.type,
        onSuccess: departmentDeleted.type,
    });
};
