import axios from "axios";
import * as actions from "../api";
import {setError} from "../error";

const api = ({ dispatch }) => (next) => async (action) => {
    if (action.type !== actions.apiRequestStart.type) return next(action);

    // Call the api here
    const { url, method, data, onSuccess, onStart, onError } = action.payload;

    // For Loading indecator
    if (onStart) dispatch({ type: onStart });

    next(action);

    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.post["Accept"] = "application/json";

    /* Check if a token is found in localstorage */
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers["X-Auth-Token"] = token;

    // const baseURL = "https://hidden-lake-59993.herokuapp.com/api";
    // const baseURL = "http://localhost:3400/api";
    const baseURL = "http://ec2-18-224-182-69.us-east-2.compute.amazonaws.com:3400/api";
    try {
        const response = await axios.request({baseURL, url, method, data});

        // General success
        dispatch(actions.apiRequestSuccess());

        // Specific success
        if (onSuccess) {
            if (onSuccess === "user/authenticated") {
                const token = response.headers["x-auth-token"];
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(response.data));
            } else if(onSuccess === "user/updated") {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            dispatch({ type: onSuccess, payload: response.data });
        }
    } catch (error) {
        // General error
        dispatch(actions.apiRequestFailed());
        if (error.response && error.response.data) {
            dispatch({
                type: setError.type,
                payload: { errorMessage: error.response.data, statusCode: error.response.status },
            });

            // Specific error
            if (onError) {
                dispatch({ type: onError, payload: error.response.data });
            }
        } else {
            dispatch({ type: setError.type, payload: { errorMessage: "Something went wrong. Please contact the side admin.", statusCode: "" } });
        }
    }
};

export default api;
