from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime

class CCRSValidator(BaseModel):
    @classmethod
    @validator("creation_datetime", "update_datetime", pre=True, always=True)
    def validate_creation_date(cls, v):
        try:
            parsed_date = datetime.strptime(str(v), "%Y-%m-%dT%H:%M:%S")
            formatted_date = parsed_date.strftime("%d/%m/%YT%H:%M:%S")
            return formatted_date
        except ValueError:
            raise ValueError("Invalid date format. Must be in the form of YYYY-MM-DDTHH:MM:SS.")

    @classmethod
    @validator("registered_phone", "alternate_phone", pre=True, always=True)
    def validate_phone_number(cls, v):
        if not (isinstance(v, int) and 10 ** 9 <= v <= 10 ** 10 - 1):
            raise ValueError("Invalid phone number. Must be a 10-digit number only.")
        return v

    @classmethod
    @validator("aadhaar_card_number", pre=True, always=True)
    def validate_aadhaar_card_number(cls, v):
        if not (isinstance(v, int) and 10 ** 11 <= v <= 10 ** 12 - 1):
            raise ValueError("Invalid Aadhaar number. Must be a 12-digit number only.")
        return v

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class OfficerStatus(str, Enum):
    case_incharge = "Case Incharge"
    case_transferred = "Case Transferred"  
    case_completed = "Case Completed"  
    case_dismissed = "Case Dismissed"  

class Status(str, Enum):
    dismissed = "dismissed"
    solved = "solved"
    registered = "registered"
    in_progress = "In Progress"

class Victim(BaseModel):
    victim_name: str = "Unknown"
    relationship: str = "self"

class Updater(str, Enum):
    sys = "System"
    usr = "User"

class Expertise(BaseModel):
    field: str
    experience_years: int

class CaseStatusFComplainant(BaseModel):
    complaint_id: str
    officer_id: str
    status: Status

class CaseStatusFOfficer(BaseModel):
    complaint_id: str
    complainant_id: str
    status: OfficerStatus

class ProgressDetails(CCRSValidator):
    updated_by: Optional[Updater] = Updater.sys
    progress_description: str
    update_datetime: Optional[str] = datetime.now().strftime("%d/%m/%YT%H:%M:%S")
class Complainant(CCRSValidator):
    complainant_id: Optional[str] = ""
    first_name: str
    middle_name: str
    last_name: str
    date_of_birth: str
    gender: Gender
    registered_phone: int
    alternate_phone: Optional[int] = None
    email: EmailStr = ""
    alternate_email: Optional[EmailStr] = None
    isVictim: bool
    victim: Victim
    aadhaar_card_number: int
    current_address: str
    permanent_address: str
    occupation: str
    nationality: str
    complaints: List[CaseStatusFComplainant] = []
    creation_datetime: datetime = Field(default_factory=datetime.now, immutable=True)

class Officer(CCRSValidator):
    officer_id: Optional[str] = ""
    first_name: str
    middle_name: str
    last_name: str
    position: str
    nationality: str
    gender: Gender
    date_of_birth: str
    registered_phone: int
    alternate_phone: Optional[int] = None
    email: EmailStr = ""
    alternate_email: Optional[EmailStr] = None
    aadhaar_card_number: int
    current_address: str
    permanent_address: str
    expertise_in: List[Expertise] = []
    complaints: List[CaseStatusFOfficer] = []
    creation_datetime: datetime = Field(default_factory=datetime.now, immutable=True)

class Complaint(CCRSValidator):
    complaint_id: Optional[str] = Field(default_factory=lambda: str(datetime.now().timestamp()), immutable=True)  # Fixed default_factory
    complainant_id: str = Field(default_factory=str, immutable=True)
    complaint_incharge_id: str = ""
    complaint_categories: str
    description: str
    priority: Priority
    status: Optional[Status] = Status.registered  # Set a default status
    progress: List[ProgressDetails] = []
    incident_datetime: str
    registration_datetime: str
    creation_datetime: datetime = Field(default_factory=datetime.now, immutable=True)

    def comparing_details(self, updated_complaint: "Complaint") -> List[str]:
        changes = []

        if self.complaint_incharge_id != updated_complaint.complaint_incharge_id:
            changes.append("officer")

        if (
            self.complaint_categories != updated_complaint.complaint_categories or
            self.description != updated_complaint.description or
            self.priority != updated_complaint.priority or
            self.incident_datetime != updated_complaint.incident_datetime
        ):
            changes.append("details")

        if  self.status != updated_complaint.status:
            changes.append("status")

        if len(self.progress) != len(updated_complaint.progress):
            changes.append("progress")
        else:
            for i in range(len(self.progress)):
                if self.progress[i].dict() != updated_complaint.progress[i].dict():
                    changes.append("progress")
                    break

        return changes

class Report(BaseModel):
    from_dt: str = datetime.now().strftime("%d/%m/%YT%H:%M:%S")
    to_dt: str = datetime.now().strftime("%d/%m/%YT%H:%M:%S")
    type_dt : str
    by_status : Optional[str] = ""
    by_officer : Optional[str] = ""
    by_priority : Optional[str] = ""
    by_category : Optional[str] = ""