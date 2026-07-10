import rules from "./model.publicodes.js"
const e=rules["exemples . CA élevé"].evaluate({}, {trace: true})
const e2=rules["revenu net"].evaluate({"chiffre d'affaires . TJM": 10000, "chiffre d'affaires . nombre de jour": 100}, {trace: true})

console.log(e2.trace)
