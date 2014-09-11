The server
=============

Requires Python 2.7, pip, django, django-rest-framework

To use
* Initialise the database with

        py manage.py migrate

Dumping the DB

    py manage.py dumpdata --indent 4 > data.json

Edit to remove cruft, and change the appropriate migration to load the data. 
