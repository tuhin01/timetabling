import React from 'react';
import Form from "react-bootstrap/Form";
import englist from "../../utility/languages/englist";

const CustomSelect = ({label, name, selectedValue, onChange, options, disabled = false}) => {
    const language = englist;

    return (
        <div className="bil-cl-ad-select">
            <Form.Label>{label}</Form.Label>
            <Form.Control disabled={disabled} name={name} as="select" value={selectedValue ? selectedValue : ""} onChange={onChange}>
                <option value="">{language.please_select}</option>
                {options.map(option => {
                    return <option key={option.value} value={option.value}>{option.label}</option>
                })}
            </Form.Control>
        </div>
    );
};

export default CustomSelect;
