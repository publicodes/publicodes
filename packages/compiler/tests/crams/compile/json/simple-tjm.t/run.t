Correctly handle types:

  $ publicodes compile . -t json -o -
  {
    "charges": {
      "type": "number",
      "unit": "€",
      "id": "0846e7223371e7695bc84fa24b152ae8",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 7, "line": 1, "column": 8 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "€",
        "id": "0846e7223371e7695bc84fa24b152ae8",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 7, "line": 1, "column": 8 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "not_applicable_if",
          "type": "number",
          "unit": "€",
          "id": "c1859bafd56fe39b34c194f7d3c1177f",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 11, "line": 2, "column": 3 },
            "end": { "index": 28, "line": 2, "column": 20 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "4b9bdf5bb6ea3b7b9af4cf02797ba5ac",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 30, "line": 2, "column": 22 },
                "end": { "index": 47, "line": 2, "column": 39 }
              },
              "parameters": {
                "kind": "ref",
                "type": "boolean",
                "parameters": { "rule": "auto-entrepreneur" },
                "id": "4b9bdf5bb6ea3b7b9af4cf02797ba5ac",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 30, "line": 2, "column": 22 },
                  "end": { "index": 47, "line": 2, "column": 39 }
                }
              }
            },
            "chained_mechanisms": []
          }
        },
        {
          "kind": "default",
          "type": "number",
          "unit": "€",
          "id": "876d863cce88f8f2cade5d2c7f2dac27",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 50, "line": 3, "column": 3 },
            "end": { "index": 60, "line": 3, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "value",
              "type": "number",
              "unit": "€",
              "id": "a405e95cbda165a714045e7b1f804dd1",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 66, "line": 4, "column": 5 },
                "end": { "index": 72, "line": 4, "column": 11 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "ae69b98213f58d40bf6d5fe73989976f",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 74, "line": 4, "column": 13 },
                    "end": { "index": 98, "line": 4, "column": 37 }
                  },
                  "parameters": {
                    "kind": "mul",
                    "type": "number",
                    "unit": "€",
                    "parameters": {
                      "left": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "%",
                        "parameters": {
                          "kind": "const_number",
                          "value": 10.0,
                          "unit": "%"
                        },
                        "id": "4df65b0afc3bbe0d6e80570c5f49db1a",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 74, "line": 4, "column": 13 },
                          "end": { "index": 77, "line": 4, "column": 16 }
                        }
                      },
                      "right": {
                        "kind": "ref",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "rule": "chiffre d'affaires" },
                        "id": "84f52880f6772d49fb3a8e8e7e247a07",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 80, "line": 4, "column": 19 },
                          "end": { "index": 98, "line": 4, "column": 37 }
                        }
                      }
                    },
                    "id": "ae69b98213f58d40bf6d5fe73989976f",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 74, "line": 4, "column": 13 },
                      "end": { "index": 98, "line": 4, "column": 37 }
                    }
                  }
                },
                "chained_mechanisms": []
              }
            },
            "chained_mechanisms": [
              {
                "kind": "floor",
                "type": "number",
                "unit": "€",
                "id": "13f89c4e9c26afab53267f0febeac16f",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 103, "line": 5, "column": 5 },
                  "end": { "index": 111, "line": 5, "column": 13 }
                },
                "parameters": {
                  "value_mechanism": {
                    "kind": "expr",
                    "type": "number",
                    "unit": "€",
                    "id": "59d1f55bb391ebec202dd9796a529630",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 113, "line": 5, "column": 15 },
                      "end": { "index": 117, "line": 5, "column": 19 }
                    },
                    "parameters": {
                      "kind": "constant",
                      "type": "number",
                      "unit": "€",
                      "parameters": {
                        "kind": "const_number",
                        "value": 100.0,
                        "unit": "€"
                      },
                      "id": "59d1f55bb391ebec202dd9796a529630",
                      "position": {
                        "file": "./rules.publicodes",
                        "start": { "index": 113, "line": 5, "column": 15 },
                        "end": { "index": 117, "line": 5, "column": 19 }
                      }
                    }
                  },
                  "chained_mechanisms": []
                }
              }
            ]
          }
        }
      ]
    },
    "auto-entrepreneur": {
      "type": "boolean",
      "id": "92c982ff24410dae46958c6bb3b3254b",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 119, "line": 7, "column": 1 },
        "end": { "index": 136, "line": 7, "column": 18 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "boolean",
        "id": "92c982ff24410dae46958c6bb3b3254b",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 119, "line": 7, "column": 1 },
          "end": { "index": 136, "line": 7, "column": 18 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "default",
          "type": "boolean",
          "id": "b5b3089c3b04c7aec26114c947ab235b",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 140, "line": 8, "column": 3 },
            "end": { "index": 150, "line": 8, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "59fd21950c289c677035d01c2bf5301a",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 152, "line": 8, "column": 15 },
                "end": { "index": 155, "line": 8, "column": 18 }
              },
              "parameters": {
                "kind": "constant",
                "type": "boolean",
                "parameters": { "kind": "const_boolean", "value": false },
                "id": "59fd21950c289c677035d01c2bf5301a",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 152, "line": 8, "column": 15 },
                  "end": { "index": 155, "line": 8, "column": 18 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "chiffre d'affaires": {
      "type": "number",
      "unit": "€",
      "id": "234db2f513ac7f19f8e1d2d5b693fe29",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 157, "line": 10, "column": 1 },
        "end": { "index": 175, "line": 10, "column": 19 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "757baf5818471e3cb036f7b903da16a2",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 179, "line": 11, "column": 3 },
          "end": { "index": 185, "line": 11, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "dc3cb5b648ba8291a99f727fe9fb3395",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 187, "line": 11, "column": 11 },
              "end": { "index": 189, "line": 11, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": { "kind": "const_number", "value": 10.0 },
              "id": "dc3cb5b648ba8291a99f727fe9fb3395",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 187, "line": 11, "column": 11 },
                "end": { "index": 189, "line": 11, "column": 13 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": [
        {
          "kind": "type_def",
          "type": "number",
          "unit": "€",
          "id": "1e1eaf10eebaec02a8966af9f905b960",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 192, "line": 12, "column": 3 },
            "end": { "index": 197, "line": 12, "column": 8 }
          },
          "parameters": { "type": "number", "unit": "€" }
        }
      ]
    }
  }
