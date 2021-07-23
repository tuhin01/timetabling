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
import {Col, Row} from "react-bootstrap";
import BackButton from "./common/BackButton";
import TableHeader from "./common/TableHeader";
import CustomSelect from "./common/CustomSelect";
import {useLocation} from "react-router-dom";
import {getStudents} from "../store/student";
import {addSubjectStudents, deleteSubjectStudent, getSubjectStudents} from "../store/subjectStudents";
import {getDepartments} from "../store/department";
import {getsubjectRequirements} from "../store/subjectRequirement";
import {getSubjects} from "../store/subject";
import constants from "../utility/constants";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";

const useQuery = () => new URLSearchParams(useLocation().search);

const SubjectDetailsComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const urlQueryParams = useQuery();
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;

    const departmentId = urlQueryParams.get("departmentId");
    const subjectRequirementId = urlQueryParams.get("subjectRequirementId");
    const subjectId = urlQueryParams.get("subjectId");

    const department = props.departments.list.find((department) => department._id === departmentId);
    const subjectRequirement = props.subjectRequirements.list.find((sr) => sr._id === subjectRequirementId);

    let subjectForm = {
        name: "",
        customSubjectId: "",
    };

    let subjectStudent = {
        subjectId,
        departmentId,
        subjectRequirementId,
        studentId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_student);
    const [errors, setErrors] = React.useState(subjectStudent);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [subjectStudentForm, setStudentSubjectForm] = React.useState(subjectStudent);
    const [subject, setSubject] = React.useState(subjectForm);

    const subjectStudentSchema = {
        departmentId: Joi.string(),
        subjectRequirementId: Joi.string(),
        subjectId: Joi.string(),
        studentId: Joi.string().min(1).max(50).required().trim().label(language.student),
    };

    const reStructureListsForOptions = (lists) => {
        let options = [];
        lists.forEach((item) => {
            options.push({
                label: item.customStudentId + " - " + (item.title || item.name),
                value: item._id,
            });
        });
        return options;
    };

    const handleModalClose = () => {
        setModalShow(false);
        setStudentSubjectForm(subjectStudent);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: subjectStudentSchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const { error } = Joi.validate(subjectStudentForm, subjectStudentSchema);
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

    const saveStudentSubject = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        await props.addSubjectStudents(subjectStudentForm);
        await props.getSubjectStudents(subjectId);
    };

    const handleDelete = async () => {
        await props.deleteSubjectStudent(itemToDelete._id);
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
            ...subjectStudentForm,
            [input.name]: input.value,
        });
    };

    const columns = [
        { name: language.student_id, selector: "student.customStudentId", sortable: true, grow: 2 },
        { name: language.name, selector: "student.name", sortable: true, grow: 3 },
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
        if (props.subjectStudents.initial && !props.subjectStudents.loading) {
            // Fetch all the subjects for the student
            props.getSubjectStudents(subjectId);
            props.getStudents(collegeId);

            // If not alrady loaded, get all the departments & subjectRequirements & subjects for the department
            if (props.subjects.list.length < 1) props.getSubjects(subjectRequirementId);
            if (props.departments.list.length < 1) props.getDepartments(collegeId);
            if (props.subjectRequirements.list.length < 1) props.getSubjectRequirements(departmentId);
        }

        const subjectInfo = props.subjects.list.find((s) => s._id === subjectId);
        setSubject(subjectInfo);

        setLoadingDialogShow(props.subjectStudents.loading);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.subjectStudents.added) {
            setModalShow(false);
            setStudentSubjectForm(subjectStudent);
        }
        if (props.subjectStudents.deleted) {
            setConfirmDialogShow(false);
            setItemToDelete(false);
        }
    }, [props]);

    const getBreadcumb = () => (
        <div>
            {department && department.name}
            <i className="fa fa-angle-double-right" aria-hidden="true" style={{ padding: "0 10px" }} />
            {subjectRequirement && subjectRequirement.title}
        </div>
    );

    return (
        <>
            <BackButton label={language.back} pagination={getBreadcumb()} />

            <div className="bil-student-detail">
                <p>{language.student_details}</p>
                <Row>
                    {subject && (
                        <Col xs={12} md={6}>
                            Name - {subject.name} <br />
                            Subject Id - {subject.customSubjectId}
                        </Col>
                    )}
                </Row>
            </div>

            <div className="bil-datatable-wrap">
                <DataTable
                    title={
                        <TableHeader
                            btnText={language.assign_new_subject}
                            title={language.subject_student}
                            onClick={showAddStudentModal}
                        />
                    }
                    persistTableHead
                    highlightOnHover={true}
                    striped={true}
                    columns={columns}
                    data={props.subjectStudents.list}
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
                        label={language.students}
                        name="studentId"
                        selectedValue={subjectStudentForm.studentId}
                        onChange={handleSelectChange}
                        options={reStructureListsForOptions(props.students.list)}
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
    students: state.students,
    subjectStudents: state.subjectStudents,
    departments: state.departments,
    subjects: state.subjects,
    subjectRequirements: state.subjectRequirements,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getStudents: (collegeId) => dispatch(getStudents(collegeId)),
    getSubjectStudents: (subjectId) => dispatch(getSubjectStudents(subjectId)),
    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    addSubjectStudents: (data) => dispatch(addSubjectStudents(data)),
    deleteSubjectStudent: (studentSubjectId) => dispatch(deleteSubjectStudent(studentSubjectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SubjectDetailsComponent);
