import React from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

function TopbarComponent({ onBarsPress, user }) {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location = "/login";
    };

    return (
        <div className="bil-top-bar">
            <div className="bil-tb-left">
                <i onClick={onBarsPress} className="fa fa-bars" aria-hidden="true" />
            </div>

            <div className="bil-tb-right">
                <Link to="/dashboard/profile">
                    <Button variant="link" className="bil-tbr-right-btn">
                        <i className="fa fa-user" aria-hidden="true" /> {user.name}
                    </Button>
                </Link>
                <Button onClick={handleLogout} variant="link" className="bil-tbr-right-btn">
                    <i className="fa fa-sign-out" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}

export default TopbarComponent;
