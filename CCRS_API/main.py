from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from complainants import router as complainant_router
from complaints import router as complaint_router
from officers import router as officer_router
from report import router as report_router
# from __test import *

app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default Home Page For One to Get Start
@app.get("/", summary="Getting Basic Details About CRS API", tags=["Main Page"])
def home_page():
    return {
        "CRS Home Page": "Welcome to Cyber Crime Reporting Station",
        "Endpoints": {  
            "path": "/docs",
            "method": "GET",
            "description": "Get a list of all available endpoints"
        }
    }



app.include_router(complainant_router,prefix="/crs",tags=["Complainants"])
app.include_router(complaint_router,prefix="/crs",tags=["Complaints"])
app.include_router(officer_router,prefix="/crs",tags=["Officers"])
app.include_router(report_router,prefix="/crs",tags=["Report"])

