import asyncio
from .database import AsyncSessionLocal, engine, Base
from sqlalchemy import select 
from . import models

async def init_db():
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        
        result = await db.execute(select(models.UserRole))
        if result.scalars().first():
            print("✅ La base de datos ya tiene datos")
            return
        
        
        roles = [
            models.UserRole(name="admin"),
            models.UserRole(name="technician"),
            models.UserRole(name="user")
        ]
        
        
        statuses = [
            models.IncidentStatus(name="open"),
            models.IncidentStatus(name="in_progress"),
            models.IncidentStatus(name="resolved"),
            models.IncidentStatus(name="closed")
        ]
        
        
        device_types = [
            models.DeviceType(name="laptop"),
            models.DeviceType(name="desktop"),
            models.DeviceType(name="printer"),
            models.DeviceType(name="phone")
        ]
        
        db.add_all(roles)
        db.add_all(statuses)
        db.add_all(device_types)
        
        await db.commit()
        print("✅ Datos iniciales insertados correctamente")

if __name__ == "__main__":
    asyncio.run(init_db())