from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase

bearer = HTTPBearer()


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)):
    token = cred.credentials
    try:
        res = get_supabase().auth.get_user(token)
        user = res.user if res else None
    except Exception:
        user = None

    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido ou expirado")

    return {"id": user.id, "email": user.email, "token": token}