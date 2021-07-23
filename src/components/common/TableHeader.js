import React from "react";
import Button from "react-bootstrap/Button";
import { CSVLink } from "react-csv";

const TableHeader = ({ title, filename = "", csvData = [], btnText = "", onClick }) => {
    filename = filename === "" ? title : filename;
    return (
        <div className="bil-header">
            <h5>{title}</h5>
            {csvData.length > 0 && (
                <CSVLink
                    className="btn btn-info btn-sm"
                    data={csvData}
                    filename={`${filename}.csv`}
                    style={{ marginRight: "15px", marginLeft: "15px" }}
                >
                    <i className="fa fa-file-excel-o pr-2" aria-hidden="true" />
                    Download CSV
                </CSVLink>
            )}
            {btnText && (
                <Button onClick={onClick} variant="info" size="sm">
                    <i className="fa fa-plus pr-2" aria-hidden="true" />
                    {btnText}
                </Button>
            )}
        </div>
    );
};

export default TableHeader;
