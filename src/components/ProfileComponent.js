import React, {useEffect, useState} from "react";
import InputComponent from "./common/InputComponent";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {update, updateSettings} from "../store/user";
import {connect} from "react-redux";
import Joi from "joi-browser";
import {setError} from "../store/error";
import englist from "../utility/languages/englist";
import CustomSelect from "./common/CustomSelect";
import arabic from "../utility/languages/arabic";
import constants from "../utility/constants";

const ProfileComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const { name, email } = userData;

    const { clockType, firstDayOfWeek, timeIncrement, appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    let defaultSettings = {
        clockType,
        firstDayOfWeek,
        timeIncrement,
        appLanguage,
    };
    const [settings, setSettings] = React.useState(defaultSettings);

    const language = appLanguage === constants.ENGLISH ? englist : arabic;
    const languages = [
        { value: "english", label: language.language_english },
        { value: "arabic", label: language.language_arabic },
    ];

    let user = { name, email, password: "" };
    const [userForm, setUserForm] = React.useState(user);

    const [errors, setErrors] = React.useState({ name: "", email: "", password: "" });
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);

    const userSchema = {
        name: Joi.string().required().trim().label(language.name),
        email: Joi.string().email().required().trim().label(language.email_address),
        password: Joi.string().allow("", null).min(8).max(50).trim().label(language.password),
    };

    const handleSettingsUpdate = async (e) => {
        const input = e.target;
        const newSettings = { ...settings, appLanguage: input.value };
        setSettings(newSettings);
        await props.updateSettings(newSettings);
        window.location.reload();
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
        console.log({ error });

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
        await props.update(userForm);
    };

    /**
     * When hiding the alert dialog, we have to remove the error object in redux store
     * Otherwise the dialog will show the old error instead of new error when it occures
     */
    const hideAlertDialog = () => {
        props.setError({ errorMessage: "", statusCode: "" });
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

    return (
        <div className="container">
            <div className="col-6 offset-3">
                <h4 className="text-center mb-5 mt-3">{language.app_language}</h4>
                <CustomSelect
                    label={language.app_language}
                    name="appLanguage"
                    selectedValue={settings.appLanguage}
                    options={languages}
                    onChange={handleSettingsUpdate}
                />
                <h4 className="text-center mb-5 mt-5">{language.edit_profile}</h4>
                <form className="form" onSubmit={handleSubmit}>
                    <InputComponent
                        label={language.name}
                        autoFocus={true}
                        name="name"
                        type="text"
                        value={userForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />

                    <InputComponent
                        label={language.email_address}
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

                    <button type="submit" disabled={validate()} className="btn btn-primary bil-btn">
                        <i className="fa fa-floppy-o" aria-hidden="true" /> {language.save}
                    </button>
                </form>
            </div>
            <LoadingDialog label={language.please_wait} show={loadingDialogShow} hide={() => false} />
            <AlertDialog
                label={language.error}
                message={props.error.errorMessage}
                show={alertgDialogShow}
                hide={hideAlertDialog}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    update: (userData) => dispatch(update(userData)),
    setError: (error) => dispatch(setError(error)),
    updateSettings: (data) => dispatch(updateSettings(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileComponent);
