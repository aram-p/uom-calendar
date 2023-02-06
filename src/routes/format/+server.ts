import { async as ical } from "node-ical";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createEvents } from "ics";
import type { EventAttributes, DateArray } from "ics";

const subjects = [
  { name: "Virtual Common Room", code: "EEEN20000" },
  { name: "Microcontroller Engineering II", code: "EEEN20011" },
  { name: "Engineering Management", code: "EEEN20051" },
  { name: "Digital Systems Design II", code: "EEEN20121" },
  { name: "Signals and Systems", code: "EEEN20131" },
  { name: "Machines, Drives & Power Electronics", code: "EEEN20212" },
  { name: "Electronic Circuit Design II", code: "EEEN20222" },
  { name: "Generation and Transport of Electrical Energy", code: "EEEN20242" },
  { name: "Control Systems I", code: "EEEN20252" },
  { name: "Analogue and Digital Communications", code: "EEEN20262" },
  { name: "Embedded Systems Project", code: "EEEN21000" },
  { name: "Aspire - Your Future", code: "EEEN29040" },
  { name: "Mathematics 2E1", code: "MATH29681" },
] as const;

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

    const events = Object.values(await ical.fromURL(ical_url)).map((event) => {
      if (event.type === "VEVENT") {
        const subject = subjects.find(
          (s) => s.code === event.summary.split("/")[0].trim()
        );
        if (subject)
          return {
            ...event,
            summary: [subject.name, ...event.summary.split("/").splice(1)].join(
              " / "
            ),
          };
      }
      return event;
    });

    const ics_events = events
      .map((event) => {
        if (event.type === "VEVENT")
          return {
            // convert string date to 5 number array
            start: parseDate(event.start),
            end: parseDate(event.end),
            title: event.summary,
            description: event.description,
            location: event.location,
          };
        return undefined;
      })
      .filter((event) => event !== undefined) as EventAttributes[];

    const { value: ics } = createEvents(ics_events);

    setHeaders({
      "Content-Type": "text/calendar",
    });

    return new Response(ics);
  } catch (err) {
    throw error(500, "Error parsing iCal");
  }
};
