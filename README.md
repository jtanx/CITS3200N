The server
=============

Requires Python 2.7, pip, django, django-rest-framework

To use
* Initialise the database with

        py manage.py syncdb
    * Answer 'no' to creating a superuser. There's already one made in the fixture.

Dumping the DB

    py manage.py dumpdata --indent 4 > data.json
Probably needs manual editing to cleanup any cruft
