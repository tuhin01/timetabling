import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {login} from "../store/user";
import Joi from "joi-browser";
import {setError} from "../store/error";
import InputComponent from "./common/InputComponent";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {connect, useDispatch} from "react-redux";
import englist from "../utility/languages/englist";
import constants from "../utility/constants";
import arabic from "../utility/languages/arabic";

const LoginComponent = (props) => {
    const dispatch = useDispatch();
    const userData = JSON.parse(localStorage.getItem("user"));
    let language;
    if (!userData) {
        language = constants.DEFAULT_LANGUAGE === constants.ENGLISH ? englist : arabic;
    } else {
        const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
        language = appLanguage === constants.ENGLISH ? englist : arabic;
    }


    let user = { email: "", password: "" };
    const [userForm, setUserForm] = React.useState(user);
    const [errors, setErrors] = React.useState(user);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);

    const userSchema = {
        email: Joi.string().email().required().trim().label(language.login),
        password: Joi.string().min(8).max(50).required().trim().label(language.password),
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
        await props.login(userForm);
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
    if (token) return (window.location = "/");

    return (
        <main className="container bil-vertical-center">
            <div className="bil-shared-form bil-form">
                <h2 className="text-center mb-5 mt-0">
                    <i className="fa fa-calendar" aria-hidden="true" /> {language.login}
                </h2>

                <form className="form" onSubmit={handleSubmit}>
                    <InputComponent
                        label={language.email_address}
                        autoFocus={true}
                        name="email"
                        type="email"
                        value={userForm.email}
                        onChange={handleChange}
                        error={errors.email}
                    />
                    <InputComponent
                        label={language.password}
                        type="password"
                        name="password"
                        value={userForm.password}
                        error={errors.password}
                        onChange={handleChange}
                    />
                    <small
                        style={{ marginTop: "-10px", marginBottom: "15px" }}
                        className="form-text text-muted text-right"
                    >
                        <Link to="/reset-password">{language.forgot_password}</Link>
                    </small>

                    <button type="submit" disabled={validate()} className="btn btn-primary bil-btn">
                        {language.login}
                    </button>
                    <hr />
                </form>
            </div>
            <LoadingDialog label={language.please_wait} show={loadingDialogShow} />
            <AlertDialog
                label={language.error}
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
    login: (userData) => dispatch(login(userData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
