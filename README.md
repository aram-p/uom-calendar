# UoM-calendar
The University of Manchester Publish timetable event titles include the course code but not the course name... annoying.

This is a simple layer between the `.ics` file from UoM and your calendar of choice that replaces the course code with the course title. Course details (name, code) are hardcoded so dm me or open an issue if you'd like to push to the array.

To use, in your calendar, simply prepend `https://uom-calendar.vercel.app/format?=` to the active UoM `.ics` url like this: `https://uom-calendar.vercel.app/format?=YOUR_ICS_URL.ics`
