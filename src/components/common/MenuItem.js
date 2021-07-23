import React from 'react';
import {Link} from "react-router-dom";

function MenuItem({active, redirectTo, icon, label}) {
    return (
        <li className={(active) ? 'active' : ''}>
            <Link to={redirectTo}>
                <i className={icon} aria-hidden="true" /> {label}
            </Link>
        </li>
    );
}

export default MenuItem;
