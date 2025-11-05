Valid :

  $ publicodes compile valid.publicodes  -o -
  {
    "evaluation": [
      { "get": "b" },
      5.0,
      { "ref": "b . c", "node": 3 },
      { "ref": "c", "node": 1 }
    ],
    "outputs": {
      "b . a": {
        "nodeIndex": 2,
        "parameters": {},
        "type": { "number": true, "unit": "aucune" },
        "meta": {}
      }
    }
  }
