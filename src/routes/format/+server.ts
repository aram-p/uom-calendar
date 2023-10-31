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

function prettifyTitle(str: string) {
	return str
		.replaceAll(" LECTURE_1 ", " Lecture ")
		.replaceAll(" LECTURE_2 ", " Lecture ")
		.replaceAll(" LECTURE_SEM1 ", " Lecture ")
		.replaceAll(" LECTURE_SEM2 ", " Lecture ")
		.replaceAll(" LECTURE_ ", " Lecture ")
		.replaceAll(" ONLINE LECTURE_H&S ", " Online Lecture ")
		.replaceAll(" ONLINE LECTURE_SEM1_H&S ", " Online Lecture ")
		.replaceAll(" LABORATORY_ ", " Lab ")
		.replaceAll(" LABORATORY1_ ", " Lab ")
		.replaceAll(" LABORATORY2_ ", " Lab ")
		.replaceAll(" LABORATORY3_ ", " Lab ")
		.replaceAll(" LABORATORY4_ ", " Lab ")
		.replaceAll(" LABORATORY5_ ", " Lab ")
		.replaceAll(" LABORATORY2_ ", " Lab ")
		.replaceAll(" LECTURE_replace2 ", " Lecture ")
		.replaceAll(" LECTURE_replacement ", " Lecture ")
		.replaceAll(" ONLINE DROP-IN_ ", " Online Drop-in ")
		.replaceAll(" TUTORIAL_ ", " Tutorial ")
		.replaceAll(" TUTORIAL_SEM1_AA ", " Tutorial ")
		.replaceAll(" TUTORIAL_1 ", " Tutorial ")
		.replaceAll(" TUTORIAL_2 ", " Tutorial ")
		.replaceAll(" TUTORIAL_3 ", " Tutorial ")
		.replaceAll(" SURGERY_ ", " Surgery Session ")
		.replaceAll(" DROP-IN_SEM_1Build ", " Drop-in ")
		.replaceAll(" DROP-IN_SEM1_DryLab ", " Drop-in ")
		.replaceAll(" INDEPENDENT STUDY_SEM1 ", " Independent Study Session ")
		.replace(" / ", " ")
		.split(" / ")[0];
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

		const ics_events = events
			.map((event) => {
				if (event.type === "VEVENT")
					return {
						// convert string date to 5 number array
						start: parseDate(event.start),
						end: parseDate(event.end),
						title: prettifyTitle(event.summary),
						description: `${event.summary}\n\n${event.description}`,
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
