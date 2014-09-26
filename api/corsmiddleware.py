'''
Modified version of django-cors-headers
https://github.com/ottoyiu/django-cors-headers/blob/master/LICENSE.txt
'''

import re
from django import http
from django.conf import settings
try:
    from urlparse import urlparse
except ImportError:
    from urllib.parse import urlparse


'''Default settings'''
default_headers = (
    'x-requested-with',
    'content-type',
    'accept',
    'origin',
    'authorization',
    'x-csrftoken',
)
CORS_ALLOW_HEADERS = getattr(settings, 'CORS_ALLOW_HEADERS', default_headers)

default_methods = (
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
)
CORS_ALLOW_METHODS = getattr(settings, 'CORS_ALLOW_METHODS', default_methods)

CORS_URLS_REGEX = getattr(settings, 'CORS_URLS_REGEX', '^.*$')
CORS_ALLOW_CREDENTIALS = getattr(settings, 'CORS_ALLOW_CREDENTIALS', False)
CORS_ORIGIN_ALLOW_ALL = getattr(settings, 'CORS_ORIGIN_ALLOW_ALL', False)

ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin'
ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials'
ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers'
ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods'
ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age'


class CorsMiddleware(object):
    def process_request(self, request):
        '''
            If CORS preflight header, then create an empty body response (200 OK) and return it

            Django won't bother calling any other request view/exception middleware along with
            the requested view; it will call any response middlewares
        '''
        if (self.is_enabled(request) and
            request.method == 'OPTIONS' and
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' in request.META):
            response = http.HttpResponse()
            return response
        return None

    def process_response(self, request, response):
        '''
            Add the respective CORS headers
        '''
        
        origin = request.META.get('HTTP_ORIGIN')
        if self.is_enabled(request) and origin:
            if CORS_ORIGIN_ALLOW_ALL:
                response[ACCESS_CONTROL_ALLOW_ORIGIN] = "*" if not CORS_ALLOW_CREDENTIALS else origin

            if CORS_ALLOW_CREDENTIALS:
                response[ACCESS_CONTROL_ALLOW_CREDENTIALS] = 'true'

            if request.method == 'OPTIONS':
                response[ACCESS_CONTROL_ALLOW_HEADERS] = ', '.join(CORS_ALLOW_HEADERS)
                response[ACCESS_CONTROL_ALLOW_METHODS] = ', '.join(CORS_ALLOW_METHODS)
        return response

    def is_enabled(self, request):
        return re.match(CORS_URLS_REGEX, request.path)
