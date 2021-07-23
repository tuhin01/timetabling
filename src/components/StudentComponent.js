import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import InputComponent from "./common/InputComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";
import Joi from "joi-browser";
import {setError} from "../store/error";
import {connect} from "react-redux";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {addNewStudent, deleteStudent, getStudents, updateStudent} from "../store/student";
import {Link} from "react-router-dom";
import {setStudentInitial} from "../store/studentSubjects";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import Button from "react-bootstrap/Button";
import constants from "../utility/constants";

const StudentComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    let student = {
        collegeId,
        name: "",
        customStudentId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_student);
    const [errors, setErrors] = React.useState(student);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [itemToEdit, setItemToEdit] = useState(false);
    const [studentForm, setStudentForm] = React.useState(student);

    const studentSchema = {
        name: Joi.string().min(3).required().trim().label(language.name),
        customStudentId: Joi.string().min(1).max(50).required().trim().label(language.student_id),
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
        setStudentForm({
            ...studentForm,
            [input.name]: input.value,
        });
    };

    const handleModalClose = () => {
        setModalShow(false);
        setItemToEdit(false);
        setStudentForm(student);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: studentSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(studentForm, studentSchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const showAddStudentModal = () => {
        setModalLabel(language.add_student);
        setModalShow(true);
    };

    const saveStudent = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewStudent(studentForm);
        } else {
            await props.updateStudent({ ...studentForm, _id: itemToEdit._id });
        }
    };

    const handleEdit = async (student) => {
        setModalLabel(language.edit_student);
        const { name, customStudentId } = student;
        setStudentForm({ ...studentForm, name, customStudentId });
        setModalShow(true);
        setItemToEdit(student);
    };

    const handleDelete = async () => {
        await props.deleteStudent(itemToDelete._id);
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
        {
            name: language.name,
            cell: (row) => {
                let redirectUrl = `/dashboard/student/?id=${row._id}`;
                return (
                    <Link className="btn-link black" to={redirectUrl}>
                        {row.name}
                    </Link>
                );
            },
            sortable: true,
            grow: 1.5,
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
        { name: "Student Id", selector: "customStudentId", sortable: true, width: "120px" },
    ];

    props.setStudentInitial();

    useEffect(() => {
        if (props.students.initial && !props.students.loading) props.getStudents(collegeId);

        setLoadingDialogShow(props.students.loading && !props.showDataSection);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.students.added) {
            setModalShow(false);
            setStudentForm(student);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props]);

    const csvData = () => {
        let data = [[language.student_id, language.name]];
        props.students.list.forEach((l) => {
            data.push([l.customStudentId, l.name]);
        });
        return data;
    };

    const getDataSection = () => {
        return (
            <div className="row pt-1">
                <div className="col-4">
                    <p style={{ fontSize: "20px" }}>{language.students}</p>
                </div>
                <div className="col">
                    <Button onClick={showAddStudentModal} variant="info" size="sm" style={{marginRight: "25px"}}>
                        <i className="fa fa-plus pr-2" aria-hidden="true" />
                        {language.add}
                    </Button>
                    <Link className="btn btn-sm btn-info" to="/dashboard/student-list">
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
                onSave={saveStudent}
                label={modalLabel}
            >
                <Form>
                    <InputComponent
                        label={language.name}
                        name="name"
                        autoFocus={true}
                        placeholder="Ex - MT G1"
                        type="text"
                        value={studentForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <InputComponent
                        label={language.student_id}
                        name="customStudentId"
                        placeholder="Ex - GRP985"
                        type="text"
                        value={studentForm.customStudentId}
                        onChange={handleChange}
                        error={errors.customStudentId}
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
                                btnText={language.add_student}
                                title={language.students}
                                onClick={showAddStudentModal}
                            />
                        }
                        persistTableHead
                        highlightOnHover={true}
                        striped={true}
                        columns={columns}
                        data={props.students.list}
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
    students: state.students,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getStudents: (collegeId) => dispatch(getStudents(collegeId)),
    addNewStudent: (student) => dispatch(addNewStudent(student)),
    updateStudent: (student) => dispatch(updateStudent(student)),
    deleteStudent: (id) => dispatch(deleteStudent(id)),
    setStudentInitial: () => dispatch(setStudentInitial()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StudentComponent);
