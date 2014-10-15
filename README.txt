This is the server used to communicate with and store data from the mobile app.

It is written in Python(2) using Django and Django REST frameworks. Data export
is done using tablib (which uses xlwt when writing to xlsx). 

There are two applications to this Django project - 'api' and 'manager'. The api
application contains all of the models as well as the code that runs the interface
that the application sees (the REST api). The manager application contains all
of the code required to run the manager web-site (where all the users and data
are managed).

The manager application primarily uses Bootstrap 3.2.0 and jQuery 1.11.1.

This project may be readily deployed to OpenShift, which is a free hosting service.

For basic install/usage instructions, see INSTALL.txt.