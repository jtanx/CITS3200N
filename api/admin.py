from django.contrib import admin
from api.models import *

# Models to be shown in the Django administrator interface
admin.site.register(Survey)
admin.site.register(SurveyQuestion)
admin.site.register(QuestionResponse)
admin.site.register(SurveyResponse)
