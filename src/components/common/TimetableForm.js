import React from "react";
import CustomSelect from "./CustomSelect";
import TimeAllocationComponent from "./TimeAllocationComponent";
import Form from "react-bootstrap/Form";
import englist from "../../utility/languages/englist";

const TimetableForm = ({
    timetableForm,
    settings,
    itemToEdit,
    subjectRequirementList,
    subjectList,
    lecturerList,
    timeAllocationList,
    onHandleSectionAmPmSettings,
    onHandleSelectChange,
    onHandleSectionDayChange,
    onHandleSectionFieldChange,
    onHandleTimeAllocationClose,
    onAddAnotherSection,
}) => {

    const language = englist;

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

    return (
        <Form>
            <CustomSelect
                label={language.subject_requirements}
                name="subjectRequirementId"
                selectedValue={timetableForm.subjectRequirementId}
                onChange={onHandleSelectChange}
                options={reStructureListsForOptions(subjectRequirementList)}
            />
            <CustomSelect
                label={language.subjects}
                name="subjectId"
                selectedValue={timetableForm.subjectId}
                onChange={onHandleSelectChange}
                options={reStructureListsForOptions(subjectList)}
            />

            {timeAllocationList.map((section, i) => {
                return (
                    <TimeAllocationComponent
                        key={i}
                        settings={settings}
                        sectionIndex={i}
                        section={section}
                        onAmPmChange={onHandleSectionAmPmSettings}
                        onDayChange={(e) => onHandleSectionDayChange(e, section, i)}
                        onFieldChange={(e) => onHandleSectionFieldChange(e, section, i, itemToEdit)}
                        onClose={() => onHandleTimeAllocationClose(section, i)}
                        closeAble={i !== 0}
                        optionsForLecturer={reStructureListsForOptions(lecturerList)}
                        optionsForLocation={reStructureListsForOptions(section.facilityList)}
                    />
                );
            })}

            <button onClick={onAddAnotherSection} type="button" className="btn btn-info btn-block mt-3 mb-2">
                <i className="fa fa-plus" aria-hidden="true" /> {language.add_another_time_slot}
            </button>
        </Form>
    );
};

export default TimetableForm;
