import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const ConfirmDialog = ({ show, hide, onDelete, label }) => {
    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton className="bil-cd-header"/>
            <Modal.Body className="text-center pt-0 pb-5">{label}</Modal.Body>
            <Modal.Footer className="bil-cd-btn">
                <Button variant="secondary" onClick={hide}>
                    Cancel
                </Button>
                <Button variant="info" onClick={onDelete}>
                    <i className="fa fa-trash-o pr-2" aria-hidden="true" /> Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDialog;
