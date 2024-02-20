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

// Event type: LECTURE\nLocation: Schuster_RUTHERFORD TH\nDate: Th
// ursday\, 05 October 2023\nMap link: [Google Maps](https://www.google.com/m
// aps/search/?api=1&query=53.467269\,-2.230567&query_place_id=ChIJKfZGD8Gxe0
// gRFFHM_wuWpDI)	\nDirections: The Rutherford Theatre is on the ground floor
//  of the Schuster Building.	\nStaff Member: Wright\, Paul\, O'Toole\, Micha
// el	\nUnit Code: EEEN30171	\n\n\nHSD & MS Design / LECTURE_ /

function removeGoogleMapLink(input: string) {
	const start = "Map link: [Google Maps](";
	const end = ")	\n";

	const start_index = input.indexOf(start);

	if (start_index === -1) return input;

	const second_part_of_string = input.slice(
		start_index + start.length,
		input.length
	);

	const end_index = second_part_of_string.indexOf(end);

	if (end_index === -1) return input;

	return (
		input.slice(0, start_index) +
		second_part_of_string.slice(end_index + end.length)
	);
}

function removeLocation(input: string) {
	const start = "Location: ";

	const end = "\n";

	const start_index = input.indexOf(start);

	if (start_index === -1) return input;

	const second_part_of_string = input.slice(
		start_index + start.length,
		input.length
	);

	const end_index = second_part_of_string.indexOf(end);

	if (end_index === -1) return input;

	return (
		input.slice(0, start_index) +
		second_part_of_string.slice(end_index + end.length)
	);
}

function removeUnitCode(input: string) {
	const start = "Unit Code: ";

	const end = "\n";

	const start_index = input.indexOf(start);

	if (start_index === -1) return input;

	const second_part_of_string = input.slice(
		start_index + start.length,
		input.length
	);

	const end_index = second_part_of_string.indexOf(end);

	if (end_index === -1) return input;

	return (
		input.slice(0, start_index) +
		second_part_of_string.slice(end_index + end.length)
	);
}

function removeDate(input: string) {
	const start = "Date: ";

	const end = "\n";

	const start_index = input.indexOf(start);

	if (start_index === -1) return input;

	const second_part_of_string = input.slice(
		start_index + start.length,
		input.length
	);

	const end_index = second_part_of_string.indexOf(end);

	if (end_index === -1) return input;

	return (
		input.slice(0, start_index) +
		second_part_of_string.slice(end_index + end.length)
	);
}

function removeAll(input: string) {
	return removeUnitCode(removeDate(removeLocation(removeGoogleMapLink(input))));
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
					const unit = event.description.split("\n").find((line) =>
						line.includes("Description: ")
					)?.split("Description: ")[1].trim();
					if (unit) {
						const location =
							typeof event.location === "string"
								? event.location.replaceAll(`_`, " ")
								: // .replaceAll(`TH`, `Theatre`)
								event.location;
						return {
							...event,
							summary: [
								unit,
								...event.summary.split("/").splice(1),
							].join(" / "),
							location,
							original_summary: event.summary,
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
						description: `${removeAll(event.description).trim()}\nSummary: ${
							// @ts-expect-error
							event.original_summary
							}`,
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

		console.log(events)

		return new Response(ics);
	} catch (err) {
		throw error(500, "Error parsing iCal");
	}
};
