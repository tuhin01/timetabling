import React from "react";
import CustomCheckbox from "./CustomCheckbox";
import CustomSelect from "./CustomSelect";

const TimeAllocationComponent = ({
    section,
    settings,
    sectionIndex,
    onAmPmChange,
    onFieldChange,
    onDayChange,
    onClose,
    closeAble,
    optionsForLecturer,
    optionsForLocation,
    noLocationAndLecturer = false,
    fullDisable = false,
}) => {
    let days = [
        { dayKey: "sun" },
        { dayKey: "mon" },
        { dayKey: "tue" },
        { dayKey: "wed" },
        { dayKey: "thu" },
        { dayKey: "fri" },
        { dayKey: "sat" },
    ];
    if (settings.firstDayOfWeek === "mon") {
        days = [
            { dayKey: "mon" },
            { dayKey: "tue" },
            { dayKey: "wed" },
            { dayKey: "thu" },
            { dayKey: "fri" },
            { dayKey: "sat" },
            { dayKey: "sun" },
        ];
    }
    return (
        <div className="card mb-3">
            <div className="card-header bil-c-h">
                Time Slot {++sectionIndex}{" "}
                {closeAble && !section.startTimeHour && (
                    <span className="float-right" onClick={onClose}>
                        <i className="fa fa-times" aria-hidden="true" />
                    </span>
                )}
            </div>
            <div className="card-body">
                <div className="day-select">
                    {days.map((day, i) => {
                        const isChecked = section.days.findIndex((sectionDay) => sectionDay.dayKey === day.dayKey);

                        return (
                            <CustomCheckbox
                                key={i}
                                label={day.dayKey}
                                value={day.dayKey}
                                onChange={onDayChange}
                                isChecked={isChecked > -1}
                            />
                        );
                    })}
                </div>
                <div className="time-set">
                    <div className="time-start">
                        <p>Start Time</p>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="00"
                            maxLength="2"
                            disabled={fullDisable}
                            value={section.startTimeHour}
                            onChange={onFieldChange}
                            name="startTimeHour"
                        />
                        <p className="m-1">:</p>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="00"
                            maxLength="2"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            value={section.startTimeMin}
                            name="startTimeMin"
                        />
                        <div className="btn-group" data-toggle="buttons">
                            <label
                                onClick={() => onAmPmChange({ startTime: "AM" }, sectionIndex)}
                                className={`btn btn-sm btn-info bil-settings-btn ${
                                    section.amPmSettings.startTime === "AM" ? "active" : ""
                                }`}
                            >
                                AM
                            </label>

                            <label
                                onClick={() => onAmPmChange({ startTime: "PM" }, sectionIndex)}
                                className={`btn btn-sm btn-info bil-settings-btn ${
                                    section.amPmSettings.startTime === "PM" ? "active" : ""
                                }`}
                            >
                                PM
                            </label>
                        </div>
                    </div>
                    <div className="time-start">
                        <p>End Time</p>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="00"
                            maxLength="2"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            value={section.endTimeHour}
                            name="endTimeHour"
                        />
                        <p className="m-1">:</p>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="00"
                            maxLength="2"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            value={section.endTimeMin}
                            name="endTimeMin"
                        />
                        <div className="btn-group" data-toggle="buttons">
                            <label
                                onClick={() => onAmPmChange({ endTime: "AM" }, sectionIndex)}
                                className={`btn btn-sm btn-info bil-settings-btn ${
                                    section.amPmSettings.endTime === "AM" ? "active" : ""
                                }`}
                            >
                                AM
                            </label>

                            <label
                                onClick={() => onAmPmChange({ endTime: "PM" }, sectionIndex)}
                                className={`btn btn-sm btn-info bil-settings-btn ${
                                    section.amPmSettings.endTime === "PM" ? "active" : ""
                                }`}
                            >
                                PM
                            </label>
                        </div>
                    </div>
                </div>

                {noLocationAndLecturer && (
                    <>
                        <div className="time-start" style={{ justifyContent: "flex-start", marginTop: "15px" }}>
                            <p>Lecturer</p>
                            <input
                                type="text"
                                style={{ width: "380px" }}
                                className="form-control"
                                onChange={onFieldChange}
                                placeholder="Ex - John Doe"
                                disabled={fullDisable}
                                value={section.lecturerOne}
                                name="lecturerOne"
                            />
                        </div>
                        <div className="time-start" style={{ justifyContent: "flex-start", marginTop: "15px" }}>
                            <p>Location</p>
                            <input
                                type="text"
                                style={{ width: "380px" }}
                                className="form-control"
                                onChange={onFieldChange}
                                placeholder="Ex - Room 1"
                                disabled={fullDisable}
                                value={section.facility}
                                name="facility"
                            />
                        </div>
                    </>
                )}

                {!noLocationAndLecturer && (
                    <>
                        <CustomSelect
                            label="Lecturer One"
                            name="lecturerOne"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            selectedValue={section.lecturerOne ? section.lecturerOne : ""}
                            options={optionsForLecturer}
                        />

                        <CustomSelect
                            label="Lecturer Two"
                            name="lecturerTwo"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            selectedValue={section.lecturerTwo ? section.lecturerTwo : ""}
                            options={optionsForLecturer}
                        />

                        <CustomSelect
                            label="Location"
                            name="facility"
                            disabled={fullDisable}
                            onChange={onFieldChange}
                            selectedValue={section.facility ? section.facility : ""}
                            options={optionsForLocation}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default TimeAllocationComponent;
