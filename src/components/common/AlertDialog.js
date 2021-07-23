import React from "react";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

const AlertDialog = ({ show, hide, label, message }) => {
    return (
        <Modal
            show={show}
            onHide={hide}
            size="sm"
            animation={false}
            style={{ marginTop: "200px" }}
            backdropClassName="bil-custom-backdrop"
        >
            <Modal.Header closeButton className="bil-modal-header">
                <Modal.Title>{label}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
        </Modal>
    );
};

export default AlertDialog;
