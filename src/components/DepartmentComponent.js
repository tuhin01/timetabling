import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import InputComponent from "./common/InputComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";
import {Link} from "react-router-dom";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {setError} from "../store/error";
import {addNewDepartment, deleteDepartment, getDepartments, updateDepartment} from "../store/department";
import {connect} from "react-redux";
import {setDepartmentId} from "../store/timetable";
import {emptySubjectRequirements} from "../store/subjectRequirement";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import Button from "react-bootstrap/Button";
import constants from "../utility/constants";

const DepartmentComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    let department = {
        collegeId,
        name: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_department);
    const [errors, setErrors] = React.useState(department);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(false);
    const [departmentForm, setDepartmentForm] = React.useState(department);

    const departmentSchema = {
        name: Joi.string().min(3).required().trim().label("Name"),
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
        setDepartmentForm({
            ...departmentForm,
            [input.name]: input.value,
        });
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit(false);
        setDepartmentForm(department);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: departmentSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(departmentForm, departmentSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const saveDepartment = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewDepartment(departmentForm);
        } else {
            await props.updateDepartment({ ...departmentForm, _id: itemToEdit._id });
        }
    };

    const showAddDeparmentModal = () => {
        setModalLabel(language.add_department);
        setModalShow(true);
    };

    const handleEdit = async (department) => {
        setModalLabel(language.edit_department);
        const { name } = department;
        setDepartmentForm({ ...departmentForm, name });
        setModalShow(true);
        setItemToEdit(department);
    };

    const handleDelete = async () => {
        console.log("Deleting...", itemToDelete);
        await props.deleteDepartment(itemToDelete._id);
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
        { name: language.name, selector: "name", sortable: true, grow: 7 },
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
            name: language.timetable,
            cell: (row) => {
                let redirectUrl = `/dashboard/timetable/?departmentId=${row._id}`;
                return (
                    <Link className="btn btn-sm btn-info" to={redirectUrl}>
                        {language.view_timetable}
                    </Link>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            width: "160px",
            center: true,
        },
        {
            name: language.subject_requirements,
            cell: (row) => {
                let redirectUrl = `/dashboard/subject-requirements/?departmentId=${row._id}`;
                return (
                    <Link className="btn btn-sm btn-info" to={redirectUrl}>
                        {language.view_subject_requirement}
                    </Link>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            width: "250px",
            center: true,
        },
    ];

    const getDataSection = () => {
        return (
            <div className="row pt-5">
                <div className="col-4">
                    <p style={{ fontSize: "20px" }}>{language.departments}</p>
                </div>
                <div className="col">
                    <Button onClick={showAddDeparmentModal} variant="info" size="sm" style={{marginRight: "25px"}}>
                        <i className="fa fa-plus pr-2" aria-hidden="true" />
                        {language.add}
                    </Button>
                    <Link className="btn btn-sm btn-info" to="/dashboard/departments">
                        <i className="fa fa-eye pr-2" aria-hidden="true" />
                        {language.view}
                    </Link>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (props.departments.initial && !props.departments.loading) props.getDepartments(collegeId);
        props.setDepartmentId("");
        props.emptySubjectRequirements();
        setLoadingDialogShow(props.departments.loading && !props.showDataSection);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.departments.added) {
            setModalShow(false);
            setDepartmentForm(department);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props]);

    return (
        <>
            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                validate={validate}
                onSave={saveDepartment}
                label={modalLabel}
            >
                <Form>
                    <InputComponent
                        label={language.name}
                        name="name"
                        autoFocus={true}
                        placeholder={language.ex_department_name}
                        type="text"
                        value={departmentForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
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
                <div className="bil-datatable-wrap">
                    <DataTable
                        title={
                            <TableHeader
                                btnText={language.add_new_department}
                                title={language.departments}
                                onClick={showAddDeparmentModal}
                            />
                        }
                        persistTableHead
                        responsive={true}
                        highlightOnHover={true}
                        striped={true}
                        columns={columns}
                        data={props.departments.list}
                        defaultSortField="name"
                        pagination={true}
                        paginationServerOptions={{}}
                    />
                </div>
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
    departments: state.departments,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    addNewDepartment: (department) => dispatch(addNewDepartment(department)),
    updateDepartment: (department) => dispatch(updateDepartment(department)),
    deleteDepartment: (id) => dispatch(deleteDepartment(id)),
    setDepartmentId: (depertmentId) => dispatch(setDepartmentId(depertmentId)),
    emptySubjectRequirements: () => dispatch(emptySubjectRequirements()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentComponent);
