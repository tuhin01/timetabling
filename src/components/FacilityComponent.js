import React, {useEffect, useState} from "react";
import CustomModal from "./common/CustomModal";
import Form from "react-bootstrap/Form";
import InputComponent from "./common/InputComponent";
import ConfirmDialog from "./common/ConfirmDialog";
import DataTable from "react-data-table-component";
import TableHeader from "./common/TableHeader";
import Joi from "joi-browser";
import LoadingDialog from "./common/LoadingDialog";
import AlertDialog from "./common/AlertDialog";
import {setError} from "../store/error";
import {addNewFacility, deleteFacility, getFacilities, updateFacility} from "../store/facility";
import {connect} from "react-redux";
import CustomSelect from "./common/CustomSelect";
import {getDepartments} from "../store/department";
import {getsubjectRequirements} from "../store/subjectRequirement";
import {getSubjects} from "../store/subject";
import {getLecturers} from "../store/lecturer";
import englist from "../utility/languages/englist";
import arabic from "../utility/languages/arabic";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import constants from "../utility/constants";

const FacilityComponent = (props) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const collegeId = userData.college;
    const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
    const language = appLanguage === constants.ENGLISH ? englist : arabic;
    let facility = {
        collegeId,
        name: "",
        customFacilityId: "",
        departmentId: "",
        subjectRequirementId: "",
        subjectId: "",
        lecturerId: "",
    };

    const [modalShow, setModalShow] = useState(false);
    const [isReservation, setIsReservation] = useState(false);
    const [modalLabel, setModalLabel] = useState(language.add_facility);
    const [errors, setErrors] = React.useState(facility);
    const [confirmDialogShow, setConfirmDialogShow] = useState(false);
    const [loadingDialogShow, setLoadingDialogShow] = useState(false);
    const [alertgDialogShow, setAlertDialogShow] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({});
    const [itemToEdit, setItemToEdit] = useState(false);
    const [facilityForm, setFacilityForm] = React.useState(facility);

    const facilitySchema = {
        name: Joi.string().min(3).required().trim().label(language.name),
        customFacilityId: Joi.string().min(1).max(50).required().trim().label(language.facility_id),
        departmentId: Joi.string().allow("", null),
        subjectRequirementId: Joi.string().allow("", null),
        subjectId: Joi.string().allow("", null),
        lecturerId: Joi.string().allow("", null),
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
        setFacilityForm({
            ...facilityForm,
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
        setFacilityForm(facility);
    };

    const validateInput = ({ name, value }) => {
        const obj = { [name]: value };
        const schema = { [name]: facilitySchema[name] };
        const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
    };

    const validate = () => {
        const options = { abortEarly: false };
        const { error } = Joi.validate(facilityForm, facilitySchema, options);
        if (!error) return null;
        const errors = {};
        for (const item of error.details) {
            errors[item.path[0]] = item.message;
        }
        return errors;
    };

    const saveFacility = async () => {
        const errors = validate();
        if (errors) return setErrors(errors);
        if (!itemToEdit) {
            await props.addNewFacility(facilityForm);
        } else {
            await props.updateFacility({ ...facilityForm, _id: itemToEdit._id });
        }
    };

    const showAddFacilityModal = () => {
        setIsReservation(false);
        setModalLabel(language.add_facility);
        setItemToEdit(false);
        setModalShow(true);
    };

    const handleEdit = async (facility, reserve = false) => {
        setModalLabel(language.edit_facility);
        const { name, customFacilityId, department, subjectRequirement, subject, lecturer } = facility;

        if (reserve) {
            setIsReservation(true);
            if (department) props.getSubjectRequirements(department);
            if (subjectRequirement) props.getSubjects(subjectRequirement);
        } else {
            setIsReservation(false);
        }
        setFacilityForm({
            ...facilityForm,
            name,
            customFacilityId,
            departmentId: department,
            subjectRequirementId: subjectRequirement,
            subjectId: subject,
            lecturerId: lecturer,
        });
        setModalShow(true);
        setItemToEdit(facility);
    };

    const handleDelete = async () => {
        await props.deleteFacility(itemToDelete._id);
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
        { name: language.name, selector: "name", sortable: true, width: "120px" },
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
            name: language.reservation,
            ignoreRowClick: true,
            width: "185px",
            cell: (row) => {
                const isReserved = row.subject || row.lecturer;

                return (
                    <button className="btn btn-sm btn-info" onClick={() => handleEdit(row, true)}>
                        {isReserved ? (
                            <span>
                                <i className="fa fa-pencil-square-o" aria-hidden="true" /> {language.edit_reservation}
                            </span>
                        ) : (
                            <span>
                                <i className="fa fa-plus" aria-hidden="true" /> {language.add_reservation}
                            </span>
                        )}
                    </button>
                );
            },
        },
        { name: language.facility_id, selector: "customFacilityId", sortable: true, width: "120px", center: true },
    ];

    useEffect(() => {
        if (props.facilities.initial && !props.facilities.loading) {
            props.getFacilities(collegeId);
            props.getDepartments(collegeId);
            props.getLecturers(collegeId);
        }

        setLoadingDialogShow(props.facilities.loading);
        setAlertDialogShow(props.error.errorMessage !== "");
        if (props.facilities.added) {
            setModalShow(false);
            setFacilityForm(facility);
            setItemToDelete(false);
            setConfirmDialogShow(false);
        }
    }, [props.facilities]);

    const csvData = () => {
        let data = [[language.facility_id, language.name]];
        props.facilities.list.forEach((l) => {
            data.push([l.customFacilityId, l.name]);
        });
        return data;
    };

    const getDataSection = () => {
        return (
            <div className="row pt-1">
                <div className="col-4">
                    <p style={{ fontSize: "20px" }}>{language.facilities}</p>
                </div>
                <div className="col">
                    <Button onClick={showAddFacilityModal} variant="info" size="sm" style={{marginRight: "25px"}}>
                        <i className="fa fa-plus pr-2" aria-hidden="true" />
                        {language.add}
                    </Button>
                    <Link className="btn btn-sm btn-info" to="/dashboard/facility-list">
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
                onSave={saveFacility}
                label={modalLabel}
            >
                <Form>
                    <InputComponent
                        label={language.name}
                        name="name"
                        placeholder="Ex - Fac 1"
                        type="text"
                        value={facilityForm.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                    <InputComponent
                        label={language.facility_id}
                        name="customFacilityId"
                        placeholder="Ex - FAC745"
                        type="text"
                        value={facilityForm.customFacilityId}
                        onChange={handleChange}
                        error={errors.customFacilityId}
                    />
                    <div hidden={!isReservation}>
                        <CustomSelect
                            label={language.departments}
                            name="departmentId"
                            selectedValue={facilityForm.departmentId}
                            onChange={handleSelectChange}
                            options={reStructureListsForOptions(props.departments.list)}
                            onAddPress={() => false}
                        />

                        <CustomSelect
                            label={language.subject_requirement}
                            name="subjectRequirementId"
                            selectedValue={facilityForm.subjectRequirementId}
                            onChange={handleSelectChange}
                            options={reStructureListsForOptions(props.subjectRequirements.list)}
                            onAddPress={() => false}
                        />

                        <CustomSelect
                            label={language.subject}
                            name="subjectId"
                            selectedValue={facilityForm.subjectId}
                            onChange={handleSelectChange}
                            options={reStructureListsForOptions(props.subjects.list)}
                            onAddPress={() => false}
                        />
                        <CustomSelect
                            label={language.lecturer}
                            name="lecturerId"
                            onChange={handleSelectChange}
                            selectedValue={facilityForm.lecturerId}
                            options={reStructureListsForOptions(props.lecturers.list)}
                        />
                    </div>
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
                                btnText={language.add_facility}
                                title={language.facilities}
                                onClick={showAddFacilityModal}
                            />
                        }
                        persistTableHead
                        highlightOnHover={true}
                        striped={true}
                        columns={columns}
                        data={props.facilities.list.filter((f) => !f.autoCreated)}
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
    facilities: state.facilities,
    departments: state.departments,
    subjectRequirements: state.subjectRequirements,
    subjects: state.subjects,
    lecturers: state.lecturers,
    error: state.error.data,
});

const mapDispatchToProps = (dispatch) => ({
    setError: (error) => dispatch(setError(error)),
    getFacilities: (collegeId) => dispatch(getFacilities(collegeId)),
    addNewFacility: (facility) => dispatch(addNewFacility(facility)),
    updateFacility: (facility) => dispatch(updateFacility(facility)),
    deleteFacility: (id) => dispatch(deleteFacility(id)),

    getDepartments: (collegeId) => dispatch(getDepartments(collegeId)),
    getSubjectRequirements: (depertmentId) => dispatch(getsubjectRequirements(depertmentId)),
    getSubjects: (subjectRequirementId) => dispatch(getSubjects(subjectRequirementId)),
    getLecturers: (collegeId) => dispatch(getLecturers(collegeId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FacilityComponent);
