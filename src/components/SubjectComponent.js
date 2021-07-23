import React, {useEffect, useState} from "react";
import {Link, useHistory, useLocation} from "react-router-dom";
import Form from "react-bootstrap/Form";
import CustomModal from "./common/CustomModal";
import InputComponent from "./common/InputComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {setError} from "../store/error";
import {addNewSubject, deleteSubject, getSubjects, setMetadata, updateSubject} from "../store/subject";
import {connect} from "react-redux";
import {getDepartments} from "../store/department";
import {getsubjectRequirements, setDepartmentId} from "../store/subjectRequirement";
import {setSubjectInitial} from "../store/subjectStudents";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import Button from "react-bootstrap/Button";
import CustomSelect from "./common/CustomSelect";
import constants from "../utility/constants";

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => new URLSearchParams(useLocation().search);

const SubjectComponent = (props) => {
    const history = useHistory();
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;

    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    const urlQueryParams = useQuery();
    const departmentId = urlQueryParams.get("departmentId");
    const subjectRequirementId = urlQueryParams.get("subjectRequirementId");

    const department = props.departments.list.find((department) => department._id === departmentId);
    const subjectRequirement = props.subjectRequirements.list.find((sr) => sr._id === subjectRequirementId);

    const subject = {
        subjectRequirementId,
        name: "",
        customSubjectId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [errors, setErrors] = React.useState(subject);
    const [modalLabel, setModalLabel] = useState(language.add_subject);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(false);
    const [subjectForm, setSubjectForm] = React.useState(subject);
    const [showDataSectionDepartmentId, setShowDataSectionDepartmentId] = React.useState("");

    const subjectSchema = {
        name: Joi.string().min(3).required().trim().label(language.name),
        customSubjectId: Joi.string().min(3).required().trim().label(language.subject_id),
        subjectRequirementId: Joi.string(),
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
        setSubjectForm({
            ...subjectForm,
            [input.name]: input.value,
        });
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit(false);
        setSubjectForm(subject);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: subjectSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(subjectForm, subjectSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const addSubject = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewSubject(subjectForm);
        } else {
            await props.updateSubject({ ...subjectForm, _id: itemToEdit._id });
        }
    };

    const showAddSubjectModal = () => {
        setModalLabel(language.add_subject);
        setModalShow(true);
    };

    const handleEdit = async (subject) => {
        setModalLabel(language.edit_subject);
        const { name, customSubjectId } = subject;
        setSubjectForm({ ...subjectForm, name, customSubjectId });
        setModalShow(true);
        setItemToEdit(subject);
    };

    const handleDelete = async () => {
        await props.deleteSubject(itemToDelete._id);
    };

    const showConfirmDialog = (row) => {
        setItemToDelete(row);
        setConfirmDialogShow(true);
    };

    /**
     * This is used only when "props.showDataSection" is set to true
     **/
    const handleSelectChange = (e) => {
        const input = e.target;

        if (input.name === "departmentId") {
            props.getSubjectRequirements(input.value);
            setShowDataSectionDepartmentId(input.value);
        }
        if (input.name === "subjectRequirementId") {
            handleChange(e);
        }
    };

    /**
     * This is used only when "props.showDataSection" is set to true
     **/
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

    /**
     * This is used only when "props.showDataSection" is set to true
     **/
    const getDataSection = () => {
        return (
            <>
                <div className="row pt-1">
                    <div className="col-4">
                        <p style={{ fontSize: "20px" }}>{language.subjects}</p>
                    </div>
                    <div className="col-2 text-left">
                        <Button onClick={showAddSubjectModal} variant="info" size="sm">
                            <i className="fa fa-plus pr-2" aria-hidden="true" />
                            {language.add}
                        </Button>
                    </div>
                </div>

                <CustomModal
                    show={modalShow}
                    hide={handleModalClose}
                    validate={validate}
                    onSave={addSubject}
                    label={modalLabel}
                >
                    <Form>
                        <CustomSelect
                            label={language.departments}
                            name="departmentId"
                            selectedValue={showDataSectionDepartmentId}
                            onChange={handleSelectChange}
                            options={reStructureListsForOptions(props.departments.list)}
                            onAddPress={() => false}
                        />

                        <CustomSelect
                            label={language.subject_requirement}
                            name="subjectRequirementId"
                            selectedValue={subjectForm.subjectRequirementId}
                            onChange={handleSelectChange}
                            options={reStructureListsForOptions(props.subjectRequirements.list)}
                            onAddPress={() => false}
                        />
                        <InputComponent
                            label={language.name}
                            name="name"
                            autoFocus={true}
                            placeholder={language.ex_cse}
                            type="text"
                            value={subjectForm.name}
                            onChange={handleChange}
                            error={errors.name}
                        />
                        <InputComponent
                            label={language.subject_id}
                            name="customSubjectId"
                            placeholder="Ex - AWU65"
                            type="text"
                            value={subjectForm.customSubjectId}
                            onChange={handleChange}
                            error={errors.customSubjectId}
                        />
                    </Form>
                </CustomModal>
            </>
        );
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
        {
            name: language.name,
            cell: (row) => {
                let redirectUrl = `/dashboard/subject-details/?departmentId=${departmentId}&subjectRequirementId=${subjectRequirementId}&subjectId=${row._id}`;
                return (
                    <Link className="btn-link black" to={redirectUrl}>
                        {row.name}
                    </Link>
                );
            },

            sortable: true,
            grow: 1,
        },
        {
            name: "",
            ignoreRowClick: true,
            cell: (row) => {
                return (
                    <>
                        <button className="bil-btn-link" onClick={() => handleEdit(row)}>
                            <i className="fa fa-pencil-square-o" aria-hidden="true" />
                        </button>
                        <button className="bil-btn-link" onClick={() => showConfirmDialog(row)}>
                            <i className="fa fa-trash-o" aria-hidden="true" />
                        </button>
                    </>
                );
            },
        },
        { name: language.subject_id, selector: "customSubjectId", sortable: true, width: "120px" },
    ];

    props.setSubjectInitial();

    useEffect(() => {
        if (subjectRequirementId !== props.subjects.subjectRequirementId && !props.subjects.loading) {
            // Call department and subject requirement API if browser is reloaded in those page
            // as we need to restore department and subject requirements for the app to work properly
            props.getDepartments(collegeId);
            if (!props.showDataSection) props.getSubjectRequirements(departmentId);

            // Set departmentId in redux store
            props.setDepartmentId(departmentId);
            props.setMetadata({ departmentId, subjectRequirementId });
            if (!props.showDataSection) props.getSubjects(subjectRequirementId);
        }

        setLoadingDialogShow(props.subjects.loading && !props.showDataSection);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.subjects.added) {
            setModalShow(false);
            setSubjectForm(subjectForm);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props, subjectRequirementId]);

    const csvData = () => {
        let data = [[language.subject_id, language.name]];
        props.subjects.list.forEach((l) => {
            data.push([l.customSubjectId, l.name]);
        });
        return data;
    };

    let csvFilename = department && department.name.replace(/ /g, "_") + "_";
    csvFilename += subjectRequirement && subjectRequirement.title.replace(/ /g, "_") + "_";
    csvFilename += "Subjects";

    return (
        <>
            {!props.showDataSection && (
                <CustomModal
                    show={modalShow}
                    hide={handleModalClose}
                    validate={validate}
                    onSave={addSubject}
                    label={modalLabel}
                >
                    <Form>
                        <InputComponent
                            label={language.name}
                            name="name"
                            autoFocus={true}
                            placeholder={language.ex_cse}
                            type="text"
                            value={subjectForm.name}
                            onChange={handleChange}
                            error={errors.name}
                        />
                        <InputComponent
                            label={language.subject_id}
                            name="customSubjectId"
                            placeholder="Ex - AWU65"
                            type="text"
                            value={subjectForm.customSubjectId}
                            onChange={handleChange}
                            error={errors.customSubjectId}
                        />
                    </Form>
                </CustomModal>
            )}

            <ConfirmDialog
                label={language.confirm_dialog_label}
                show={confirmDialogShow}
                onDelete={handleDelete}
                hide={() => setConfirmDialogShow(false)}
            />

            {props.showDataSection && getDataSection()}

            {!props.showDataSection && (
                <>
                    <div style={{ display: "flex" }}>
                        <button
                            style={{ padding: "0 15px 10px 10px" }}
                            onClick={() => history.goBack()}
                            className="bil-btn-link"
                        >
                            <i className="fa fa-arrow-left" aria-hidden="true" /> {language.back}
                        </button>
                        <h6 className="mt-2 mb-3 text-center">
                            {department && department.name}
                            <i className="fa fa-angle-double-right" aria-hidden="true" style={{ padding: "0 10px" }} />
                            {subjectRequirement && subjectRequirement.title}
                        </h6>
                    </div>

                    <div className="bil-datatable-wrap">
                        <DataTable
                            title={
                                <TableHeader
                                    filename={csvFilename}
                                    csvData={csvData()}
                                    btnText={language.add_subject}
                                    title={language.subjects}
                                    onClick={showAddSubjectModal}
                                />
                            }
                            persistTableHead
                            highlightOnHover={true}
                            striped={true}
                            columns={columns}
                            data={props.subjects.list}
                            defaultSortField="name"
                            pagination={true}
                            paginationServerOptions={{}}
                        />
                    </div>
                </>
            )}

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
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    departments: state.departments,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    setDepartmentId: (depertmentId) => dispatch(setDepartmentId(depertmentId)),
    setMetadata: (metaData) => dispatch(setMetadata(metaData)),
    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    addNewSubject: (subject) => dispatch(addNewSubject(subject)),
    updateSubject: (subject) => dispatch(updateSubject(subject)),
    deleteSubject: (id) => dispatch(deleteSubject(id)),
    setSubjectInitial: () => dispatch(setSubjectInitial()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SubjectComponent);
