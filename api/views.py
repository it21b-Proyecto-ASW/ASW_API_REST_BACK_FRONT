# api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --- ISSUES ---

@api_view(['POST'])
def create_issue(request):
    """Crear un nuevo issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def get_issue(request, issue_id):
    """Obtener info de un issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def list_issues(request):
    """Obtener una lista de issues."""
    return Response({"message": "ok"})

@api_view(['POST'])
def edit_issue(request, issue_id):
    """Editar un issue existente."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_issue(request, issue_id):
    """Eliminar un issue."""
    return Response({"message": "ok"})

@api_view(['POST'])
def assign_issue(request):
    """Asignar un issue a un user."""
    return Response({"message": "ok"})

@api_view(['POST'])
def add_file_to_issue(request, issue_id):
    """Anadir un file attachment a un issue."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_file_from_issue(request, file_id):
    """Eliminar un file attachment de un issue."""
    return Response({"message": "ok"})

@api_view(['POST'])
def bulk_insert_issues(request):
    """Bulk insert de issues."""
    return Response({"message": "ok"})

@api_view(['POST'])
def add_comment(request, issue_id):
    """Anadir un comentario a un issue."""
    return Response({"message": "ok"})

@api_view(['GET'])
def filter_issues(request):
    """Filtrar issues."""
    return Response({"message": "ok"})


# --- USERS ---

@api_view(['POST'])
def assign_apikey_to_user(request, user_id):
    """Asignar apikey a un user."""
    return Response({"message": "ok"})

@api_view(['GET'])
def user_profile(request, user_id):
    """Ver pagina de perfil de un usuario."""
    return Response({"message": "ok"})

@api_view(['POST'])
def edit_user_profile(request, user_id):
    """Editar perfil de usuario seleccionado."""
    return Response({"message": "ok"})


# --- SETTINGS ---

@api_view(['GET'])
def list_settings(request):
    """Listar todos los settings."""
    return Response({"message": "ok"})

@api_view(['POST'])
def create_setting(request):
    """Anadir un setting nuevo."""
    return Response({"message": "ok"})

@api_view(['DELETE'])
def delete_setting(request, setting_id):
    """Eliminar un setting."""
    return Response({"message": "ok"})

@api_view(['PUT'])
def edit_setting(request, setting_id):
    """Editar un setting existente."""
    return Response({"message": "ok"})
