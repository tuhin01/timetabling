import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {setError} from "../store/error";
import {addNewShareableForm, deleteShareableForm, getShareableForms, updateShareableForm,} from "../store/shareableForm";
import {connect} from "react-redux";
import CustomSelect from "./common/CustomSelect";
import {getDepartments} from "../store/department";
import {getsubjectRequirements} from "../store/subjectRequirement";
import {getSubjects} from "../store/subject";
import {Link} from "react-router-dom";
import englist from "../utility/languages/englist";
import TimeAllocationComponent from "./common/TimeAllocationComponent";
import arabic from "../utility/languages/arabic";
import constants from "../utility/constants";

const ShareableFormComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    let sharable = {
        collegeId,
        departmentId: "",
        subjectRequirementId: "",
        subjectId: "",
    };

    let defaultSettings = {
        clockType: 12,
        firstDayOfWeek: "sun",
        timeIncrement: 30,
    };
    const sectionAmPmSettings = { startTime: language.am, endTime: language.pm };
    const [amPmSettings, setAmPmSettings] = useState(sectionAmPmSettings);

    const [settings, setSettings] = React.useState(defaultSettings);
    const [modalShow, setModalShow] = useState(false);
    const [isReservation, setIsReservation] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_shareable);
    const [errors, setErrors] = React.useState(sharable);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [itemToEdit, setItemToEdit] = useState(false);
    const [shareableForm, setShareableForm] = React.useState(sharable);

    const shareableFormSchema = {
        departmentId: Joi.string().required().trim().label("Department"),
        subjectRequirementId: Joi.string().required().trim().label("Subject requirement"),
        subjectId: Joi.string().required().trim().label("Subject"),
        collegeId: Joi.string(),
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
        setShareableForm({
            ...shareableForm,
            [input.name]: input.value,
        });
    };

    const handleSelectChange = (e) => {
        const input = e.target;
        handleChange(e);

        if (input.name === "departmentId") {
            props.getSubjectRequirements(input.value);
        }
        if (input.name === "subjectRequirementId") {
            props.getSubjects(input.value);
        }
    };

    const reStructureListsForOptions = (lists) => {
        let options = [];
        lists.forEach((item) => {
            options.push({
                label: item.title || item.name,
                value: item._id,
            });
        });
        return options;
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit({});
        setShareableForm(sharable);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: shareableFormSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(shareableForm, shareableFormSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const saveShareableForm = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewShareableForm(shareableForm);
        } else {
            await props.updateShareableForm({ ...shareableForm, _id: itemToEdit._id });
        }
    };

    const showAddShareableFormModal = () => {
        setIsReservation(false);
        setModalLabel(language.create_shareable_form);
        setItemToEdit(false);
        setModalShow(true);
    };

    const handleEdit = async (facility, reserve = false) => {
        setModalLabel(language.edit_shareable_form);
        const { name, customShareableFormId, department, subjectRequirement, subject, lecturer } = facility;

        if (reserve) {
            setIsReservation(true);
            if (department) props.getSubjectRequirements(department);
            if (subjectRequirement) props.getSubjects(subjectRequirement);
        } else {
            setIsReservation(false);
        }
        setShareableForm({
            ...shareableForm,
            name,
            customShareableFormId,
            departmentId: department,
            subjectRequirementId: subjectRequirement,
            subjectId: subject,
            lecturerId: lecturer,
        });
        setModalShow(true);
        setItemToEdit(facility);
    };

    const handleDelete = async () => {
        await props.deleteShareableForm(itemToDelete._id);
    };

    const showConfirmDialog = (row) => {
        setItemToDelete(row);
        setConfirmDialogShow(true);
    };

    /**
     * When hiding the alert dialog, we have to remove the error object in redux store
     * Otherwise the dialog will show the old error instead of new error when it occures
     */
    const hideAlertDialog = () => {
        props.setError({ errorMessage: "", statusCode: "" });
        setAlertDialogShow(false);
    };

    const columns = [
        { name: language.departments, selector: "department.name", width: "300px" },
        { name: language.subject_requirement, selector: "subjectRequirement.title", width: "230px" },
        { name: language.subject_name, selector: "subject.name", grow: 6 },
        {
            name: language.url,
            cell: (row) => {
                let redirectUrl = `/shared-form/?formId=${row._id}`;
                return (
                    <Link target="_blank" className="btn btn-sm btn-info" to={redirectUrl}>
                        {language.view_url}
                    </Link>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            center: true,
            width: "120px",
        },
        {
            name: language.delete,
            ignoreRowClick: true,
            center: true,
            cell: (row) => {
                return (
                    <>
                        <button className="bil-btn-link" onClick={() => showConfirmDialog(row)}>
                            <i className="fa fa-trash-o" aria-hidden="true" />
                        </button>
                    </>
                );
            },
        },
    ];

    useEffect(() => {
        if (props.shareableForms.initial && !props.shareableForms.loading) {
            props.getShareableForms(collegeId);
            props.getDepartments(collegeId);
        }

        setLoadingDialogShow(props.shareableForms.loading);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.shareableForms.added) {
            setModalShow(false);
            setShareableForm(sharable);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props.shareableForms]);

    return (
        <>
            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                validate={validate}
                onSave={saveShareableForm}
                label={modalLabel}
                submitBtnLabel={language.create}
            >
                <Form>
                    <CustomSelect
                        label={language.departments}
                        name="departmentId"
                        selectedValue={shareableForm.departmentId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.departments.list)}
                        onAddPress={() => false}
                    />

                    <CustomSelect
                        label={language.subject_requirement}
                        name="subjectRequirementId"
                        selectedValue={shareableForm.subjectRequirementId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.subjectRequirements.list)}
                        onAddPress={() => false}
                    />

                    <CustomSelect
                        label={language.subject}
                        name="subjectId"
                        selectedValue={shareableForm.subjectId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.subjects.list)}
                        onAddPress={() => false}
                    />
                    <TimeAllocationComponent
                        key={0}
                        settings={settings}
                        sectionIndex={0}
                        section={{ days: [], amPmSettings }}
                        onAmPmChange={() => false}
                        onFieldChange={() => false}
                        onDayChange={() => false}
                        onClose={() => false}
                        closeAble={false}
                        fullDisable={true}
                        optionsForLecturer={[]}
                        optionsForLocation={[]}
                    />
                </Form>
            </CustomModal>

            <ConfirmDialog
                label={language.confirm_dialog_label}
                show={confirmDialogShow}
                onDelete={handleDelete}
                hide={() => setConfirmDialogShow(false)}
            />

            <div className="bil-datatable-wrap">
                <DataTable
                    title={
                        <TableHeader
                            btnText={language.create_shareable_form}
                            title={language.shareable_form}
                            onClick={showAddShareableFormModal}
                        />
                    }
                    persistTableHead
                    highlightOnHover={true}
                    striped={true}
                    columns={columns}
                    data={props.shareableForms.list}
                    defaultSortField="name"
                    pagination={true}
                    paginationServerOptions={{}}
                />
            </div>

            <LoadingDialog label={language.please_wait} show={loadingDialogShow} hide={() => false} />
            <AlertDialog
                label={language.error}
                message={props.error.errorMessage}
                show={alertgDialogShow}
                hide={hideAlertDialog}
            />
        </>
    );
};
const mapStateToProps = (state) => ({
    shareableForms: state.shareableForms,
    departments: state.departments,
    subjectRequirements: state.subjectRequirements,
    subjects: state.subjects,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getShareableForms: (collegeId) => dispatch(getShareableForms(collegeId)),
    addNewShareableForm: (facility) => dispatch(addNewShareableForm(facility)),
    updateShareableForm: (facility) => dispatch(updateShareableForm(facility)),
    deleteShareableForm: (id) => dispatch(deleteShareableForm(id)),

    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareableFormComponent);
