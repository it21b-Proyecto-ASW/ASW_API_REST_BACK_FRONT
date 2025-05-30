from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User

class APIKeyAuthentication(BaseAuthentication):
    HEADER = "X-API-Key"

    class DRFUserWrapper:
        def __init__(self, user):
            self._user = user
            self.is_authenticated = True

        def __getattr__(self, attr):
            return getattr(self._user, attr)

    def authenticate(self, request):
        key = request.headers.get(self.HEADER)
        if not key:
            raise AuthenticationFailed("API key requerida")

        try:
            user = User.objects.get(apikey=key)
        except User.DoesNotExist:
            raise AuthenticationFailed("API key invalida")

        return (self.DRFUserWrapper(user), None)