import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import InputComponent from "./common/InputComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";

import {addNewLecturer, deleteLecturer, getLecturers, updateLecturer} from "../store/lecturer";
import {connect} from "react-redux";
import {setError} from "../store/error";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import constants from "../utility/constants";

const LecturerComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    let lecturer = {
        collegeId,
        name: "",
        customLecturerId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_lecturer);
    const [errors, setErrors] = React.useState(lecturer);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [itemToEdit, setItemToEdit] = useState(false);
    const [lecturerForm, setLecturerForm] = React.useState(lecturer);

    const lecturerSchema = {
        name: Joi.string().min(3).required().trim().label("Name"),
        customLecturerId: Joi.string().min(1).max(50).required().trim().label("Lecturer ID"),
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
        setLecturerForm({
            ...lecturerForm,
            [input.name]: input.value,
        });
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit({});
        setLecturerForm(lecturer);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: lecturerSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(lecturerForm, lecturerSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const showAddLecturerModal = () => {
        setModalLabel(language.add_lecturer);
        setModalShow(true);
    };

    const addLecturer = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewLecturer(lecturerForm);
        } else {
            await props.updateLecturer({ ...lecturerForm, _id: itemToEdit._id });
        }
    };

    const handleEdit = async (lecturer) => {
        setModalLabel(language.edit_lecturer);
        const { name, customLecturerId } = lecturer;
        setLecturerForm({ ...lecturerForm, name, customLecturerId });
        setModalShow(true);
        setItemToEdit(lecturer);
    };

    const handleDelete = async () => {
        await props.deleteLecturer(itemToDelete._id);
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
        { name: language.name, selector: "name", sortable: true, width: "140px" },
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
        { name: language.lecturer_id, selector: "customLecturerId", sortable: true, width: "120px", center: true },
    ];

    useEffect(() => {
        /**
         * We need to make sure we are loading lecturers only once from server.
         * For that reason we have added a key initial => true by default in the lecturers state in store/lecturer.js
         * When we get lecturers from servers, we set initial => false
         * BUT 'props' object changes few times because of the multiple dispatch when an API call is in progress before we can set initial => false
         * And this cause "props.getLecturers();" to be called few times until initial => false
         * To avoid this, we have to check if 'props.lecturers.loading' => false, as it will be true only when the API call is in progress
         * And we do not want "props.getLecturers();" to be called in the middle of another API call
         * So when an API call is in progress and but initial => true, another API call will not be invocked
         * This way even if 'props' change, "props.getLecturers();" will not be called again
         */
        if (props.lecturers.initial && !props.lecturers.loading) {
            props.getLecturers(collegeId);
        }
        setLoadingDialogShow(props.lecturers.loading && !props.showDataSection);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.lecturers.added) {
            setModalShow(false);
            setLecturerForm(lecturer);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props]);

    const csvData = () => {
        let data = [[language.lecturer_id, language.name]];
        props.lecturers.list.forEach((l) => {
            data.push([l.customLecturerId, l.name]);
        });
        return data;
    };

    const getDataSection = () => {
        return (
            <div className="row pt-1">
                <div className="col-4">
                    <p style={{ fontSize: "20px" }}>{language.lecturers}</p>
                </div>
                <div className="col">
                    <Button onClick={showAddLecturerModal} variant="info" size="sm" style={{marginRight: "25px"}}>
                        <i className="fa fa-plus pr-2" aria-hidden="true" />
                        {language.add}
                    </Button>
                    <Link className="btn btn-sm btn-info" to="/dashboard/lecturer-list">
                        <i className="fa fa-eye pr-2" aria-hidden="true" />
                        {language.view}
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <>
            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                validate={validate}
                onSave={addLecturer}
                label={modalLabel}
            >
                <Form>
                    <InputComponent
                        label={language.name}
                        autoFocus={true}
                        name="name"
                        placeholder={language.ex_name}
                        type="text"
                        value={lecturerForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <InputComponent
                        label={language.lecturer_id}
                        name="customLecturerId"
                        placeholder="Ex - 65634456"
                        type="text"
                        value={lecturerForm.customLecturerId}
                        onChange={handleChange}
                        error={errors.customLecturerId}
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
                                csvData={csvData()}
                                btnText={language.add_new_lecturer}
                                title={language.lecturers}
                                onClick={showAddLecturerModal}
                            />
                        }
                        persistTableHead
                        highlightOnHover={true}
                        striped={true}
                        columns={columns}
                        data={props.lecturers.list.filter((l) => !l.autoCreated)}
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
    lecturers: state.lecturers,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getLecturers: (collegeId) => dispatch(getLecturers(collegeId)),
    addNewLecturer: (lecturer) => dispatch(addNewLecturer(lecturer)),
    updateLecturer: (lecturer) => dispatch(updateLecturer(lecturer)),
    deleteLecturer: (id) => dispatch(deleteLecturer(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LecturerComponent);
