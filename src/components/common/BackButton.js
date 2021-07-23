import React from "react";
import {useHistory} from "react-router-dom";

const BackButton = ({label, pagination}) => {
    const history = useHistory();

    return (
        <div style={{display: "flex"}}>
            <button
                style={{padding: "0 15px 10px 10px"}}
                onClick={() => history.goBack()}
                className="bil-btn-link"
            >
                <i className="fa fa-arrow-left" aria-hidden="true"/> {label}
            </button>
            <h6 className="mt-2 mb-3 text-center">{pagination}</h6>
        </div>

    );
};

export default BackButton;
