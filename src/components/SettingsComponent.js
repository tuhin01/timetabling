import React from "react";
import englist from "../utility/languages/englist";

const SettingsComponent = ({onChange, settings}) => {

    const language = englist;

    return (
        <div className="bil-settings">
            <h6 className="text-center mb-4">{language.user_settings}</h6>
            <div className="bil-ss">
                <p>Clock Type </p>
                <div className="btn-group" data-toggle="buttons">
                    <label
                        onClick={() => onChange({ clockType: 12 })}
                        className={`btn btn-sm btn-info bil-settings-btn ${settings.clockType === 12 ? "active" : ""}`}
                    >
                        12 Hour
                    </label>

                    <label
                        onClick={() => onChange({ clockType: 24 })}
                        className={`btn btn-sm btn-info bil-settings-btn ${settings.clockType === 24 ? "active" : ""}`}
                    >
                        24 Hour
                    </label>
                </div>
            </div>
            <div className="bil-ss">
                <p>First Day of Week </p>
                <div className="btn-group" data-toggle="buttons">
                    <label
                        onClick={() => onChange({ firstDayOfWeek: "mon" })}
                        className={`btn btn-sm btn-info bil-settings-btn ${
                            settings.firstDayOfWeek === "mon" ? "active" : ""
                        }`}
                    >
                        Monday
                    </label>

                    <label
                        onClick={() => onChange({ firstDayOfWeek: "sun" })}
                        className={`btn btn-sm btn-info bil-settings-btn ${
                            settings.firstDayOfWeek === "sun" ? "active" : ""
                        }`}
                    >
                        Sunday
                    </label>
                </div>
            </div>
            <div className="bil-ss">
                <p>Time Increment</p>
                <div className="btn-group" data-toggle="buttons">
                    <label
                        onClick={() => onChange({ timeIncrement: 30 })}
                        className={`btn btn-sm btn-info bil-settings-btn ${
                            settings.timeIncrement === 30 ? "active" : ""
                        }`}
                    >
                        30 Minutes
                    </label>

                    <label
                        onClick={() => onChange({ timeIncrement: 60 })}
                        className={`btn btn-sm btn-info bil-settings-btn ${
                            settings.timeIncrement === 60 ? "active" : ""
                        }`}
                    >
                        1 Hour
                    </label>
                </div>
            </div>
        </div>
    );
};


export default SettingsComponent;
