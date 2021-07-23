import React from "react";
import {Link} from "react-router-dom";
import englist from "../utility/languages/englist";
import constants from "../utility/constants";
import arabic from "../utility/languages/arabic";

function ForgetPasswordComponent() {
    const userData = JSON.parse(localStorage.getItem("user"));
    let language;
    if (!userData) {
        language = constants.DEFAULT_LANGUAGE === constants.ENGLISH ? englist : arabic;
    } else {
        const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
        language = appLanguage === constants.ENGLISH ? englist : arabic;
    }

    return (
        <main className="container bil-vertical-center">
            <div className="bil-shared-form bil-form">
                <h2 className="text-center mb-5 mt-0">
                    <i className="fa fa-calendar" aria-hidden="true" /> {language.reset_password}
                </h2>
                <form className="form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input type="email" className="form-control" id="email" aria-describedby="emailHelp" />
                    </div>

                    <button className="btn btn-primary bil-btn">Reset</button>
                    <hr />
                    <small className="text-center m-2">
                        Would like to login? <br /> <Link to="/login">Login</Link>
                    </small>
                </form>
            </div>
        </main>
    );
}

export default ForgetPasswordComponent;
