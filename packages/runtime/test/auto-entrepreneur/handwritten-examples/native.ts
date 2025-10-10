export class AutoEntrepreneur {
	public static revenuNet() {
		const cotisationsEtContributions = CotisationsEtContributions.total()
		if (cotisationsEtContributions === undefined) {
			return undefined
		}

		const chiffreDaffaires = Entreprise.chiffreDaffaires()
		if (chiffreDaffaires === undefined) {
			return undefined
		}

		return chiffreDaffaires - cotisationsEtContributions
	}
}

class Entreprise {
	static chiffreDaffaires() {
		if (
			Inputs.entreprise.chiffreDaffaires.BIC === undefined ||
			Inputs.entreprise.chiffreDaffaires.serviceBIC === undefined ||
			Inputs.entreprise.chiffreDaffaires.serviceBNC === undefined ||
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement ===
				undefined
		) {
			return undefined
		}

		return (
			Inputs.entreprise.chiffreDaffaires.BIC +
			Inputs.entreprise.chiffreDaffaires.serviceBIC +
			Inputs.entreprise.chiffreDaffaires.serviceBNC +
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement
		)
	}
}

class CotisationsEtContributions {
	static total() {
		const cotisations = CotisationsEtContributions.cotisations()
		if (cotisations === undefined) {
			return undefined
		}

		const TFC = CotisationsEtContributions.TFC()
		if (TFC === undefined) {
			return undefined
		}

		const CFP = CotisationsEtContributions.CFP()
		if (TFC === undefined || CFP === undefined) {
			return undefined
		}

		return cotisations + TFC + CFP
	}

	public static TFC() {
		const TFCCommerce = CotisationsEtContributions.TFCCommerce()
		if (TFCCommerce === undefined) {
			return undefined
		}

		const TFCMetiers = CotisationsEtContributions.TFCMetiers()
		if (TFCMetiers === undefined) {
			return undefined
		}

		return (TFCCommerce ?? 0) + (TFCMetiers ?? 0)
	}

	private static TFCCommerce() {
		if (Inputs.entreprise.activite.nature !== 'commerciale') {
			return null
		}

		if (
			Inputs.entreprise.chiffreDaffaires.serviceBIC === undefined ||
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement ===
				undefined
		) {
			return undefined
		}

		return (
			Math.round(Inputs.entreprise.chiffreDaffaires.serviceBIC * 0.00044) +
			Math.round(
				Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement *
					0.00015,
			)
		)
	}

	private static TFCMetiers() {
		if (Inputs.entreprise.activite.nature !== 'artisanale') {
			return null
		}

		if (
			Inputs.entreprise.chiffreDaffaires.serviceBIC === undefined ||
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement ===
				undefined
		) {
			return undefined
		}

		return (
			Math.round(Inputs.entreprise.chiffreDaffaires.serviceBIC * 0.0048) +
			Math.round(
				Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement *
					0.0022,
			)
		)
	}

	public static CFP() {
		if (
			Inputs.entreprise.chiffreDaffaires.BIC === undefined ||
			Inputs.entreprise.chiffreDaffaires.serviceBNC === undefined
		) {
			return undefined
		}

		return (
			Inputs.entreprise.chiffreDaffaires.BIC *
				(Inputs.entreprise.activite.nature === 'artisanale' ? 0.003 : 0.001) +
			Inputs.entreprise.chiffreDaffaires.serviceBNC *
				((
					Inputs.date !== undefined &&
					Inputs.date.compareTo(new PublicodesDate(undefined, 1, 2022)) < 0 &&
					Inputs.cipav === false
				) ?
					0.001
				:	0.002)
		)
	}

	public static cotisations() {
		const serviceBIC = CotisationsEtContributions.serviceBIC()
		if (serviceBIC === undefined) {
			return undefined
		}

		const serviceBNC = CotisationsEtContributions.serviceBNC()
		if (serviceBNC === undefined) {
			return undefined
		}

		const venteRestaurationHebergement =
			CotisationsEtContributions.venteRestaurationHebergement()
		if (venteRestaurationHebergement === undefined) {
			return undefined
		}

		const serviceBNCCipav = CotisationsEtContributions.serviceBNCCipav()
		if (serviceBNCCipav === undefined) {
			return undefined
		}

		return (
			(serviceBIC ?? 0) +
			(serviceBNC ?? 0) +
			(venteRestaurationHebergement ?? 0) +
			(serviceBNCCipav ?? 0)
		)
	}

	private static serviceBIC() {
		if (
			Inputs.entreprise.chiffreDaffaires.serviceBIC === undefined ||
			Inputs.date === undefined
		) {
			return undefined
		}
		const taux =
			Inputs.date.compareTo(new PublicodesDate(undefined, 10, 2022)) >= 0 ?
				0.12
			:	0.22
		return Inputs.entreprise.chiffreDaffaires.serviceBIC * taux
	}

	private static serviceBNC() {
		if (this.serviceBNCCipav() !== null) {
			return null
		}

		if (
			Inputs.entreprise.chiffreDaffaires.serviceBNC === undefined ||
			Inputs.date === undefined
		) {
			return undefined
		}

		const taux =
			Inputs.date.compareTo(new PublicodesDate(undefined, 1, 2026)) >= 0 ? 0.261
			: Inputs.date.compareTo(new PublicodesDate(undefined, 1, 2025)) >= 0 ?
				0.246
			: Inputs.date.compareTo(new PublicodesDate(undefined, 1, 2024)) >= 0 ?
				0.231
			: Inputs.date.compareTo(new PublicodesDate(undefined, 7, 2022)) >= 0 ?
				0.211
			:	0.22

		return Inputs.entreprise.chiffreDaffaires.serviceBNC * taux
	}

	private static serviceBNCCipav() {
		if (Inputs.cipav === null) {
			return null
		}

		if (
			Inputs.entreprise.chiffreDaffaires.serviceBNC === undefined ||
			Inputs.date === undefined
		) {
			return undefined
		}

		const taux =
			Inputs.date.compareTo(new PublicodesDate(undefined, 7, 2024)) >= 0 ?
				0.232
			:	0.212

		return Inputs.entreprise.chiffreDaffaires.serviceBNC * taux
	}

	private static venteRestaurationHebergement() {
		if (
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement ===
				undefined ||
			Inputs.date === undefined
		) {
			return undefined
		}

		const taux =
			Inputs.date.compareTo(new PublicodesDate(undefined, 10, 2022)) >= 0 ?
				0.123
			:	0.128

		return (
			Inputs.entreprise.chiffreDaffaires.venteRestaurationHebergement * taux
		)
	}
}

export class PublicodesDate {
	jour?: number
	mois: number
	annee: number

	constructor(jour: number | undefined, mois: number, annee: number) {
		this.jour = jour
		this.mois = mois
		this.annee = annee
	}

	compareTo(other: PublicodesDate): number {
		if (this.annee !== other.annee) {
			return this.annee - other.annee
		}
		if (this.mois !== other.mois) {
			return this.mois - other.mois
		}
		if (this.jour !== undefined && other.jour !== undefined) {
			return this.jour - other.jour
		}
		return 0 // If both are undefined or equal, return 0
	}
}

type InputsEntreprise = {
	chiffreDaffaires: {
		BIC?: number
		serviceBIC?: number
		serviceBNC?: number
		venteRestaurationHebergement?: number
	}
	activite: {
		nature?: 'commerciale' | 'artisanale' | 'libérale'
		liberaleReglementee?: boolean
	}
}

export class Inputs {
	public static date: PublicodesDate | undefined = undefined
	static cipav: boolean
	public static entreprise: InputsEntreprise = {
		chiffreDaffaires: {
			BIC: undefined,
			serviceBIC: undefined,
			serviceBNC: undefined,
			venteRestaurationHebergement: undefined,
		},
		activite: {
			nature: undefined,
			liberaleReglementee: false,
		},
	}

	public static reset() {
		this.date = undefined
		this.entreprise.chiffreDaffaires = {
			BIC: undefined,
			serviceBIC: undefined,
			serviceBNC: undefined,
			venteRestaurationHebergement: undefined,
		}
		this.entreprise.activite = {
			nature: undefined,
			liberaleReglementee: false,
		}
	}
}
