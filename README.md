# touchui-tricks

In this repository you can find some useful utils extending default touch ui interface and allowing to add custom validation logic to components.

## Dialog links validation

This code provides example how to add custom validation to the links present in pathbrowser and richtext touch ui dialog fields. The solution uses servlet which verifies on server side if internal page (resource) exists in repository and for external link if its syntax is valid and if it is reacheable from AEM instance. In case that AEM instance does not have connection to web, checking the connection can be disabled in servlet OSGI configuration:
 
![alt tag](https://raw.githubusercontent.com/kciecierski/touchui-tricks/master/images/osgi_configuration.png) 
 
 
Links are validation when author tries to submit dialog and message box appears allowing to re-edit dialog or proceed with dialog submission.

![alt tag](https://raw.githubusercontent.com/kciecierski/touchui-tricks/master/images/validation_example.png) 