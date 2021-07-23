import { createSlice } from "@reduxjs/toolkit";
import { apiRequestStart } from "./api";

// Reducers
const slice = createSlice({
    name: "timetables",
    initialState: {
        list: [],
        departmentId: "",
        restructure: false,
        loading: false,
        added: false,
    },
    reducers: {
        setDepartmentId: (timetables, action) => {
            timetables.departmentId = action.payload;
            timetables.added = false;
            timetables.restructure = false;
        },
        setRestructure: (timetables, action) => {
            timetables.restructure = action.payload;
        },
        timetablesRequested: (timetables, action) => {
            timetables.loading = true;
            timetables.added = false;
            timetables.restructure = false;
        },
        timetablesRequesteFailed: (timetables, action) => {
            timetables.loading = false;
        },
        timetables: (timetables, action) => {
            timetables.list = action.payload;
            timetables.loading = false;
            timetables.restructure = true;
        },
        timetableAdded: (timetables, action) => {
            timetables.list.push(action.payload);
            timetables.loading = false;
            timetables.added = true;
        },
        timetableUpdated: (timetables, action) => {
            const index = timetables.list.findIndex(
                (timetable) => timetable._id === action.payload._id
            );
            timetables.list[index] = action.payload;
            timetables.loading = false;
            timetables.added = true;
        },
        timetableDeleted: (timetables, action) => {
            timetables.list = timetables.list.filter(
                (timetable) => timetable._id !== action.payload._id
            );
            timetables.loading = false;
            timetables.added = true;
        },
    },
});

const {
    timetables,
    timetableAdded,
    timetableUpdated,
    timetableDeleted,
    timetablesRequested,
    timetablesRequesteFailed,
} = slice.actions;
export default slice.reducer;

export const {setDepartmentId} = slice.actions;
export const {setRestructure} = slice.actions;

// Action Creators
const url = "/timetables";


export const getTimetables = (departmentId) => {
    return apiRequestStart({
        url: url + "/?byDepartmentId=" + departmentId,
        method: "GET",
        data: {},
        department: setDepartmentId.type,
        onStart: timetablesRequested.type,
        onError: timetablesRequesteFailed.type,
        onSuccess: timetables.type,
    });
};

export const addNewTimetable = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: timetablesRequested.type,
        onError: timetablesRequesteFailed.type,
        onSuccess: timetableAdded.type,
    });
};
export const updateTimetable = (timetable) => {
    const id = timetable._id;
    delete timetable._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PATCH",
        data: timetable,
        onStart: timetablesRequested.type,
        onError: timetablesRequesteFailed.type,
        onSuccess: timetableUpdated.type,
    });
};
export const deleteTimetable = (timetable) => {
    const {timetableId, sectionId, dayId} = timetable;
    return apiRequestStart({
        url: url + "/" + timetableId,
        method: "DELETE",
        data: {sectionId, dayId},
        onStart: timetablesRequested.type,
        onError: timetablesRequesteFailed.type,
        onSuccess: timetableDeleted.type,
    });
};
