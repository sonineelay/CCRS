from fastapi import APIRouter, HTTPException
from bson import json_util
import json
from database import complaints_collection
from models import Complaint, Report
from datetime import datetime, timedelta

router = APIRouter()

# Report Generation will be done here
@router.post("/generate_report", summary="Generating A Simple Short Report", tags=["Report"])
def generate_report(reportDoc: Report):
    # print("Helllo")
    from_dt = datetime.strptime(reportDoc.from_dt, "%d/%m/%YT%H:%M:%S")
    to_dt = datetime.strptime(reportDoc.to_dt, "%d/%m/%YT%H:%M:%S") + timedelta(days=1)

    # Logic to filter complaints based on the given parameters
    filtered_complaints = get_filtered_complaints(
        from_dt, to_dt, reportDoc.type_dt, reportDoc.by_status, reportDoc.by_officer, reportDoc.by_priority, reportDoc.by_category
    )

    return {"report_data": json.loads(json_util.dumps(list(filtered_complaints)))}

def get_filtered_complaints(from_dt, to_dt, type_dt, by_status, by_officer, by_priority, by_category):
    # Add your logic to filter complaints based on the parameters provided in the report
    # For now, I'm assuming you have a list of complaints and you are filtering them

    all_complaints = complaints_collection.find()  # Replace [...] with your actual list of Complaint objects
    filtered_complaints = []
    if type_dt == "incident_datetime":
        for complaint in all_complaints:
            complaint_datetime = datetime.strptime(complaint['incident_datetime'], "%Y-%m-%d %H:%M")
            # print("i",complaint)
            # print(complaint['complaint_id'], ":", from_dt, complaint_datetime, to_dt, ":", (from_dt <= complaint_datetime <= to_dt), "\n")
            if from_dt <= complaint_datetime <= to_dt:
                filtered_complaints.append(dict(complaint))
    elif type_dt == "registration_datetime":
        for complaint in all_complaints:
            complaint_datetime = datetime.strptime(complaint['registration_datetime'], "%Y-%m-%d %H:%M")
            if from_dt <= complaint_datetime <= to_dt:
                filtered_complaints.append(dict(complaint))
    elif type_dt == "creation_datetime":
        for complaint in all_complaints:
            complaint_datetime = complaint['creation_datetime']
            if from_dt <= complaint_datetime <= to_dt:
                filtered_complaints.append(dict(complaint))
    # print(complaint['complaint_id'],":",from_dt, complaint_datetime , to_dt)
    

    return filtered_complaints
