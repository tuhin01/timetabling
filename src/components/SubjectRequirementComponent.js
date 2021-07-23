import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";
import Form from "react-bootstrap/Form";
import CustomModal from "./common/CustomModal";
import ConfirmDialog from "./common/ConfirmDialog";
import InputComponent from "./common/InputComponent";
import TableHeader from "./common/TableHeader";
import {Link, useLocation} from "react-router-dom";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {setError} from "../store/error";
import {connect} from "react-redux";
import {addNewsubjectRequirement, deletesubjectRequirement, getsubjectRequirements, setDepartmentId, updatesubjectRequirement,} from "../store/subjectRequirement";
import {getDepartments} from "../store/department";
import {SketchPicker} from "react-color";
import BackButton from "./common/BackButton";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import constants from "../utility/constants";
import Button from "react-bootstrap/Button";
import CustomSelect from "./common/CustomSelect";

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => new URLSearchParams(useLocation().search);

const SubjectRequirementComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;

    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    const urlQueryParams = useQuery();
    const departmentId = urlQueryParams.get("departmentId");

    const department = props.departments.list.find((department) => department._id === departmentId);

    const [color, setColor] = useState("#194d33");
    let subjectRequirement = { departmentId, title: "", color };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_subject_requirement);
    const [errors, setErrors] = React.useState(subjectRequirement);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(false);
    const [subjectRequirementForm, setSubjectRequirementForm] = React.useState(subjectRequirement);

    const subjectRequirementSchema = {
        title: Joi.string().min(3).required().trim().label(language.title),
        color: Joi.string().min(0).required().trim().label(language.color),
        departmentId: Joi.string(),
    };

    const handleChangeColor = (color) => {
        setColor(color.hex);
        setSubjectRequirementForm({
            ...subjectRequirementForm,
            color: color.hex,
        });
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
        setSubjectRequirementForm({
            ...subjectRequirementForm,
            [input.name]: input.value,
        });
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit(false);
        setSubjectRequirementForm(subjectRequirement);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: subjectRequirementSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(subjectRequirementForm, subjectRequirementSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const addSubjectRequirement = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewSubjectRequirement(subjectRequirementForm);
        } else {
            await props.updateSubjectRequirement({ ...subjectRequirementForm, _id: itemToEdit._id });
        }
    };

    const showAddSubjectRequirementModal = () => {
        setModalLabel(language.add_subject_requirement);
        setModalShow(true);
    };

    const handleEdit = async (subjectRequirement) => {
        setModalLabel(language.edit_subject_requirement);
        const { title, color } = subjectRequirement;
        setSubjectRequirementForm({ ...subjectRequirementForm, title, color });
        setModalShow(true);
        setItemToEdit(subjectRequirement);
    };

    const handleDelete = async () => {
        await props.deleteSubjectRequirement(itemToDelete._id);
    };

    const showConfirmDialog = (row) => {
        setItemToDelete(row);
        setConfirmDialogShow(true);
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
                        <p style={{ fontSize: "20px" }}>{language.subject_requirements}</p>
                    </div>
                    <div className="col-2 text-left">
                        <Button onClick={showAddSubjectRequirementModal} variant="info" size="sm">
                            <i className="fa fa-plus pr-2" aria-hidden="true" />
                            {language.add}
                        </Button>
                    </div>
                </div>
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
        { name: language.title, selector: "title", sortable: true, grow: 7 },
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
        {
            name: language.color,
            cell: (row) => {
                return (
                    <>
                        <span
                            style={{ width: "15px", height: "15px", backgroundColor: row.color, marginRight: "5px" }}
                        />
                        <span>{row.color}</span>
                    </>
                );
            },
            width: "110px",
        },
        {
            name: language.subject_list,
            cell: (row) => {
                let redirectUrl = `/dashboard/subjects/?departmentId=${departmentId}&subjectRequirementId=${row._id}`;
                return (
                    <Link className="btn btn-sm btn-info" to={redirectUrl}>
                        {language.view_subjects}
                    </Link>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            width: "150px",
        },
    ];

    useEffect(() => {
        if (departmentId !== props.subjectRequirements.departmentId && !props.subjectRequirements.loading) {
            // Call department API if browser is reloaded in those page
            // as we need to restore departments for the app to work properly
            if (props.departments.list.length < 1) props.getDepartments(collegeId);
            if (!props.showDataSection) props.getSubjectRequirements(departmentId);

            // Set departmentId in redux store
            props.setDepartmentId(departmentId);
        }

        setLoadingDialogShow(props.subjectRequirements.loading && !props.showDataSection);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.subjectRequirements.added) {
            setModalShow(false);
            setSubjectRequirementForm({ departmentId, title: "" });
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props, departmentId]);

    return (
        <>
            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                validate={validate}
                onSave={addSubjectRequirement}
                label={modalLabel}
            >
                <Form>
                    {props.showDataSection && (
                        <CustomSelect
                            label={language.departments}
                            name="departmentId"
                            selectedValue={subjectRequirementForm.departmentId}
                            onChange={handleChange}
                            options={reStructureListsForOptions(props.departments.list)}
                            onAddPress={() => false}
                        />
                    )}
                    <InputComponent
                        label={language.title}
                        name="title"
                        autoFocus={true}
                        placeholder={language.ex_university_requirements}
                        type="text"
                        value={subjectRequirementForm.title}
                        onChange={handleChange}
                        error={errors.title}
                    />
                    <InputComponent
                        label={language.color}
                        name="color"
                        type="text"
                        disabled={true}
                        value={color}
                        onChange={() => false}
                    />
                    <SketchPicker style={{ width: "100%" }} color={color} onChange={handleChangeColor} />
                </Form>
            </CustomModal>

            <ConfirmDialog
                label={language.confirm_dialog_label}
                show={confirmDialogShow}
                onDelete={handleDelete}
                hide={() => setConfirmDialogShow(false)}
            />

            {props.showDataSection && getDataSection()}

            {!props.showDataSection && (
                <>
                    <BackButton label={language.back} pagination={department && department.name} />

                    <div className="bil-datatable-wrap">
                        <DataTable
                            title={
                                <TableHeader
                                    btnText={language.add_subject_requirement}
                                    title={language.subject_requirements}
                                    onClick={showAddSubjectRequirementModal}
                                />
                            }
                            persistTableHead
                            highlightOnHover={true}
                            striped={true}
                            columns={columns}
                            data={props.subjectRequirements.list}
                            defaultSortField="title"
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
    subjectRequirements: state.subjectRequirements,
    departments: state.departments,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    setDepartmentId: (depertmentId) => dispatch(setDepartmentId(depertmentId)),
    addNewSubjectRequirement: (subjectRequirement) => dispatch(addNewsubjectRequirement(subjectRequirement)),
    updateSubjectRequirement: (subjectRequirement) => dispatch(updatesubjectRequirement(subjectRequirement)),
    deleteSubjectRequirement: (id) => dispatch(deletesubjectRequirement(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SubjectRequirementComponent);
