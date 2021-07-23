import React from "react";

const ClassboxComponent = ({time, day, onViewStudentList, onDelete, onEdit, onClick, onDoubleClick, showActionList}) => {
    let c = time;
    return (
        <div
            key={c.sectionId}
            onClick={onClick}
            onDoubleClick={() => onDoubleClick(c)}
            className="bil-item-class"
            style={{
                width: c.width + "%",
                marginLeft: c.marginLeft + "%",
                backgroundColor: c.backgroundColor,
                border: `1px solid ${c.backgroundColor}`,
            }}
        >
            <p className="text-center m-0">
                {c.customSubjectId} {c.subjectName}
            </p>
            {c.lecturerOne && <small className="m-0">{c.lecturerOne.name}</small>}
            {c.lecturerTwo && <small className="m-0">{c.lecturerTwo.name}</small>}
            <small className="m-0 bil-small">
                {c.startTimeHour + ":" + c.startTimeMin + " " + c.amPmSettings.startTime}-
                {c.endTimeHour + ":" + c.endTimeMin + " " + c.amPmSettings.endTime}
                ({c.facility && <span>{c.facility.name}</span>})
            </small>

            {showActionList && (
                <div className="bil-class-hover">
                    <div className="bil-class-hsl">
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit(c, day);
                            }}
                            className="btn btn-sm btn-light"
                        >
                            <i className="fa fa-edit" aria-hidden="true"/>
                        </button>
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete(c, day);
                            }}
                            className="btn btn-sm btn-light"
                        >
                            <i className="fa fa-trash-o" aria-hidden="true"/>
                        </button>
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onViewStudentList(c);
                            }}
                            className="btn btn-sm btn-light"
                        >
                            <i className="fa fa-users" aria-hidden="true"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
    // } else {
    //     return <div className="bil-single-class" onClick={() => onClick(time, day, "add")} />;
    // }
};

export default ClassboxComponent;
