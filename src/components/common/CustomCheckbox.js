import React from 'react';

const CustomCheckbox = ({label,isChecked, name, value, id, onChange}) => {
    return (
        <div className="day-check">
            <label style={{textTransform:"capitalize"}} htmlFor={id}>{label}</label>
            <input
                type="checkbox"
                name={name}
                checked={isChecked}
                onChange={onChange}
                id={id}
                value={value}
            />
        </div>
    );
};

export default CustomCheckbox;
