# downtime-management-with-osisoft
Downtime management prototyp with OSIsoft tools (PI Web API, Coresight, Analysis Services)


This is our submission from Team werusys - Cologne.

Our goal during this PI Visualization  Hackathon was, to replace our own „Downtime Management“, product, which consists of a
custom windows service and an ASP.NET web application  by an OSIsoft integrated solution. The “old” web application looks like several asset production lines - timeline bars with custom data included (f.e. green running, red – shut down)

The first step was to insert the asset structure into AF. Then, with a little help of AF analysis services, event frames are generated, depending on production or shutdown. The main work was to find and integrate an open source timeline control into coresight. This shouldn’t be a gant chart, because our customers should have the same look and feel like in the old application.  So we found the timeline control in this library:

https://visjs.org/index.html

It meets perfect our needs.  Together with OSISoft Analysis Services, PI Web Api and Coresight, we were able to build our downtime
management application with OSI products out of the box.

Features:

Event Frame visualization in time lines
Zooming
Scrolling
Editing of custom event frame properties

Github source:

https://github.com/werusys/downtime-management-with-osisoft

 
Libraries loaded from CDNJS:

vis.js
Timeline

async.js

 

 

