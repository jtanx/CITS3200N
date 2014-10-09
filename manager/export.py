from api.models import *
from django.http import HttpResponse
import tablib 
import tablib.packages.xlwt as xl

def export_all(request, pk):
    ret = export_survey(SurveyResponse.objects.filter(survey__id = pk))
    return HttpResponse(ret.xlsx, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
def export_for_user(request, pk1, pk2):
    pass

def export_survey(responses, format='csv'):
    '''responses: QuerySet of survey responses'''
    if not responses.exists():
        return None
        
    #Get the survey
    survey = responses[0].survey
    #Get the questions from the survey
    questions = survey.questions()
    
    #Initialise the output
    data = []
    book = []
    questnumber = []
    questdescription = []
    cohortdataset = {}

    #Append all the question details to list
    for q in questions:
        questnumber.append(q.number)
        questdescription.append(q.description)
    
    for response in responses:
        qrs = response.responses()
        
        #Create NEW Dataset when id is present else append to current existed dictionary
        if response.creator.id not in cohortdataset:
            cohortdataset[response.creator.id] = tablib.Dataset()
            
            
            cohortdataset[response.creator.id].append_col(questnumber)
            cohortdataset[response.creator.id].append_col(questdescription)
            
            #accomodate response data in to temporary list
            tempres = []
            for q in qrs:
                if q.qid.number in questnumber:
                    tempres.append(q.entry)
            #Apend to the column
            cohortdataset[response.creator.id].append_col(tempres)
            
            ########STRUCTURE OF THE HEADER########
            cohortdataset[response.creator.id].headers = ["Number", "Description", response.created.date()]
            ########NAME THE SHEET########
            cohortdataset[response.creator.id].title = str(response.creator.first_name)

        else:
            #accomodate response data in to temporary list
            tempres = []
            for q in qrs:
                if q.qid.number in questnumber:
                    tempres.append(q.entry)
            #Apend to the column
            cohortdataset[response.creator.id].append_col(tempres, header=response.created.date())
    
    #Initialize the Databook for export
    book = tablib.Databook()
    for k in cohortdataset:
        book.add_sheet(cohortdataset[k])
    return book
