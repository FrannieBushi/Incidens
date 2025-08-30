from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ========================
# OFFICE SCHEMAS
# ========================

class OfficeBase(BaseModel):
    city: str

class OfficeCreate(OfficeBase):
    pass

class OfficeUpdate(BaseModel):
    city: Optional[str] = None

class OfficeResponse(OfficeBase):
    office_id: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# ========================
# USER ROLE SCHEMAS
# ========================

class UserRoleBase(BaseModel):
    name: str

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleUpdate(BaseModel):
    name: Optional[str] = None

class UserRoleResponse(UserRoleBase):
    role_id: int

    class Config:
        orm_mode = True

# ========================
# DEVICE TYPE SCHEMAS
# ========================

class DeviceTypeBase(BaseModel):
    name: str

class DeviceTypeCreate(DeviceTypeBase):
    pass

class DeviceTypeUpdate(BaseModel):
    name: Optional[str] = None

class DeviceTypeResponse(DeviceTypeBase):
    type_id: int

    class Config:
        orm_mode = True

# ========================
# INCIDENT STATUS SCHEMAS
# ========================

class IncidentStatusBase(BaseModel):
    name: str

class IncidentStatusCreate(IncidentStatusBase):
    pass

class IncidentStatusUpdate(BaseModel):
    name: Optional[str] = None

class IncidentStatusResponse(IncidentStatusBase):
    status_id: int

    class Config:
        orm_mode = True

# ========================
# USER SCHEMAS
# ========================

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class UserCreate(UserBase):
    password_hash: str
    role_id: int
    office_id: Optional[int] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    office_id: Optional[int] = None
    password_hash: Optional[str] = None

class UserResponse(UserBase):
    user_id: int
    office_id: Optional[int]
    role_id: int

    class Config:
        orm_mode = True

class UserWithRelations(UserResponse):
    office: Optional[OfficeResponse] = None
    role: Optional[UserRoleResponse] = None

# ========================
# DEVICE SCHEMAS
# ========================

class DeviceBase(BaseModel):
    office_id: int
    owner_id: Optional[int] = None
    type_id: int

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    office_id: Optional[int] = None
    owner_id: Optional[int] = None
    type_id: Optional[int] = None

class DeviceResponse(DeviceBase):
    device_id: int

    class Config:
        orm_mode = True

class DeviceWithRelations(DeviceResponse):
    office: Optional[OfficeResponse] = None
    owner: Optional[UserResponse] = None
    type: Optional[DeviceTypeResponse] = None

# ========================
# INCIDENT SCHEMAS
# ========================

class IncidentBase(BaseModel):
    description: str
    status_id: int
    reporter_id: int
    office_id: int
    device_id: Optional[int] = None
    resolver_id: Optional[int] = None

class IncidentCreate(IncidentBase):
    opened_at: Optional[datetime] = None

class IncidentUpdate(BaseModel):
    description: Optional[str] = None
    status_id: Optional[int] = None
    resolver_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    device_id: Optional[int] = None

class IncidentResponse(IncidentBase):
    incident_id: int
    opened_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class IncidentWithRelations(IncidentResponse):
    status: Optional[IncidentStatusResponse] = None
    reporter: Optional[UserResponse] = None
    resolver: Optional[UserResponse] = None
    office: Optional[OfficeResponse] = None
    device: Optional[DeviceResponse] = None
    history: Optional[List['IncidentHistoryResponse']] = []

# ========================
# INCIDENT HISTORY SCHEMAS
# ========================

class IncidentHistoryBase(BaseModel):
    incident_id: int
    status_id: int
    comment: Optional[str] = None

class IncidentHistoryCreate(IncidentHistoryBase):
    date: Optional[datetime] = None

class IncidentHistoryUpdate(BaseModel):
    status_id: Optional[int] = None
    comment: Optional[str] = None

class IncidentHistoryResponse(IncidentHistoryBase):
    history_id: int
    date: datetime

    class Config:
        orm_mode = True

class IncidentHistoryWithRelations(IncidentHistoryResponse):
    incident: Optional[IncidentResponse] = None
    status: Optional[IncidentStatusResponse] = None

IncidentWithRelations.model_rebuild()