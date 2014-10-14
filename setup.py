from setuptools import setup

setup(name='ftracker on Openshift',
    version='0.1',
    description='ftracker on OpenShift',
    author='CITS3200N',
    author_email='example@example.com',
    url='https://github.com/jfmatth/openshift-django17',
    install_requires=['Django>=1.7', 'Django<1.8', 'djangorestframework', 'tablib','python-dateutil'],
)
