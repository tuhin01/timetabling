import {createSlice} from "@reduxjs/toolkit";
import {apiRequestStart} from "./api";

// Reducers
const slice = createSlice({
    name: "subjectRequirements",
    initialState: {
        list: [],
        departmentId: "",
        loading: false,
        added: false,
    },
    reducers: {
        setDepartmentId: (subjectRequirements, action) => {
            subjectRequirements.departmentId = action.payload;
        },
        subjectRequirementsRequested: (subjectRequirements, action) => {
            subjectRequirements.loading = true;
            subjectRequirements.added = false;
        },
        subjectRequirementsRequesteFailed: (subjectRequirements, action) => {
            subjectRequirements.loading = false;
        },
        subjectRequirements: (subjectRequirements, action) => {
            subjectRequirements.list = action.payload;
            subjectRequirements.loading = false;
            subjectRequirements.initial = false;
        },
        emptySubjectRequirements: (subjectRequirements, action) => {
            subjectRequirements.list = [];
            subjectRequirements.departmentId = "";
        },
        subjectRequirementAdded: (subjectRequirements, action) => {
            subjectRequirements.list.push(action.payload);
            subjectRequirements.loading = false;
            subjectRequirements.added = true;
        },
        subjectRequirementUpdated: (subjectRequirements, action) => {
            const index = subjectRequirements.list.findIndex(
                (subjectRequirement) => subjectRequirement._id === action.payload._id
            );
            subjectRequirements.list[index] = action.payload;
            subjectRequirements.loading = false;
            subjectRequirements.added = true;
        },
        subjectRequirementDeleted: (subjectRequirements, action) => {
            subjectRequirements.list = subjectRequirements.list.filter(
                (subjectRequirement) => subjectRequirement._id !== action.payload._id
            );
            subjectRequirements.loading = false;
            subjectRequirements.added = true;
        },
    },
});

const {
    subjectRequirementAdded,
    subjectRequirementUpdated,
    subjectRequirementDeleted,
    subjectRequirementsRequested,
    subjectRequirementsRequesteFailed,
} = slice.actions;
export default slice.reducer;

export const {setDepartmentId, emptySubjectRequirements, subjectRequirements} = slice.actions;

// Action Creators
const url = "/subjectRequirements";


export const getsubjectRequirements = (departmentId) => {
    return apiRequestStart({
        url: url + "/?byDepartmentId=" + departmentId,
        method: "GET",
        data: {},
        department: setDepartmentId.type,
        onStart: subjectRequirementsRequested.type,
        onError: subjectRequirementsRequesteFailed.type,
        onSuccess: subjectRequirements.type,
    });
};

export const addNewsubjectRequirement = (data) => {
    return apiRequestStart({
        url,
        method: "POST",
        data,
        onStart: subjectRequirementsRequested.type,
        onError: subjectRequirementsRequesteFailed.type,
        onSuccess: subjectRequirementAdded.type,
    });
};
export const updatesubjectRequirement = (subjectRequirement) => {
    const id = subjectRequirement._id;
    delete subjectRequirement._id;
    return apiRequestStart({
        url: url + "/" + id,
        method: "PUT",
        data: subjectRequirement,
        onStart: subjectRequirementsRequested.type,
        onError: subjectRequirementsRequesteFailed.type,
        onSuccess: subjectRequirementUpdated.type,
    });
};
export const deletesubjectRequirement = (id) => {
    return apiRequestStart({
        url: url + "/" + id,
        method: "DELETE",
        data: {},
        onStart: subjectRequirementsRequested.type,
        onError: subjectRequirementsRequesteFailed.type,
        onSuccess: subjectRequirementDeleted.type,
    });
};
