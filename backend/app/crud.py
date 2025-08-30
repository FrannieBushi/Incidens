from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app import models, schemas

async def get_users(db: AsyncSession):
    result = await db.execute(select(models.User))
    return result.scalars().all()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=user.password_hash,
        role_id=user.role_id,
        office_id=user.office_id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user