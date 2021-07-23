import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Draggable from "react-draggable";
import ModalDialog from "react-bootstrap/ModalDialog";

const DraggableModalDialog = (props) => {
    return (
        <Draggable handle=".modal-header">
            <ModalDialog {...props} />
        </Draggable>
    );
};

const CustomModal = ({
    show,
    hide,
    backdrop = true,
    close,
    onSave,
    label,
    children,
    animation = true,
    size = "",
    footer = true,
    validate,
    submitBtnLabel = "Save",
}) => {
    return (
        <Modal
            show={show}
            dialogAs={DraggableModalDialog}
            onHide={hide}
            backdrop={backdrop}
            keyboard={false}
            animation={animation}
            size={animation === false ? "sm" : size}
            backdropClassName="bil-custom-backdrop"
        >
            <Modal.Header closeButton className="bil-modal-header">
                <Modal.Title>{label}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bil-modal-body">{children}</Modal.Body>
            {footer && (
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Close
                    </Button>
                    <Button variant="info" disabled={validate()} onClick={onSave}>
                        <i className="fa fa-floppy-o pr-2" aria-hidden="true" /> {submitBtnLabel}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default CustomModal;
