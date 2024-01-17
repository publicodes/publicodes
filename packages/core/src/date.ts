import { PublicodesError } from './error'

export function normalizeDateString(dateString: string): string {
	let [day, month, year] = dateString.split('/')
	if (!year) {
		;[day, month, year] = ['01', day, month]
	}
	return normalizeDate(+year, +month, +day)
}

const pad = (n: number): string => (+n < 10 ? `0${n}` : '' + n)
export function normalizeDate(
	year: number,
	month: number,
	day: number,
): string {
	const date = new Date(+year, +month - 1, +day)
	if (!+date || date.getDate() !== +day) {
		throw new PublicodesError(
			'SyntaxError',
			`La date ${day}/${month}/${year} n'est pas valide`,
			{ dottedName: '' },
		)
	}
	return `${pad(day)}/${pad(month)}/${pad(year)}`
}

export function convertToDate(value: string): Date {
	const [day, month, year] = normalizeDateString(value).split('/')
	const result = new Date(+year, +month - 1, +day)
	// Reset date to utc midnight for exact calculation of day difference (no
	// daylight saving effect)
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset())
	return result
}

export function convertToString(date: Date): string {
	return normalizeDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function getRelativeDate(date: string, dayDifferential: number): string {
	const relativeDate = new Date(convertToDate(date))
	relativeDate.setDate(relativeDate.getDate() + dayDifferential)
	return convertToString(relativeDate)
}

export function getYear(date: string): number {
	return +date.slice(-4)
}

export function getDifferenceInDays(from: string, to: string): number {
	const millisecondsPerDay = 1000 * 60 * 60 * 24
	return (
		(convertToDate(from).getTime() - convertToDate(to).getTime()) /
		millisecondsPerDay
	)
}

export function getDifferenceInMonths(from: string, to: string): number {
	// We want to compute the difference in actual month between the two dates
	// For date that start during a month, a pro-rata will be done depending on
	// the duration of the month in days
	const [dayFrom, monthFrom, yearFrom] = from.split('/').map((x) => +x)
	const [dayTo, monthTo, yearTo] = to.split('/').map((x) => +x)
	const numberOfFullMonth = monthTo - monthFrom + 12 * (yearTo - yearFrom)
	const numDayMonthFrom = new Date(yearFrom, monthFrom, 0).getDate()
	const numDayMonthTo = new Date(yearTo, monthTo, 0).getDate()
	const prorataMonthFrom = (dayFrom - 1) / numDayMonthFrom
	const prorataMonthTo = dayTo / numDayMonthTo
	return numberOfFullMonth - prorataMonthFrom + prorataMonthTo
}

export function getDifferenceInYears(from: string, to: string): number {
	const differenceInDays = getDifferenceInDays(to, from)

	const isLeapYear = (year: number) =>
		(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
	const after1stMarch = (date: Date) =>
		date >= new Date(date.getFullYear(), 2, 1)

	const fromDate = convertToDate(from)
	const toDate = convertToDate(to)

	const fromYear = fromDate.getFullYear() + (after1stMarch(fromDate) ? 1 : 0)
	const toYear = toDate.getFullYear() + (after1stMarch(fromDate) ? 0 : -1)

	const leapYearsCount = Array.from(
		{ length: toYear - fromYear + 1 },
		(_, i) => fromYear + i,
	).filter(isLeapYear).length

	return (differenceInDays - leapYearsCount) / 365
}
