from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app import models, schemas, auth

# ========================
# USER CRUD OPERATIONS
# ========================

async def get_users(db: AsyncSession):
    result = await db.execute(select(models.User))
    return result.scalars().all()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    user_data = user.model_dump()
    
    if 'password' in user_data:
        user_data['password_hash'] = auth.hash_password(user_data.pop('password'))
    elif 'password_hash' in user_data:
        user_data['password_hash'] = auth.hash_password(user_data['password_hash'])
    
    db_user = models.User(**user_data)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.User).filter(models.User.user_id == user_id)
    )
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(
        select(models.User).filter(models.User.email == email)
    )
    return result.scalars().first()

async def update_user(db: AsyncSession, user_id: int, user_data: schemas.UserUpdate):
    result = await db.execute(
        select(models.User).filter(models.User.user_id == user_id)
    )
    db_user = result.scalars().first()
    
    if not db_user:
        return None
    
    update_data = user_data.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["password_hash"] = auth.hash_password(update_data.pop("password"))
    elif "password_hash" in update_data:
        update_data["password_hash"] = auth.hash_password(update_data["password_hash"])
    
    for field, value in update_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.User).filter(models.User.user_id == user_id)
    )
    db_user = result.scalars().first()
    
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return True
    
    return False

async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user or not auth.verify_password(password, user.password_hash):
        return False
    return user

# ========================
# INCIDENT CRUD OPERATIONS
# ========================

async def get_incidents(db: AsyncSession):
    result = await db.execute(select(models.Incident))
    return result.scalars().all()

async def create_incident(db: AsyncSession, incident: schemas.IncidentCreate):
    incident_data = incident.model_dump()
    db_incident = models.Incident(**incident_data)
    db.add(db_incident)
    await db.commit()
    await db.refresh(db_incident)
    return db_incident

async def get_incident_by_id(db: AsyncSession, incident_id: int):
    result = await db.execute(
        select(models.Incident).filter(models.Incident.incident_id == incident_id)
    )
    return result.scalars().first()

async def update_incident(db: AsyncSession, incident_id: int, incident_data: schemas.IncidentUpdate):
    result = await db.execute(
        select(models.Incident).filter(models.Incident.incident_id == incident_id)
    )
    db_incident = result.scalars().first()
    
    if not db_incident:
        return None
    
    update_data = incident_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(db_incident, field):
            setattr(db_incident, field, value)
    
    await db.commit()
    await db.refresh(db_incident)
    return db_incident

async def delete_incident(db: AsyncSession, incident_id: int):
    result = await db.execute(
        select(models.Incident).filter(models.Incident.incident_id == incident_id)
    )
    db_incident = result.scalars().first()
    
    if db_incident:
        await db.delete(db_incident)
        await db.commit()
        return True
    
    return False

# ========================
# REFERENCE DATA OPERATIONS
# ========================

async def get_offices(db: AsyncSession):
    result = await db.execute(select(models.Office))
    return result.scalars().all()

async def get_user_roles(db: AsyncSession):
    result = await db.execute(select(models.UserRole))
    return result.scalars().all()

async def get_incident_statuses(db: AsyncSession):
    result = await db.execute(select(models.IncidentStatus))
    return result.scalars().all()

async def get_device_types(db: AsyncSession):
    result = await db.execute(select(models.DeviceType))
    return result.scalars().all()