from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User 

class APIKeyAuthentication(BaseAuthentication):

    HEADER = "X-API-Key"

    def authenticate(self, request):
        key = request.headers.get(self.HEADER)
        print("Cabecera recibida:", key)
        if not key:
            raise AuthenticationFailed("API key requerida")

        try:
            user = User.objects.get(apikey=key)
        except User.DoesNotExist:
            raise AuthenticationFailed("API key invalida")

        return (user, None)