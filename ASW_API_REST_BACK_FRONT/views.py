from django.http import FileResponse
import os
from django.conf import settings

def issue_list_view(request):
    html_path = os.path.join(settings.BASE_DIR, 'presentation', 'IssueList.html')
    return FileResponse(open(html_path, 'rb'), content_type='text/html')
