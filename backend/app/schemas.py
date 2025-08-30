from pydantic import BaseModel

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str

class UserCreate(UserBase):
    password_hash: str
    role_id: int
    office_id: int | None = None

class UserResponse(UserBase):
    user_id: int
    office_id: int | None
    role_id: int

    class Config:
        orm_mode = True