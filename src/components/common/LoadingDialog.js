import React from "react";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

const LoadingDialog = ({ show, hide, label }) => {
    return (
        <Modal
            size="sm"
            show={show}
            onHide={hide}
            animation={false}
            style={{ marginTop: "200px" }}
            backdropClassName="bil-custom-backdrop"
        >
            <Modal.Body className="text-center p-4 bil-loading-modal">
                <Spinner style={{ marginRight: "20px" }} animation="grow" /> {label}
            </Modal.Body>
        </Modal>
    );
};

export default LoadingDialog;
