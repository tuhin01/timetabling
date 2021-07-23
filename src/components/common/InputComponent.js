import React from "react";
import Form from "react-bootstrap/Form";

const InputComponent = (props) => {
    const { label, onChange, helpText = "", disabled = false, error, autoFocus = false, value, name, type, placeholder } = props;
    return (
        <Form.Group controlId={label + Date.now()}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                autoFocus={autoFocus}
                type={type}
                disabled={disabled}
                value={value}
                name={name}
                onChange={onChange}
                placeholder={placeholder}
            />
            {error && <Form.Text className="bil-cl-red">{error}</Form.Text>}
            {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
        </Form.Group>
    );
};

export default InputComponent;
