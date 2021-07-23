import React from "react";
import englist from "../utility/languages/englist";
import constants from "../utility/constants";
import arabic from "../utility/languages/arabic";

function NotFound() {
    const userData = JSON.parse(localStorage.getItem("user"));
    let language;
    if (!userData) {
        language = constants.DEFAULT_LANGUAGE === constants.ENGLISH ? englist : arabic;
    } else {
        const { appLanguage = constants.DEFAULT_LANGUAGE } = userData.settings;
        language = appLanguage === constants.ENGLISH ? englist : arabic;
    }

    return <h1>{language.not_found}</h1>;
}

export default NotFound;
