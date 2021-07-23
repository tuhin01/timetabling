import { createSlice } from "@reduxjs/toolkit";

// Reducers
const slice = createSlice({
    name: "error",
    initialState: {
        data: { errorMessage: "", statusCode: "" },
    },
    reducers: {
        setError: (error, action) => {
            error.data = action.payload;
        },
    },
});
export const { setError } = slice.actions;

export default slice.reducer;
