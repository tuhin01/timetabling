import React, { useEffect, useState } from "react";
import Joi from "joi-browser";
import {Link, Redirect} from "react-router-dom";
import {addDefaultDataForCollege, register} from "../store/user";
import InputComponent from "./common/InputComponent";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import { setError } from "../store/error";
import { connect, useDispatch } from "react-redux";

const RegisterComponent = props => {
    const dispatch = useDispatch();

    let user = { name: "", email: "", password: "" };
    const [userForm, setUserForm] = React.useState(user);
    const [errors, setErrors] = React.useState(user);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);

    const userSchema = {
        name: Joi.string().required().trim().label("Name"),
        email: Joi.string().email().required().trim().label("Email"),
        password: Joi.string().min(8).max(50).required().trim().label("Password"),
    };

    const handleChange = (e) => {
        const input = e.target;
        const error = { ...errors };
        const errorMessage = validateInput(input);
        if (errorMessage) {
            error[input.name] = errorMessage;
        } else {
            delete error[input.name];
        }
        setErrors(error);
        setUserForm({
            ...userForm,
            [input.name]: input.value,
        });
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: userSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(userForm, userSchema, options);

        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validate();
        if (errors) return setErrors(errors);

        /* Call the register API */
        await props.register(userForm);
        await props.addDefaultDataForCollege();
    };

    /**
     * When hiding the alert dialog, we have to remove the error object in redux store
     * Otherwise the dialog will show the old error instead of new error when it occures
     */
    const hideAlertDialog = () => {
        dispatch({ type: setError.type, payload: { errorMessage: "", statusCode: "" } });
        setAlertDialogShow(false);
    };

    useEffect(() => {
        setLoadingDialogShow(props.user.loading);
        if (props.error.errorMessage !== "") {
            setAlertDialogShow(true);
        } else {
            setAlertDialogShow(false);
        }
    }, [props]);

    // Before doing anything, check if there is already a token.
    // If token found then redirect to dashboard
    const token = localStorage.getItem("token");
    if (token) return <Redirect to="/" />;

    return (
        <main className="container">
            <div className="login">
                <h2 className="text-center mb-5 mt-3">Register</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <InputComponent
                        label="Name"
                        autoFocus={true}
                        name="name"
                        type="text"
                        value={userForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />

                    <InputComponent
                        label="Email address"
                        name="email"
                        type="email"
                        value={userForm.email}
                        onChange={handleChange}
                        error={errors.email}
                        helpText="We'll never share your email with anyone else."
                    />
                    <InputComponent
                        label="Password"
                        type="password"
                        name="password"
                        value={userForm.password}
                        error={errors.password}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={validate()} className="btn btn-primary bil-btn">
                        Register
                    </button>
                    <hr />
                    <small className="text-center m-2">
                        Already have account? <br /> <Link to="/login">Login</Link>
                    </small>
                </form>
            </div>
            <LoadingDialog label="Please wait..." show={loadingDialogShow} hide={() => false} />
            <AlertDialog
                label="Error"
                message={props.error.errorMessage}
                show={alertgDialogShow}
                hide={hideAlertDialog}
            />
        </main>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    register: (userData) => dispatch(register(userData)),
    addDefaultDataForCollege: () => dispatch(addDefaultDataForCollege()),
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterComponent);
