import node_ical from "node-ical";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createEvents } from "ics";
import type { EventAttributes, DateArray } from "ics";

const courses = [
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
  { name: "Economic Principles", code: "BMAN10001" },
  { name: "Marketing Foundations", code: "BMAN10101" },
  { name: "Financial Decision Making M", code: "BMAN10522M" },
  { name: "Fundamentals of Financial Reporting", code: "BMAN10621M" },
  { name: "Fundamentals of Management Accounting M", code: "BMAN10632M" },
  { name: "Academic and Career Development", code: "BMAN10780" },
  { name: "Case Studies in Professional Management", code: "BMAN10862" },
  { name: "Introduction to Work Psychology", code: "BMAN10872" },
  {
    name: "Quantitative Methods for Business and Management",
    code: "BMAN10960",
  },
  {
    name: "Introduction to Management and Organisation Studies",
    code: "BMAN10970",
  },
  { name: "Academic Malpractice Awareness", code: "BMAN11021" },
  { name: "Health & Safety Induction", code: "BMAN11230" },
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

    const events = Object.values(await node_ical.async.fromURL(ical_url)).map(
      (event) => {
        if (event.type === "VEVENT") {
          const course = courses.find(
            (s) => s.code === event.summary.split("/")[0].trim()
          );
          if (course) {
            const location =
              typeof event.location === "string"
                ? event.location
                : // .replaceAll(`_`, " ")
                  // .replaceAll(`TH`, `Theatre`)
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
