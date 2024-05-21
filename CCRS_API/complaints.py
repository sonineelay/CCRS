from fastapi import APIRouter, HTTPException
from bson import json_util
import json
from database import complaints_collection, complainants_collection, officers_collection
from models import Complaint, ProgressDetails, OfficerStatus, Status, Updater
from typing import Optional,List
from datetime import datetime

router = APIRouter()

# Retrieve and return a list of complaints
@router.get("/complaints", summary="Getting all Complaint List", tags=["Complaints"])
def get_complaint_list():
    complaint = complaints_collection.find()
    return json.loads(json_util.dumps(list(complaint)))


# Retrieve and return a specific complaint by ID
@router.get("/complaints/{complaint_id}", summary="Getting Complaint details by ID", tags=["Complaints"])
def get_complaint(complaint_id: str):
    complaint = complaints_collection.find_one({"complaint_id": complaint_id})
    if complaint:
        return json.loads(json_util.dumps(complaint))
    else:
        raise HTTPException(status_code=404, detail="Complaint not found")


# Create a new complaint
@router.post("/complaint", summary="Creating a new Complaint", tags=["Complaints"])
def create_complaint(complaint: Complaint):
    try:
        count = complaints_collection.count_documents({}) + 1
        complaint_id = f"CMPT{count:03}"
        complaint.complaint_id = complaint_id
        complaint.status = Status.registered
        complaints_collection.insert_one(complaint.dict())

        # Update complainant's complaints list
        if complaint.complainant_id:
            complainants_collection.update_one(
                {"complainant_id": complaint.complainant_id},
                {"$addToSet": {"complaints": {"complaint_id": complaint_id,
                                              "officer_id": complaint.complaint_incharge_id,
                                              "status": Status.registered}}}
            )

        # Update officers's complaints list
        if complaint.complaint_incharge_id:
            officers_collection.update_one(
                {"officer_id": complaint.complaint_incharge_id},
                {"$addToSet": {"complaints": {"complaint_id": complaint_id,
                                              "complainant_id": complaint.complainant_id,
                                              "status": OfficerStatus.case_incharge}}}
            )

        return {"message": "Complaint created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Update a specific complaint by ID

@router.put("/complaints/{complaint_id}", summary="Updating a Complaint by ID", tags=["Complaints"])
def update_complaint(complaint_id: str, updated_complaint: Complaint):
    try:
        # Find the existing complaint
        existing_complaint = complaints_collection.find_one({"complaint_id": complaint_id})
        if existing_complaint:

            changes = Complaint(**existing_complaint).comparing_details(updated_complaint)

            if changes:

                if "status" in changes:
                    handle_progress_update(complaint_id, updated_complaint.progress, True, updated_complaint.status)
                    if updated_complaint.status == Status.solved:
                        complainants_collection.update_one(
                            {"complainant_id": existing_complaint['complainant_id'],
                             "complaints.complaint_id": complaint_id},
                            {"$set": {"complaints.$.status": Status.solved}}
                        )
                        officers_collection.update_one(
                            {"officer_id": existing_complaint['complaint_incharge_id'],
                             "complaints.complaint_id": complaint_id},
                            {"$set": {"complaints.$.status": OfficerStatus.case_completed}}
                        )
                    elif updated_complaint.status == Status.dismissed:
                        complainants_collection.update_one(
                            {"complainant_id": existing_complaint['complainant_id'],
                             "complaints.complaint_id": complaint_id},
                            {"$set": {"complaints.$.status": Status.dismissed}}
                        )
                        officers_collection.update_one(
                            {"officer_id": existing_complaint['complaint_incharge_id'],
                             "complaints.complaint_id": complaint_id},
                            {"$set": {"complaints.$.status": OfficerStatus.case_dismissed}}
                        )

                    result = complaints_collection.update_one(
                            {"complaint_id": complaint_id},
                            {"$set": {"status":updated_complaint.status}}
                    )
                    # print(result)
                    # If Their is change in status then exit
                    return {"message":"Updated Successfully..."}

                # Handle officer change
                if "officer" in changes:
                    change_assigned_officer(complaint_id, updated_complaint.complaint_incharge_id)

                if "progress" in changes:
                    handle_progress_update(complaint_id, updated_complaint.progress)

                if "details" in changes:
                    # Ensure complaint_id is not updated
                    # print(updated_complaint)
                    updated_complaint_dict = dict(updated_complaint.dict(exclude_unset=True))
                    updated_complaint_dict.pop('progress')
                    updated_complaint_dict.pop('status')
                    complaints_collection.update_one(
                        {"complaint_id": complaint_id},
                        {"$set": updated_complaint_dict}
                    )
                    
                
                return {"message": f"Updates Made In {', '.join(changes)}"}
            else:
                return {"message": "No Changes Made"}
        else:
            # Complaint not found, raise HTTP 404 error
            raise HTTPException(status_code=404, detail="Complaint not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Change assigned officer for a specific complaint
def change_assigned_officer(complaint_id: str, new_officer_id: str):
    try:
        existing_complaint = complaints_collection.find_one({"complaint_id": complaint_id})

        if existing_complaint:
            old_officer_id = existing_complaint.get('complaint_incharge_id')

            if old_officer_id:
                # Update the status for the existing officer
                officers_collection.update_one(
                    {"officer_id": old_officer_id, "complaints.complaint_id": complaint_id},
                    {"$set": {"complaints.$.status": OfficerStatus.case_transferred}}
                )

                # Check if the complaint exists in the new officer's complaints array
                complaint_exists_in_new_officer = officers_collection.find_one({
                    "officer_id": new_officer_id,
                    "complaints.complaint_id": complaint_id
                })

                if complaint_exists_in_new_officer:
                    # If the complaint exists, update the status to OfficerStatus.case_incharge
                    officers_collection.update_one(
                        {"officer_id": new_officer_id, "complaints.complaint_id": complaint_id},
                        {"$set": {"complaints.$.status": OfficerStatus.case_incharge}}
                    )
                else:
                    # If the complaint doesn't exist, add it to the new officer's complaints list
                    new_officer_complaint = {
                        "complaint_id": complaint_id,
                        "complainant_id": existing_complaint.get("complainant_id", ""),
                        "status": OfficerStatus.case_incharge
                    }
                    officers_collection.update_one(
                        {"officer_id": new_officer_id},
                        {"$addToSet": {"complaints": new_officer_complaint}}
                    )

            # Updating the complainant's Detail
            complainant_id = existing_complaint.get("complainant_id", "")
            if complainant_id:
                complainants_collection.update_one(
                    {"complainant_id": complainant_id, "complaints.complaint_id": complaint_id},
                    {"$set": {"complaints.$.officer_id": new_officer_id}}
                )

            # Update complaint's assigned_officer_id
            complaints_collection.update_one(
                {"complaint_id": complaint_id},
                {"$set": {"complaint_incharge_id": new_officer_id}}
            )

            old_officer = officers_collection.find_one({"officer_id": old_officer_id})
            new_officer = officers_collection.find_one({"officer_id": new_officer_id})

            # Update Progress Field
            progress_description = f"Complaint transferred from \"{old_officer.get('first_name')} {old_officer.get('middle_name')} {old_officer.get('last_name')} ({old_officer_id})\" to \"{new_officer.get('first_name')} {new_officer.get('middle_name')} {new_officer.get('last_name')} ({new_officer_id})\""
            progress_object = {
                "updated_by": Updater.sys,
                "progress_description": progress_description,
                "update_datetime": datetime.now().strftime("%d/%m/%YT%H:%M:%S")
            }
            complaints_collection.update_one(
                {"complaint_id": complaint_id},
                {"$addToSet": {"progress": progress_object}}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Handle progress update for a specific complaint
def handle_progress_update(complaint_id: str, progress_list: List[ProgressDetails],statusChecker :bool=False,status=""):
    try:
        # Get the existing progress
        existing_complaint = complaints_collection.find_one({"complaint_id": complaint_id})
        existing_progress = existing_complaint.get("progress", [])

        # Create sets of timestamps for old and new progress
        old_timestamps = set(progress["update_datetime"] for progress in existing_progress)
        new_timestamps = set(progress.update_datetime for progress in progress_list)

        # Find common timestamps between old and new progress
        common_timestamps = old_timestamps.intersection(new_timestamps)

        # Filter progress with common timestamps
        common_progress_old = [progress for progress in existing_progress if progress["update_datetime"] in common_timestamps]
        common_progress_new = [progress for progress in progress_list if progress.update_datetime in common_timestamps]

        # Check if the description is different for common timestamps and update accordingly
        updated_progress = []
        for progress_old, progress_new in zip(common_progress_old, common_progress_new):
            if progress_old["progress_description"] != progress_new.progress_description:
                progress_old["progress_description"] = progress_new.progress_description
                progress_old["updated_by"] = progress_new.updated_by
                progress_old["update_datetime"] = datetime.now().strftime("%d/%m/%YT%H:%M:%S")
                # print(datetime.now().strftime("%d/%m/%YT%H:%M:%S"))

            updated_progress.append(progress_old)

        # Add new progress to existing progress
        updated_progress += [progress.dict() for progress in progress_list if progress.update_datetime not in old_timestamps]

        # Update the complaint with the new progress
        complaints_collection.update_one(
            {"complaint_id": complaint_id},
            {"$set": {"progress": updated_progress}}
        )

        # Update complainant's status to "In Progress"
        complainant_id = existing_complaint.get("complainant_id", "")
        if complainant_id:
            complainants_collection.update_one(
                {"complainant_id": complainant_id, "complaints.complaint_id": complaint_id},
                {"$set": {"complaints.$.status": Status.in_progress}}
            )

            complaints_collection.update_one(
                {"complaint_id": complaint_id},
                {"$set": {"status": Status.in_progress}}
            )
        
        if statusChecker:
            # Additional logic for handling status updates
            # progress_description 
            progress_description = ''
            if status == Status.solved:
                progress_description = 'Case Solved Successfully.'
            elif status == Status.dismissed:
                progress_description = 'Sorry, Case Has Been Dismissed.'
            
            progress_object = ProgressDetails(updated_by=Updater.sys, progress_description=progress_description)
            complaints_collection.update_one(
                {"complaint_id": complaint_id},
                {"$addToSet": {"progress": progress_object.dict()}}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
