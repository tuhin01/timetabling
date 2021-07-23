import React, {useEffect, useState} from "react";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {connect} from "react-redux";
import Joi from "joi-browser";
import {setError} from "../store/error";
import TimeAllocationComponent from "./common/TimeAllocationComponent";
import CustomSelect from "./common/CustomSelect";
import englist from "../utility/languages/englist";
import {addNewTimetableFromSharedForm, getShareableFormById} from "../store/shareableForm";
import {useLocation} from "react-router-dom";
import {departments} from "../store/department";
import {subjectRequirements} from "../store/subjectRequirement";
import {subjects} from "../store/subject";
import constants from "../utility/constants";
import arabic from "../utility/languages/arabic";

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => new URLSearchParams(useLocation().search);

const SharedFormComponent = (props) => {
    let urlQueryParams = useQuery();
    const formId = urlQueryParams.get("formId");
    const userData = JSON.parse(localStorage.getItem("user"));
    let language;
    if (!userData) {
        language = constants.DEFAULT_LANGUAGE;
    } else {
        const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
        language = appLanguage === constants.ENGLISH ? englist : arabic;
    }


    let defaultSettings = {
        clockType: 12,
        firstDayOfWeek: "sun",
        timeIncrement: 30,
        appLanguage: 'english',
    };

    const [settings, setSettings] = React.useState(defaultSettings);
    const [formIdState, setFormIdState] = React.useState(formId);
    const sectionAmPmSettings = { startTime: "AM", endTime: "AM" };
    const [amPmSettings, setAmPmSettings] = useState(sectionAmPmSettings);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const section = {
        startTime: "",
        endTime: "",
        endTimeHour: "",
        endTimeMin: "00",
        startTimeHour: "",
        startTimeMin: "00",
        lecturerOne: "",
        facility: "",
        amPmSettings: { ...amPmSettings },
        days: [],
    };
    const timetable = {
        departmentId: "",
        subjectRequirementId: "",
        subjectId: "",
        sections: [section],
    };

    const [timeAllocationList, setTimeAllocationList] = useState([section]);
    const [timetableForm, setTimetableForm] = React.useState(timetable);

    const timetableSchema = {
        departmentId: Joi.string().allow("", null),
        subjectRequirementId: Joi.string().allow("", null),
        subjectId: Joi.string().allow("", null),
        sections: Joi.array().required(),
    };

    const handleSectionAmPmSettings = (updatedSettings, sectionIndex) => {
        let timetable = { ...timetableForm };
        let allocList = [...timeAllocationList];
        let index = sectionIndex - 1;

        if (timetable.sections[index]) {
            let oldSettings = { ...timetable.sections[index].amPmSettings };
            timetable.sections[index].amPmSettings = { ...oldSettings, ...updatedSettings };

            allocList[index] = timetable.sections[index];
            setTimeAllocationList(allocList);

            setTimetableForm(timetable);
        }
    };

    const handleSectionDayChange = (e, section, sectionIndex) => {
        const input = e.target;
        let allocList = [...timeAllocationList];

        const dayIndex = section.days.findIndex((day) => day.dayKey === input.value);
        if (dayIndex > -1) {
            section.days.splice(dayIndex, 1);
        } else {
            section.days.push({ dayKey: input.value });
        }

        allocList[sectionIndex] = section;
        setTimeAllocationList(allocList);

        let timetable = { ...timetableForm };
        timetable.sections[sectionIndex] = section;
        setTimetableForm(timetable);
    };

    const handleSectionFieldChange = (e, section, sectionIndex) => {
        const input = e.target;
        if (input.name !== "lecturerOne" && input.name !== "facility" && +input.value !== +input.value) {
            // if is a number
            return;
        }
        let timetable = { ...timetableForm };
        let newSection = JSON.parse(JSON.stringify(section));

        let allocList = [...timeAllocationList];

        newSection[input.name] = input.value;
        allocList[sectionIndex] = newSection;
        setTimeAllocationList(allocList);

        timetable.sections = JSON.parse(JSON.stringify(timetable.sections));
        timetable.sections[sectionIndex] = newSection;
        setTimetableForm(timetable);
    };

    const handleTimeAllocationClose = (item, i) => {
        timeAllocationList.splice(i, 1);
        setTimeAllocationList([...timeAllocationList]);

        let timetable = { ...timetableForm };
        timetable.sections.splice(i, 1);
        setTimetableForm(timetable);
    };

    /**
     * When hiding the alert dialog, we have to remove the error object in redux store
     * Otherwise the dialog will show the old error instead of new error when it occures
     */
    const hideAlertDialog = () => {
        props.setError({ errorMessage: "", statusCode: "" });
        setAlertDialogShow(false);
    };

    const hanldeAnotherSection = () => {
        timetable.sections.push(section);
        const newTimeAllocationlist = [...timeAllocationList, section];
        setTimeAllocationList(newTimeAllocationlist);
    };

    const validate = () => {
        const { error } = Joi.validate(timetableForm, timetableSchema);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const reStructureListsForOptions = (lists) => {
        let options = [];
        if (lists) {
            lists.forEach((item) => {
                options.push({
                    label: item.title || item.name,
                    value: item._id,
                });
            });
        }
        return options;
    };

    const saveTimetable = async (event) => {
        event.preventDefault();

        let timetable = { ...timetableForm };

        timetable.sections.forEach((section) => {
            // Need to sort the days in sequence of week to make sure API send correct conflict data
            let daysArray = [];
            for (const day of section.days) {
                let d = day.dayKey;
                if (d === "sun") daysArray[0] = "sun";
                if (d === "mon") daysArray[1] = "mon";
                if (d === "tue") daysArray[2] = "tue";
                if (d === "wed") daysArray[3] = "wed";
                if (d === "thu") daysArray[4] = "thu";
                if (d === "fri") daysArray[5] = "fri";
                if (d === "sat") daysArray[6] = "sat";
            }

            let sortedDays = [];
            daysArray.forEach((day) => {
                if (day) sortedDays.push({ dayKey: day });
            });

            section.startTime = section.startTimeHour + section.startTimeMin;
            section.endTime = section.endTimeHour + section.endTimeMin;

            let sectionStarttimeMin = parseInt(section.startTimeMin);
            let sectionEndtimeMin = parseInt(section.endTimeMin);

            if (sectionStarttimeMin > 0 && sectionStarttimeMin < 30) {
                section.startTimeKey = parseInt(section.startTimeHour + "00");
            } else if (sectionStarttimeMin > 30 && sectionStarttimeMin < 59) {
                section.startTimeKey = parseInt(section.startTimeHour + "50");
            } else {
                section.startTimeKey = parseInt(section.startTime);
            }

            if (sectionEndtimeMin > 0 && sectionEndtimeMin < 30) {
                section.endTimeKey = parseInt(section.endTimeHour + "50");
            } else if (sectionEndtimeMin > 30 && sectionEndtimeMin < 59) {
                section.endTimeKey = parseInt(String(parseInt(section.endTimeHour) + 1) + "00");
            } else {
                section.endTimeKey = parseInt(section.endTime);
            }

            section.days = sortedDays;

            if (section.startTimeMin === "30") section.startTimeKey = section.startTimeKey + 20;
            if (section.endTimeMin === "30") section.endTimeKey = section.endTimeKey + 20;

            if (section.amPmSettings.startTime === "PM") {
                if (section.startTimeHour !== "12") section.startTimeKey = section.startTimeKey + 1200;
            }
            if (section.amPmSettings.endTime === "PM") {
                if (section.endTimeHour !== "12") section.endTimeKey = section.endTimeKey + 1200;
            }
        });

        if (timetable.department) {
            timetable.departmentId = timetable.department;
            delete timetable.department;
        }
        await props.addNewTimetableFromSharedForm(timetable);
    };

    const showSuccessMessage = () => {
        return (
            <>
                <h4 className="text-center mb-2 pt-5">
                    <i className="fa fa-calendar" aria-hidden="true" /> {language.app_title}
                </h4>
                <h2 className="text-center mb-0 pt-3">{language.thank_you}</h2>
                <p className="text-center tr-jame-error-message">{language.timetable_received_message}</p>
            </>
        );
    };

    const showErrorMessage = () => {
        return (
            <>
                <h4 className="text-center mb-2 pt-5">
                    <i className="fa fa-calendar" aria-hidden="true" /> {language.app_title}
                </h4>
                <h2 className="text-center mb-0 pt-3">{language["404"]}</h2>
                <p className="text-center tr-jame-error-message">{language.shared_form_timetable_not_found}</p>
            </>
        );
    };

    const checkFormId = () => {
      if (props.error.statusCode === 404) {
          setFormIdState("");
      }
    };

    useEffect(() => {
        if (props.shareableForms.initial && !props.shareableForms.loading) {
            props.getShareableFormById(formIdState);
        }
        const form = props.shareableForms.single;
        if (form.department) {
            props.setDepartments([form.department]);
            props.setSubjectRequirements([form.subjectRequirement]);
            props.setSubjects([form.subject]);

            const departmentId = form.department._id;
            const subjectRequirementId = form.subjectRequirement._id;
            const subjectId = form.subject._id;
            let timetable = { ...timetableForm, departmentId, subjectRequirementId, subjectId };
            setTimetableForm(timetable);
        }
        if (props.shareableForms.added) {
            setSuccessMessage(true);
            showSuccessMessage();
        }

        checkFormId();

        setLoadingDialogShow(props.shareableForms.loading);
        setAlertDialogShow(props.error.errorMessage !== "");
    }, [props.shareableForms]);

    const generateForm = () => {
        return (
            <>
                <h4 className="text-center mb-2 pt-4">
                    <i className="fa fa-calendar" aria-hidden="true" /> {language.app_title}
                </h4>

                <form className="form" onSubmit={saveTimetable}>
                    <div className="bil-form">
                        <CustomSelect
                            label={language.departments}
                            name="departmentId"
                            selectedValue={timetableForm.departmentId}
                            options={reStructureListsForOptions(props.departments.list)}
                            onChange={() => false}
                            disabled={true}
                        />

                        <CustomSelect
                            label={language.subject_requirements}
                            name="subjectRequirementId"
                            selectedValue={timetableForm.subjectRequirementId}
                            options={reStructureListsForOptions(props.subjectRequirements.list)}
                            onChange={() => false}
                            disabled={true}
                        />

                        <CustomSelect
                            label={language.subjects}
                            name="subjectId"
                            selectedValue={timetableForm.subjectId}
                            options={reStructureListsForOptions(props.subjects.list)}
                            onChange={() => false}
                            disabled={true}
                        />
                        {timeAllocationList.map((section, i) => {
                            return (
                                <TimeAllocationComponent
                                    key={i}
                                    settings={settings}
                                    sectionIndex={i}
                                    section={section}
                                    onAmPmChange={handleSectionAmPmSettings}
                                    onDayChange={(e) => handleSectionDayChange(e, section, i)}
                                    onFieldChange={(e) => handleSectionFieldChange(e, section, i)}
                                    onClose={() => handleTimeAllocationClose(section, i)}
                                    closeAble={i !== 0}
                                    noLocationAndLecturer={true}
                                />
                            );
                        })}

                        <button
                            onClick={hanldeAnotherSection}
                            type="button"
                            className="btn btn-info btn-block mt-3 mb-2"
                        >
                            <i className="fa fa-plus" aria-hidden="true" /> {language.add_another_time_slot}
                        </button>
                    </div>

                    <p className="mt-2 border-bottom" />
                    <div className="text-right" style={{ padding: "5px 30px 20px 0" }}>
                        <button type="submit" disabled={validate()} className="btn btn-primary bil-btn">
                            <i className="fa fa-floppy-o" aria-hidden="true" /> Submit
                        </button>
                    </div>
                </form>
            </>
        );
    };

    return (
        <div className="container">
            <div className="bil-shared-form">
                {formIdState && !successMessage && generateForm()}
                {formIdState && successMessage && showSuccessMessage()}
                {!formIdState && showErrorMessage()}
            </div>
            <LoadingDialog label="Please wait..." show={loadingDialogShow} hide={() => false} />
            <AlertDialog
                label="Error"
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
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    departments: state.departments,
    shareableForms: state.shareableForms,
});

const mapDispatchToProps = (dispatch) => ({
    addNewTimetableFromSharedForm: (timetable) => dispatch(addNewTimetableFromSharedForm(timetable)),
    setError: (error) => dispatch(setError(error)),
    getShareableFormById: (formId) => dispatch(getShareableFormById(formId)),
    setDepartments: (data) => dispatch(departments(data)),
    setSubjectRequirements: (data) => dispatch(subjectRequirements(data)),
    setSubjects: (data) => dispatch(subjects(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SharedFormComponent);
