import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
    return (
        <div className="min-h-screen bg-white p-4">
            <SwaggerUI url="/openapi-sis.json" />
        </div>
    );
}