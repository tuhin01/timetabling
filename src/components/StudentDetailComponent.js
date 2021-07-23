import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import Joi from "joi-browser";
import {setError} from "../store/error";
import {connect} from "react-redux";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {addStudentSubject, deleteStudentSubject, getStudentSubjects} from "../store/studentSubjects";
import {Col, Row} from "react-bootstrap";
import BackButton from "./common/BackButton";
import TableHeader from "./common/TableHeader";
import CustomSelect from "./common/CustomSelect";
import {useLocation} from "react-router-dom";
import {getSubjects} from "../store/subject";
import {getStudents} from "../store/student";
import {getDepartments} from "../store/department";
import {getsubjectRequirements} from "../store/subjectRequirement";
import constants from "../utility/constants";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";

const useQuery = () => new URLSearchParams(useLocation().search);

const StudentDetailsComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    const urlQueryParams = useQuery();
    const studentId = urlQueryParams.get("id");

    let studentForm = {
        studentId,
        name: "",
        customStudentId: "",
    };

    let studentSubject = {
        studentId,
        departmentId: "",
        subjectRequirementId: "",
        subjectId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState("Add Student");
    const [errors, setErrors] = React.useState(studentSubject);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [studentSubjectForm, setStudentSubjectForm] = React.useState(studentSubject);
    const [student, setStudent] = React.useState(studentForm);

    const studentSubjectSchema = {
        departmentId: Joi.string().min(3).required().trim().label("Department"),
        subjectRequirementId: Joi.string().min(1).max(50).required().trim().label("Subject Requirement"),
        subjectId: Joi.string().min(1).max(50).required().trim().label("Subject"),
        studentId: Joi.string(),
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
        setStudentSubjectForm(studentSubject);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: studentSubjectSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const { error } = Joi.validate(studentSubjectForm, studentSubjectSchema);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const showAddSubjectModal = () => {
        setModalLabel(language.add_subject);
        setModalShow(true);
    };

    const saveStudentSubject = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        await props.addStudentSubject(studentSubjectForm);
        await props.getStudentSubjects(studentId);
    };

    const handleDelete = async () => {
        await props.deleteStudentSubject(itemToDelete._id);
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
        setStudentSubjectForm({
            ...studentSubjectForm,
            [input.name]: input.value,
        });

        if (input.name === "departmentId") {
            props.getSubjectRequirements(input.value);
        }
        if (input.name === "subjectRequirementId") {
            props.getSubjects(input.value);
        }
    };

    const columns = [
        { name: language.subject_id, selector: "subject.customSubjectId", sortable: true, grow: 2 },
        { name: language.name, selector: "subject.name", sortable: true, grow: 3 },
        {
            name: language.delete,
            cell: (row) => {
                return (
                    <button className="bil-btn-link" onClick={() => showConfirmDialog(row)}>
                        <i className="fa fa-trash-o" aria-hidden="true" />
                    </button>
                );
            },
            right: true,
            grow: 1,
        },
    ];

    useEffect(() => {
        if (props.studentSubjects.initial && !props.studentSubjects.loading) {
            // Fetch all the students if browser is reloaded
            if (props.students.list.length < 1) {
                props.getStudents(collegeId);
            }

            // Fetch all the subjects for the student
            props.getStudentSubjects(studentId);

            // Get all the departments
            if (props.departments.list.length < 1) {
                props.getDepartments(collegeId);
            }
        }

        const studentInfo = props.students.list.find((student) => student._id === studentId);
        setStudent(studentInfo);

        setLoadingDialogShow(props.studentSubjects.loading);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.studentSubjects.added) {
            setModalShow(false);
            setStudentSubjectForm(studentSubject);
        }
        if (props.studentSubjects.deleted) {
            setConfirmDialogShow(false);
            setItemToDelete(false);
        }
    }, [props]);

    return (
        <>
            <BackButton label={language.back} />

            <div className="bil-student-detail">
                <p>{language.student_details}</p>
                <Row>
                    {student && (
                        <Col xs={12} md={6}>
                            {language.name} - {student && student.name} <br />
                            {language.subject_id} - {student && student.customStudentId}
                        </Col>
                    )}
                </Row>
            </div>

            <div className="bil-datatable-wrap">
                <DataTable
                    title={
                        <TableHeader
                            btnText={language.assign_new_subject}
                            title={language.subjects}
                            onClick={showAddSubjectModal}
                        />
                    }
                    persistTableHead
                    highlightOnHover={true}
                    striped={true}
                    columns={columns}
                    data={props.studentSubjects.list}
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

            <CustomModal
                show={modalShow}
                hide={handleModalClose}
                validate={validate}
                onSave={saveStudentSubject}
                label={modalLabel}
            >
                <Form>
                    <CustomSelect
                        label={language.departments}
                        name="departmentId"
                        selectedValue={studentSubjectForm.departmentId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.departments.list)}
                        onAddPress={() => false}
                    />
                    <CustomSelect
                        label={language.subject_requirements}
                        name="subjectRequirementId"
                        selectedValue={studentSubjectForm.subjectRequirementId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.subjectRequirements.list)}
                        onAddPress={() => false}
                    />
                    <CustomSelect
                        label={language.subjects}
                        name="subjectId"
                        selectedValue={studentSubjectForm.subjectId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.subjects.list)}
                        onAddPress={() => false}
                    />
                </Form>
            </CustomModal>

            <ConfirmDialog
                label={language.confirm_dialog_label}
                show={confirmDialogShow}
                onDelete={handleDelete}
                hide={() => setConfirmDialogShow(false)}
            />
        </>
    );
};
const mapStateToProps = (state) => ({
    departments: state.departments,
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    students: state.students,
    studentSubjects: state.studentSubjects,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    getStudents: (collegeId) => dispatch(getStudents(collegeId)),
    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    addStudentSubject: (data) => dispatch(addStudentSubject(data)),
    deleteStudentSubject: (studentSubjectId) => dispatch(deleteStudentSubject(studentSubjectId)),
    getStudentSubjects: (studentId) => dispatch(getStudentSubjects(studentId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StudentDetailsComponent);
