import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import AsyncSessionLocal
from backend.app import models
from backend.app.auth import hash_password

async def create_admin_user():
    try:
        async with AsyncSessionLocal() as db:
            
            from sqlalchemy.future import select
            result = await db.execute(
                select(models.User).filter(models.User.email == "mistborn@cosmere.com")
            )
            existing_admin = result.scalars().first()
            
            if existing_admin:
                print("El usuario Elend ya existe")
                print(f"   Email: {existing_admin.email}")
                return existing_admin
            
            result = await db.execute(select(models.UserRole))
            roles = result.scalars().all()
            
            if not roles:
                print("No hay roles en la base de datos. Ejecuta primero init_db()")
                return None
            
            admin_role = next((role for role in roles if role.name == "admin"), roles[0])
            
            admin_user = models.User(
                first_name="Elend",
                last_name="Venture",
                email="mistborn@cosmere.com",
                password_hash=hash_password("1234"),  
                role_id=admin_role.role_id,
                office_id=None  
            )
            
            db.add(admin_user)
            await db.commit()
            await db.refresh(admin_user)
            
            print("Usuario Elend creado exitosamente!")
            print(f"   Rol: {admin_role.name}")
            
            return admin_user
            
    except Exception as e:
        print(f"Error al crear usuario admin: {e}")
        return None

async def main():
    print("Creando usuario administrador...")
    await create_admin_user()

if __name__ == "__main__":
    asyncio.run(main())