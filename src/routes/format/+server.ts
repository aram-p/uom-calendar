import node_ical from "node-ical";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createEvents } from "ics";
import type { EventAttributes, DateArray } from "ics";

import { courses } from "./data";

function parseDate(date: Date): DateArray {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return [year, month, day, hours, minutes];
}

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    const ical_url = url.searchParams.get("ical");

    if (!ical_url) throw error(400, "No iCal URL provided");

    const events = Object.values(await node_ical.async.fromURL(ical_url)).map(
      (event) => {
        if (event.type === "VEVENT") {
          const course = courses.find(
            (s) => s.code === event.summary.split("/")[0].trim()
          );
          if (course) {
            const location =
              typeof event.location === "string"
                ? event.location.replaceAll(`_`, " ")
                : // .replaceAll(`TH`, `Theatre`)
                  event.location;
            return {
              ...event,
              summary: [
                course.name,
                ...event.summary.split("/").splice(1),
              ].join(" / "),
              location,
            };
          }
        }
        return event;
      }
    );

    const checkInLink = "https://my.manchester.ac.uk/MyCheckIn";

    const ics_events = events
      .map((event) => {
        if (event.type === "VEVENT")
          return {
            // convert string date to 5 number array
            start: parseDate(event.start),
            end: parseDate(event.end),
            title: event.summary,
            description: `${event.description}\n\n${checkInLink}`,
            location: event.location,
          };
        return undefined;
      })
      .filter((event) => event !== undefined) as EventAttributes[];

    const { value: ics } = createEvents(ics_events);

    // solve cors
    setHeaders({
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="calendar.ics"`,
      "Access-Control-Allow-Origin": "*",
    });

    return new Response(ics);
  } catch (err) {
    throw error(500, "Error parsing iCal");
  }
};
