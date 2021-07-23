import React, { useEffect, useRef, useState } from "react";
import ClassboxComponent from "./common/ClassboxComponent";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import CustomSelect from "./common/CustomSelect";
import { Link, useLocation } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import SettingsComponent from "./SettingsComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import Joi from "joi-browser";
import { setError } from "../store/error";
import { getDepartments } from "../store/department";
import { addNewsubjectRequirement, getsubjectRequirements } from "../store/subjectRequirement";
import {
    addNewTimetable,
    deleteTimetable,
    getTimetables,
    setDepartmentId,
    setRestructure,
    updateTimetable,
} from "../store/timetable";
import { connect } from "react-redux";
import { addNewLecturer, getLecturers } from "../store/lecturer";
import { addNewFacility, getFacilities } from "../store/facility";
import { addNewSubject, getSubjects, setMetadata } from "../store/subject";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import { updateSettings } from "../store/user";
import { LandscapeOrientation } from "./common/LandscapeOrientationComponent";
import { addSubjectStudents, deleteSubjectStudent, getSubjectStudents } from "../store/subjectStudents";
import TableHeader from "./common/TableHeader";
import DataTable from "react-data-table-component";
import { getStudents } from "../store/student";
import Alert from "react-bootstrap/Alert";
import TimetableForm from "./common/TimetableForm";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import constants from "../utility/constants";

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => new URLSearchParams(useLocation().search);

const TimetableComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;

    let urlQueryParams = useQuery();
    const departmentId = urlQueryParams.get("departmentId");
    const department = props.departments.list.find((department) => department._id === departmentId);

    const { clockType, firstDayOfWeek, timeIncrement, appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    let defaultSettings = {
        clockType,
        firstDayOfWeek,
        timeIncrement,
        appLanguage,
    };
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    const [settings, setSettings] = React.useState(defaultSettings);
    const sectionAmPmSettings = { startTime: language.am, endTime: language.am };
    const [amPmSettings, setAmPmSettings] = useState(sectionAmPmSettings);
    const [alertLabel, setAlertLabel] = useState(language.error);

    const section = {
        facility: "",
        startTime: "",
        endTime: "",
        endTimeHour: "",
        endTimeMin: "00",
        startTimeHour: "",
        startTimeMin: "00",
        lecturerOne: "",
        lecturerTwo: "",
        amPmSettings: { ...amPmSettings },
        days: [],
        facilityList: [],
    };

    const timetable = {
        departmentId,
        subjectRequirementId: "",
        subjectId: "",
        sections: [section],
    };

    const [modalShow, setModalShow] = useState(false);
    const [studentListModal, setstudentListModalShow] = useState(false);
    const [errors, setErrors] = React.useState(timetable);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(false);
    const [timetableForm, setTimetableForm] = React.useState(timetable);
    const [timeAllocationList, setTimeAllocationList] = useState([section]);
    const [timeList, setTimeList] = useState([]);
    const [dayList, setDayList] = useState([]);

    const timetableSchema = {
        subjectRequirementId: Joi.string().min(3).required().trim().label("Subject Requirement"),
        subjectId: Joi.string().min(3).required().trim().label("Subject"),
        departmentId: Joi.string(),
        sections: Joi.array().required(),
    };

    const handleSectionAmPmSettings = (updatedSettings, sectionIndex) => {
        let timetable = JSON.parse(JSON.stringify(timetableForm));
        let allocList = JSON.parse(JSON.stringify(timeAllocationList));
        console.log({ sectionIndex });
        let index = sectionIndex - 1;
        console.log({ index });

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
        let newSection = JSON.parse(JSON.stringify(section));
        let allocList = JSON.parse(JSON.stringify(timeAllocationList));

        const dayIndex = newSection.days.findIndex((day) => day.dayKey === input.value);
        if (dayIndex > -1) {
            newSection.days.splice(dayIndex, 1);
        } else {
            newSection.days.push({ dayKey: input.value });
        }

        allocList[sectionIndex] = newSection;
        setTimeAllocationList(allocList);

        let timetable = JSON.parse(JSON.stringify(timetableForm));
        timetable.sections[sectionIndex] = newSection;
        setTimetableForm(timetable);
    };

    const handleSectionFieldChange = (e, section, sectionIndex, isEdit) => {
        const input = e.target;
        let timetable = JSON.parse(JSON.stringify(timetableForm));
        let newSection = JSON.parse(JSON.stringify(section));

        /**
         * Update facility/location based on the selected subject & lecturer
         **/
        if (input.name === "lecturerOne") {
            let subjectFacilityList = props.facilities.list.filter(
                (f) => !f.subject || f.subject === timetableForm.subjectId
            );
            newSection.facilityList = subjectFacilityList.filter((f) => !f.lecturer || f.lecturer === input.value);
        }

        if (!isEdit) {
            section.facilityList = newSection.facilityList;
            section[input.name] = input.value;
            timetable.sections[sectionIndex] = section;
            setTimetableForm({
                ...timetableForm,
                ...timetable,
            });
        } else {
            let allocList = JSON.parse(JSON.stringify(timeAllocationList));

            newSection[input.name] = input.value;
            allocList[sectionIndex] = newSection;
            setTimeAllocationList(allocList);

            timetable.sections = JSON.parse(JSON.stringify(timetable.sections));
            timetable.sections[sectionIndex] = newSection;
            setTimetableForm(timetable);
        }
    };

    const handleSelectChange = (e) => {
        const input = e.target;
        const error = { ...errors };
        const errorMessage = validateInput(input);
        if (errorMessage) {
            error[input.name] = errorMessage;
        } else {
            delete error[input.name];
        }
        setErrors(error);
        setTimetableForm({
            ...timetableForm,
            [input.name]: input.value,
        });

        if (input.name === "subjectRequirementId") {
            const subjectRequirementId = input.value;
            props.getSubjects(subjectRequirementId);
            props.setMetadata({ departmentId, subjectRequirementId });
        }
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit(false);
        const timetable = {
            departmentId,
            subjectRequirementId: "",
            subjectId: "",
            sections: [section],
        };
        setTimeAllocationList([section]);
        setTimetableForm(timetable);
    };

    const handleStudentListModalClose = () => {
        setStudentToDelete(false);
        setstudentListModalShow(false);
    };

    const addNewStudentToSubject = () => {};

    const handleSettingsUpdate = async (updatedSettings) => {
        const newSettings = { ...settings, ...updatedSettings };
        setSettings(newSettings);
        await props.updateSettings(newSettings);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: timetableSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(timetableForm, timetableSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const subjectStudentSchema = {
        departmentId: Joi.string(),
        subjectRequirementId: Joi.string(),
        subjectId: Joi.string(),
        studentId: Joi.string().min(1).max(50).required().trim().label("Student"),
    };

    const validateStudentInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: subjectStudentSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validateStudent = () => {
        const { error } = Joi.validate(subjectStudentForm, subjectStudentSchema);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const handleDelete = async () => {
        // console.log(itemToDelete);
        if (studentToDelete) {
            await props.deleteSubjectStudent(studentToDelete._id);
            setConfirmDialogShow(false);
        } else {
            await props.deleteTimetable(itemToDelete);
        }
    };

    const showConfirmDialog = () => {
        setConfirmDialogShow(true);
    };
    const showDeleteStudentConfirmDialog = (student) => {
        console.log({ student });
        setStudentToDelete(student);
        setConfirmDialogShow(true);
    };

    /**
     * When hiding the alert dialog, we have to remove the error object in redux store
     * Otherwise the dialog will show the old error instead of new error when it occures
     */
    const hideAlertDialog = () => {
        props.setError({ errorMessage: "", statusCode: "" });
        setAlertLabel(language.error);
        setAlertDialogShow(false);
    };

    const createTimeList = () => {
        let timeList = [];
        let clockType = settings.clockType;
        let timeIncrementSetttings = settings.timeIncrement === 30 ? 50 : 100;

        for (let i = 800; i < 1900; i = i + timeIncrementSetttings) {
            let timeInClock = Math.floor(i / 100);
            let time;
            let timeKey;
            let endTime;
            let amPm = clockType === 12 ? (i < 1200 ? language.am : language.pm) : "";
            // If timeInClock is greater than 12 then we need to start from 1 as clock will be set to 1 after 12
            if (clockType === 12) {
                timeInClock = timeInClock > clockType ? timeInClock - clockType : timeInClock;
            }
            // If time is an absolute hour without min
            if (i % 100 === 0) {
                time = timeInClock + ":00";
                if (settings.timeIncrement === 30) {
                    endTime = timeInClock + ":30";
                } else {
                    endTime = timeInClock + 1 + ":00";
                }
                // timeKey = timeInClock + "00";
            } else {
                time = timeInClock + ":30";
                endTime = timeInClock + 1 + ":00";
                // timeKey = timeInClock + "30";
            }
            timeKey = i;
            time = time + " " + amPm;

            if (clockType === 12) {
                // If time is 11:30AM then end time will be set to 12:00PM, but it is PM and we need update AM to PM for end time
                // If time is 11:00AM but settings.timeIncrement = 60 then end time will be set to 12:00PM, but it is PM and we need update AM to PM for end time
                if (timeKey === 1150 || (timeKey === 1100 && settings.timeIncrement === 60)) {
                    amPm = language.pm;
                }

                if (timeKey === 1250 || (timeKey === 1200 && settings.timeIncrement === 60)) {
                    endTime = "1:00";
                }
            }

            endTime = endTime + " " + amPm;
            const obj = { id: timeKey, time, timeKey, endTime, sectionList: [] };
            timeList.push(obj);
        }
        setTimeList(timeList);
    };

    /**
     * This function is responsible to create a flat list for the timetables found in the API
     */
    const __flattenTheTimetable = () => {
        let flatTimetableList = [];
        const timetableList = props.timetables.list;
        let timeInc = settings.timeIncrement === 30 ? 50 : 100;

        timetableList.forEach((timetable, i) => {
            const sections = timetable.sections;
            if (!sections) return;
            sections.forEach((section) => {
                const l1 = props.lecturers.list.find((l) => l._id === section.lecturerOne);
                let l2;
                if (section.lecturerTwo) {
                    l2 = props.lecturers.list.find((l) => l._id === section.lecturerTwo);
                }
                const facility = props.facilities.list.find((f) => f._id === section.facility);

                let {
                    startTimeKey,
                    startTimeHour,
                    startTimeMin,
                    endTimeKey,
                    endTimeHour,
                    endTimeMin,
                    amPmSettings,
                } = section;

                // If timeIncrement is 1 hour then class that start in X:30 is lost. To prevent that, startTimeKey has to be reduced to a 1h format and hence deduct 50 to make the starttime adjust with 1h
                if (timeInc === 100 && startTimeKey % 100 === 50) {
                    startTimeKey = startTimeKey - 50;
                }

                section.days.forEach((day, j) => {
                    let width = 100;
                    let marginLeft = 0;

                    let sectionEndtimeMin = parseInt(section.endTimeMin);
                    let sectionStarttimeMin = parseInt(section.startTimeMin);

                    if (
                        (sectionEndtimeMin > 0 && sectionEndtimeMin < 30) ||
                        (sectionEndtimeMin > 30 && sectionEndtimeMin < 59)
                    ) {
                        width = 90;
                    }

                    if (
                        (sectionStarttimeMin > 0 && sectionStarttimeMin < 30) ||
                        (sectionStarttimeMin > 30 && sectionStarttimeMin < 59)
                    ) {
                        marginLeft = 10;
                    }

                    // For 1 hour timeincrement
                    if (timeInc === 100) {
                        if (sectionStarttimeMin === 30) {
                            marginLeft = 10;
                        }
                        if (sectionEndtimeMin === 30) {
                            width = 90;
                        }
                    }

                    width = width - marginLeft;

                    flatTimetableList.push({
                        width,
                        marginLeft,
                        facility,
                        startTimeKey,
                        startTimeHour,
                        startTimeMin,
                        endTimeKey,
                        endTimeHour,
                        endTimeMin,
                        amPmSettings,
                        timetableId: timetable._id,
                        sectionId: section._id,
                        subjectId: timetable.subject._id,
                        customSubjectId: timetable.subject.customSubjectId,
                        subjectName: timetable.subject.name,
                        backgroundColor: timetable.subjectRequirement.color,
                        lecturerOne: l1,
                        lecturerTwo: l2,
                        dayKey: day.dayKey,
                        dayId: day._id,
                    });
                });
            });
        });

        return flatTimetableList;
    };

    const __createDays = () => {
        let daysArray = [
            { day: language.day.sun, dayKey: "sun", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.mon, dayKey: "mon", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.tue, dayKey: "tue", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.wed, dayKey: "wed", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.thu, dayKey: "thu", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.fri, dayKey: "fri", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            { day: language.day.sat, dayKey: "sat", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
        ];

        if (settings.firstDayOfWeek === "mon") {
            daysArray = [
                { day: language.day.mon, dayKey: "mon", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.tue, dayKey: "tue", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.wed, dayKey: "wed", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.thu, dayKey: "thu", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.fri, dayKey: "fri", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.sat, dayKey: "sat", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
                { day: language.day.sun, dayKey: "sun", timeList: JSON.parse(JSON.stringify(timeList)), rowList: [] },
            ];
        }
        return daysArray;
    };

    /**
     * This function creates necessary rows & sections for the timetable for a given day
     **/
    const __createRowAndSectionList = (day, flatTimetableListForDay) => {
        const timeInc = settings.timeIncrement === 30 ? 50 : 100;

        for (const time of day.timeList) {
            for (const timetableByDayElement of flatTimetableListForDay) {
                if (timetableByDayElement.startTimeKey === time.timeKey) {
                    let row = day.rowList.find((row) => row.occupiedColSpan === 0);
                    if (!row) {
                        let sectionList = [];
                        for (const timeTwo of day.timeList) {
                            if (time === timeTwo) break;
                            sectionList.push({ time: timeTwo, isEmpty: true });
                        }
                        row = { occupiedColSpan: 0, sectionList };
                        day.rowList.push(row);
                    }

                    const colSpan = Math.ceil(
                        (timetableByDayElement.endTimeKey - timetableByDayElement.startTimeKey) / timeInc
                    );
                    timetableByDayElement.colSpan = colSpan;
                    timetableByDayElement.isEmpty = false;
                    timetableByDayElement.showActionList = false;
                    row.occupiedColSpan = colSpan;
                    row.sectionList.push(timetableByDayElement);
                }
            }

            day.rowList.forEach((row) => {
                if (row.occupiedColSpan === 0) {
                    row.sectionList.push({ time, isEmpty: true });
                }
            });

            day.rowList.forEach((row) => {
                if (row.occupiedColSpan > 0) {
                    row.occupiedColSpan -= 1;
                }
            });
        }
    };

    const reStructureTimetableData = () => {
        // Create absolutely flat timetable list - start
        const flatTimetableList = __flattenTheTimetable();

        // Create absolutely flat timetable list - end
        const daysArray = __createDays();

        for (const day of daysArray) {
            let flatTimetableListForDay = flatTimetableList.filter((d) => d.dayKey === day.dayKey);
            if (flatTimetableListForDay.length > 0) {
                __createRowAndSectionList(day, flatTimetableListForDay);
            }

            if (day.rowList.length > 0) {
                day.rowList.forEach((row, i) => {
                    if (row.sectionList.every((section) => section.isEmpty)) {
                        day.rowList.splice(i);
                    }
                });
            }

            if (day.rowList.length === 0) {
                let sectionList = [];
                for (const time of day.timeList) {
                    sectionList.push({ time, isEmpty: true });
                }
                day.rowList.push({
                    occupiedColSpan: 0,
                    sectionList,
                });
            }
        }
        setDayList(daysArray);
    };

    const saveTimetable = async () => {
        let timetable = JSON.parse(JSON.stringify(timetableForm));

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

            if (section.amPmSettings.startTime === language.pm) {
                if (section.startTimeHour !== "12") section.startTimeKey = section.startTimeKey + 1200;
            }
            if (section.amPmSettings.endTime === language.pm) {
                if (section.endTimeHour !== "12") section.endTimeKey = section.endTimeKey + 1200;
            }
        });

        if (!itemToEdit) {
            if (timetable.department) {
                timetable.departmentId = timetable.department;
                delete timetable.department;
            }

            await props.addTimetable(timetable);
        } else {
            timetable.departmentId = timetable.department;

            delete timetable.department;
            delete timetable.subjectRequirement;
            delete timetable.subject;
            delete timetable.createdAt;
            delete timetable.updatedAt;
            delete timetable.__v;
            await props.updateTimetable(timetable);
        }
    };

    const classBoxClickHandler = async (time, day) => {
        const [startTimeHour, startTimeRest] = time.time.split(":");
        const [startTimeMin, startTimeAmPm] = startTimeRest.split(" ");
        const [endTimeHour, endTimeRest] = time.endTime.split(":");
        const [endTimeMin, endTimeAmPm] = endTimeRest.split(" ");

        const section = {
            facility: "",
            lecturerOne: "",
            lecturerTwo: "",
            endTimeHour,
            endTimeMin,
            startTimeHour,
            startTimeMin,
            amPmSettings: { startTime: startTimeAmPm, endTime: endTimeAmPm },
            days: [{ dayKey: day }],
        };

        const timetable = { ...timetableForm };
        timetable.sections = [];
        timetable.sections.push(section);
        setTimeAllocationList([section]);
        setTimetableForm(timetable);
        setModalShow(true);

        // Hide action list from any classbox
        classBoxActionListHandler(time);
    };

    const sectionDayDeleteHandler = (time, day) => {
        setItemToDelete(time);
        showConfirmDialog(true);
    };

    const sectionDayEditHandler = (time, day) => {
        const timetableFromStore = props.timetables.list.find((t) => t._id === time.timetableId);
        let timetable = JSON.parse(JSON.stringify(timetableFromStore));

        const subjectRequirementId = timetable.subjectRequirement._id;
        const subjectId = timetable.subject._id;
        props.getSubjects(subjectRequirementId);

        timetable.sections.map((section) => {
            let subjectFacilityList = props.facilities.list.filter((f) => !f.subject || f.subject === subjectId);
            section.facilityList = subjectFacilityList.filter((f) => !f.lecturer || f.lecturer === section.lecturerOne);
        });
        setTimeAllocationList(timetable.sections);

        setTimetableForm({
            ...timetable,
            subjectRequirementId,
            subjectId,
        });
        setItemToEdit(timetable);
        setModalShow(true);
    };

    const hanldeAnotherSection = () => {
        timetable.sections.push(section);
        const newTimeAllocationlist = [...timeAllocationList, section];
        setTimeAllocationList(newTimeAllocationlist);
    };

    const handleTimeAllocationClose = (item, i) => {
        timeAllocationList.splice(i, 1);
        setTimeAllocationList([...timeAllocationList]);

        let timetable = JSON.parse(JSON.stringify(timetableForm));
        timetable.sections.splice(i, 1);
        setTimetableForm(timetable);
    };

    const handleClassDataAddItemModal = () => {
        //setShowClassDataAddItemModal(true);
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

    const [subjectRequirementId, setSubjectRequirementId] = useState("");
    const [subjectId, setSubjectId] = useState("");

    const viewStudentList = (time) => {
        const timetableFromStore = props.timetables.list.find((t) => t._id === time.timetableId);
        setTimeAllocationList(timetableFromStore.sections);
        const subjectRequirementId = timetableFromStore.subjectRequirement._id;
        const subjectId = timetableFromStore.subject._id;

        setSubjectRequirementId(subjectRequirementId);
        setSubjectId(subjectId);

        props.getSubjectStudents(subjectId);
        setstudentListModalShow(true);
    };

    const classBoxActionListHandler = (time) => {
        const sectionId = time.sectionId;
        const dayId = time.dayId;
        let newDayList = JSON.parse(JSON.stringify(dayList));
        newDayList.map((day) => {
            day.rowList.map((row) => {
                row.sectionList.map((section) => {
                    if (time) {
                        section.showActionList = section.sectionId === sectionId && section.dayId === dayId;
                    } else {
                        section.showActionList = false;
                    }
                });
            });
        });
        setDayList(newDayList);
    };

    const studentColumns = [
        { name: language.student_id, selector: "student.customStudentId", sortable: true, grow: 2 },
        { name: language.name, selector: "student.name", sortable: true, grow: 3 },
        {
            name: language.delete,
            cell: (row) => {
                return (
                    <button className="bil-btn-link" onClick={() => showDeleteStudentConfirmDialog(row)}>
                        <i className="fa fa-trash-o" aria-hidden="true" />
                    </button>
                );
            },
            right: true,
            grow: 1,
        },
    ];

    let subjectStudent = {
        subjectId,
        departmentId,
        subjectRequirementId,
        studentId: "",
    };

    const [addStudentmodalShow, setAddStudentmodalShow] = useState(false);
    const [subjectStudentForm, setStudentSubjectForm] = useState(subjectStudent);

    const showAddStudentModal = () => {
        setAddStudentmodalShow(true);
    };
    const handleAddStudentModalClose = () => {
        setAddStudentmodalShow(false);
    };

    const saveStudentSubject = async () => {
        const errors = validateStudent();
        if (errors) return setErrors(errors);
        await props.addSubjectStudents(subjectStudentForm);
        await props.getSubjectStudents(subjectId);
    };

    const handleStudentSelectChange = (e) => {
        const input = e.target;
        const error = { ...errors };
        const errorMessage = validateStudentInput(input);
        if (errorMessage) {
            error[input.name] = errorMessage;
        } else {
            delete error[input.name];
        }
        setErrors(error);
        setStudentSubjectForm({
            ...subjectStudentForm,
            subjectRequirementId,
            subjectId,
            [input.name]: input.value,
        });
    };

    // Only for seetings update
    useEffect(() => {
        createTimeList();
        props.setRestructure(true);
    }, [settings]);

    useEffect(() => {
        if (departmentId !== props.timetables.departmentId && !props.timetables.loading) {
            createTimeList();

            // If browser is reloaded in this page then get these data from server
            // as we need to restore these for the app to work properly
            if (props.departments.list.length < 1) props.getDepartments(collegeId);
            if (props.subjectRequirements.list.length < 1) props.getSubjectRequirements(departmentId);
            if (props.lecturers.list.length < 1) props.getLecturers(collegeId);
            if (props.facilities.list.length < 1) props.getFacilities(collegeId);
            if (props.students.list.length < 1) props.getStudents(collegeId);

            // Set departmentId in redux store
            props.setDepartmentId(departmentId);

            // Get the timetable
            props.getTimetables(departmentId);
        }

        setLoadingDialogShow(props.timetables.loading);

        // Restructure the timetables only after the timetables received from the API
        if (props.timetables.restructure) {
            reStructureTimetableData();
            // Set departmentId in redux store
            props.setRestructure(false);
        }

        if (typeof props.error.errorMessage !== "string") {
            const dayMap = {
                sun: "Sunday",
                mon: "Monday",
                tue: "Tuesday",
                wed: "Wednesday",
                thu: "Thrusday",
                fri: "Friday",
            };
            const {
                lecturerId,
                facilityId,
                studentDuplicate,
                departmentId = null,
                time,
                day,
            } = props.error.errorMessage.duplicateError;
            if (props.error.errorMessage.duplicate) setAlertLabel(language.conflict_found);

            let errorProerty = "";
            if (lecturerId) {
                let lecturer = props.lecturers.list.find((l) => l._id === lecturerId);
                errorProerty = lecturer.name;
            } else if (facilityId) {
                let facility = props.facilities.list.find((f) => f._id === facilityId);
                errorProerty = facility.name;
            } else if (studentDuplicate) {
                errorProerty = "Same student(s)";
            }

            let departmentName = "this deprtment OR in another department";
            if (departmentId) {
                let duplicateDepartment = props.departments.list.find((d) => d._id === departmentId);
                if (duplicateDepartment) departmentName = duplicateDepartment.name;
            }

            const errorMessage = `${errorProerty} is already assigned at ${time} on ${dayMap[day]} in ${departmentName}`;

            props.setError({ errorMessage, statusCode: "" });
        } else if (typeof props.error.errorMessage === "string") {
            setAlertDialogShow(props.error.errorMessage !== "");
        }

        if (props.subjectStudents.added) {
            setAddStudentmodalShow(false);
            setStudentSubjectForm(subjectStudent);
        }
        if (props.subjectStudents.deleted) {
            setConfirmDialogShow(false);
            setItemToDelete(false);
        }

        if (props.timetables.added) {
            setModalShow(false);
            setItemToDelete(false);
            setConfirmDialogShow(false);
            props.getTimetables(departmentId);
            setItemToEdit(false);

            // timetable state need to be reset, otherwise next time when adding a timetable it can keep editing timetable's property
            const timetable = {
                departmentId,
                subjectRequirementId: "",
                subjectId: "",
                sections: [section],
            };
            setTimeAllocationList([section]);
            setTimetableForm(timetable);
        }
    }, [props]);

    const componentRef = useRef();

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f4f7f6" }}>
                <div style={{ display: "flex" }}>
                    <Link to="/dashboard/departments" style={{ padding: "10px 15px 0px 0px" }} className="bil-btn-link">
                        <i className="fa fa-arrow-left" aria-hidden="true" /> {language.back}
                    </Link>
                    <h4 className="mt-2 mb-2 text-center">Timetable - {department && department.name}</h4>
                    <Link
                        className="btn btn-sm btn-info mt-2 mb-2 ml-2"
                        to={"/dashboard/timetable-print/?departmentId=" + departmentId}
                    >
                        <i className="fa fa-file-pdf-o" aria-hidden="true" />
                        &nbsp; {language.print}
                    </Link>
                </div>
                <Dropdown>
                    <Dropdown.Toggle variant="button" className="btn btn-sm btn-info mt-2" id="dropdown-basic">
                        {language.settings}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <SettingsComponent onChange={handleSettingsUpdate} settings={settings} />
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/*For printing in Landscape mode by default*/}
            <LandscapeOrientation />

            <div style={{ backgroundColor: "#f4f7f6" }}>
                <Alert variant="primary" className="mb-2">
                    {language.dbl_click_info}
                </Alert>
            </div>
            <div className="bil-timetable">
                <table
                    className="table-striped"
                    style={{ backgroundColor: "white", minWidth: "100%" }}
                    ref={componentRef}
                >
                    <thead>
                        <tr className="bil-tr-time-head">
                            <th
                                className="bil-n-header-time bil-n-header-day bil-first-coulmn-both bil-header-counter"
                                scope="col"
                            />
                            {Array.from({
                                length: settings.timeIncrement === 30 ? timeList.length / 2 : timeList.length,
                            }).map((time, i) => {
                                return (
                                    <th
                                        colSpan={settings.timeIncrement === 30 ? 2 : 1}
                                        key={i}
                                        className="bil-n-header-day bil-header-counter"
                                        scope="col"
                                    >
                                        ({++i})
                                    </th>
                                );
                            })}
                        </tr>
                        <tr className="bil-tr-time-head">
                            <th className="bil-n-header-time bil-n-header-day bil-first-coulmn-both" scope="col" />
                            {timeList.map((time) => {
                                return (
                                    <th key={time.id} className="bil-n-header-day" scope="col">
                                        {time.time}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {dayList.map((day) =>
                            day.rowList.map((row, j) => {
                                return (
                                    <tr
                                        key={j}
                                        className={
                                            day.rowList.length - 1 === j ? "bil-tr-time bil-day-row" : "bil-tr-time"
                                        }
                                    >
                                        {j === 0 && (
                                            <th
                                                rowSpan={day.rowList.length}
                                                className="bil-n-header-time bil-day-row"
                                                scope="row"
                                            >
                                                {day.day}
                                            </th>
                                        )}

                                        {row.sectionList.map((section, i) => {
                                            if (section.isEmpty) {
                                                return (
                                                    <td
                                                        onClick={classBoxActionListHandler}
                                                        onDoubleClick={() =>
                                                            classBoxClickHandler(section.time, day.dayKey)
                                                        }
                                                        key={i}
                                                        className={
                                                            settings.timeIncrement === 30
                                                                ? "bil-class-td"
                                                                : "bil-class-td bil-one-hour-class-td"
                                                        }
                                                        colSpan="1"
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <td
                                                        className={
                                                            settings.timeIncrement === 30
                                                                ? "bil-class-td"
                                                                : "bil-class-td bil-one-hour-class-td"
                                                        }
                                                        key={i}
                                                        colSpan={section.colSpan}
                                                    >
                                                        <ClassboxComponent
                                                            time={section}
                                                            day={day.dayKey}
                                                            onClick={classBoxActionListHandler}
                                                            onDoubleClick={classBoxActionListHandler}
                                                            showActionList={section.showActionList}
                                                            onViewStudentList={viewStudentList}
                                                            onDelete={sectionDayDeleteHandler}
                                                            onEdit={sectionDayEditHandler}
                                                        />
                                                    </td>
                                                );
                                            }
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bil-sr-list">
                {props.subjectRequirements.list.map((sr) => {
                    return (
                        <div key={sr._id}>
                            <div
                                style={{
                                    width: "15px",
                                    height: "15px",
                                    backgroundColor: sr.color,
                                    marginRight: "15px",
                                }}
                            />
                            <div>{sr.title}</div>
                        </div>
                    );
                })}
            </div>

            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                backdrop={"static"}
                validate={() => false}
                onSave={saveTimetable}
                label={language.class_time}
            >
                <TimetableForm
                    timetableForm={timetableForm}
                    itemToEdit={itemToEdit}
                    settings={settings}
                    timeAllocationList={timeAllocationList}
                    subjectRequirementList={props.subjectRequirements.list}
                    subjectList={props.subjects.list}
                    lecturerList={props.lecturers.list}
                    onAddAnotherSection={hanldeAnotherSection}
                    onHandleSectionDayChange={handleSectionDayChange}
                    onHandleSectionFieldChange={handleSectionFieldChange}
                    onHandleSelectChange={handleSelectChange}
                    onHandleSectionAmPmSettings={handleSectionAmPmSettings}
                    onHandleTimeAllocationClose={handleTimeAllocationClose}
                />
            </CustomModal>

            <ConfirmDialog
                label={language.confirm_dialog_label}
                show={confirmDialogShow}
                onDelete={handleDelete}
                hide={() => setConfirmDialogShow(false)}
            />

            <CustomModal
                animation={true}
                validate={validate}
                show={studentListModal}
                hide={handleStudentListModalClose}
                onSave={addNewStudentToSubject}
                size="lg"
                footer={false}
                label={language.view_students}
            >
                <DataTable
                    title={
                        <TableHeader
                            btnText={language.assign_new_student}
                            title={language.subject_student}
                            onClick={showAddStudentModal}
                        />
                    }
                    persistTableHead
                    highlightOnHover={true}
                    striped={true}
                    columns={studentColumns}
                    data={props.subjectStudents.list}
                    defaultSortField="name"
                    pagination={false}
                    paginationServerOptions={{}}
                />
            </CustomModal>

            <CustomModal
                show={addStudentmodalShow}
                hide={handleAddStudentModalClose}
                validate={validateStudent}
                onSave={saveStudentSubject}
                label={language.add_student}
            >
                <Form>
                    <CustomSelect
                        label={language.students}
                        name="studentId"
                        selectedValue={subjectStudentForm.studentId}
                        onChange={handleStudentSelectChange}
                        options={reStructureListsForOptions(props.students.list)}
                        onAddPress={() => false}
                    />
                </Form>
            </CustomModal>

            <LoadingDialog label={language.please_wait} show={loadingDialogShow} hide={() => false} />
            <AlertDialog
                label={alertLabel}
                message={props.error.errorMessage}
                show={alertgDialogShow}
                hide={hideAlertDialog}
            />
        </>
    );
};

const mapStateToProps = (state) => ({
    students: state.students,
    facilities: state.facilities,
    lecturers: state.lecturers,
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    departments: state.departments,
    timetables: state.timetables,
    subjectStudents: state.subjectStudents,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),

    getStudents: (collegeId) => dispatch(getStudents(collegeId)),

    getLecturers: (collegeId) => dispatch(getLecturers(collegeId)),
    addNewLecturer: (lecturer) => dispatch(addNewLecturer(lecturer)),

    getFacilities: (collegeId) => dispatch(getFacilities(collegeId)),
    addNewFacility: (facility) => dispatch(addNewFacility(facility)),

    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    addNewSubjectRequirement: (subjectRequirement) => dispatch(addNewsubjectRequirement(subjectRequirement)),

    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    addNewSubject: (subject) => dispatch(addNewSubject(subject)),
    setMetadata: (metaData) => dispatch(setMetadata(metaData)),

    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getTimetables: (depertmentId) => dispatch(getTimetables(depertmentId)),
    addTimetable: (timetable) => dispatch(addNewTimetable(timetable)),
    updateTimetable: (timetable) => dispatch(updateTimetable(timetable)),
    deleteTimetable: (timetable) => dispatch(deleteTimetable(timetable)),
    setDepartmentId: (depertmentId) => dispatch(setDepartmentId(depertmentId)),
    setRestructure: (data) => dispatch(setRestructure(data)),

    updateSettings: (data) => dispatch(updateSettings(data)),

    getSubjectStudents: (subjectId) => dispatch(getSubjectStudents(subjectId)),
    addSubjectStudents: (data) => dispatch(addSubjectStudents(data)),
    deleteSubjectStudent: (subjectId) => dispatch(deleteSubjectStudent(subjectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TimetableComponent);
