Replacements — exception chain :

  $ publicodes compile ./chain/ -t json -o -
  {
    "base": {
      "type": "unknown",
      "id": "76528af999cc28f976898c99ccb10788",
      "position": {
        "file": "./chain/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 4, "line": 1, "column": 5 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "unknown",
        "id": "76528af999cc28f976898c99ccb10788",
        "position": {
          "file": "./chain/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 4, "line": 1, "column": 5 }
        }
      },
      "chained_mechanisms": []
    },
    "e1": {
      "type": "number",
      "unit": "€",
      "id": "c893c68f5c5a9053a15f7d541297438f",
      "position": {
        "file": "./chain/rules.publicodes",
        "start": { "index": 6, "line": 2, "column": 1 },
        "end": { "index": 8, "line": 2, "column": 3 }
      },
      "replaces": [
        {
          "reference": "base",
          "only_in": [],
          "except_in": [],
          "exclusive": false,
          "position": {
            "file": "./chain/rules.publicodes",
            "start": { "index": 22, "line": 3, "column": 13 },
            "end": { "index": 26, "line": 3, "column": 17 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "fcab44e8c01fa2d97491adee93b5fac1",
        "position": {
          "file": "./chain/rules.publicodes",
          "start": { "index": 29, "line": 4, "column": 3 },
          "end": { "index": 35, "line": 4, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "0cc54240d42d194941d5d06b40aa5463",
            "position": {
              "file": "./chain/rules.publicodes",
              "start": { "index": 37, "line": 4, "column": 11 },
              "end": { "index": 40, "line": 4, "column": 14 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": {
                "kind": "const_number",
                "value": 5.0,
                "unit": "€"
              },
              "id": "0cc54240d42d194941d5d06b40aa5463",
              "position": {
                "file": "./chain/rules.publicodes",
                "start": { "index": 37, "line": 4, "column": 11 },
                "end": { "index": 40, "line": 4, "column": 14 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "e2": {
      "type": "number",
      "unit": "€",
      "id": "2a145c2e2635ae9b4694081245012a66",
      "position": {
        "file": "./chain/rules.publicodes",
        "start": { "index": 41, "line": 5, "column": 1 },
        "end": { "index": 43, "line": 5, "column": 3 }
      },
      "replaces": [
        {
          "reference": "e1",
          "only_in": [],
          "except_in": [],
          "exclusive": false,
          "position": {
            "file": "./chain/rules.publicodes",
            "start": { "index": 57, "line": 6, "column": 13 },
            "end": { "index": 59, "line": 6, "column": 15 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "bedbf7e8846b4dfe8387453bac4c8b25",
        "position": {
          "file": "./chain/rules.publicodes",
          "start": { "index": 62, "line": 7, "column": 3 },
          "end": { "index": 68, "line": 7, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "d78374111f920b23b10644cf9786e71b",
            "position": {
              "file": "./chain/rules.publicodes",
              "start": { "index": 70, "line": 7, "column": 11 },
              "end": { "index": 73, "line": 7, "column": 14 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": {
                "kind": "const_number",
                "value": 1.0,
                "unit": "€"
              },
              "id": "d78374111f920b23b10644cf9786e71b",
              "position": {
                "file": "./chain/rules.publicodes",
                "start": { "index": 70, "line": 7, "column": 11 },
                "end": { "index": 73, "line": 7, "column": 14 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "x": {
      "type": "enum",
      "id": "3b56a7cd6b947ce269aa2c22bf704176",
      "position": {
        "file": "./chain/rules.publicodes",
        "start": { "index": 74, "line": 8, "column": 1 },
        "end": { "index": 75, "line": 8, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "enum",
        "id": "509d8829c5dbf40b452fd0e7c5b9c94f",
        "position": {
          "file": "./chain/rules.publicodes",
          "start": { "index": 77, "line": 8, "column": 4 },
          "end": { "index": 81, "line": 8, "column": 8 }
        },
        "parameters": {
          "kind": "ref",
          "type": "enum",
          "parameters": {
            "rule": "base",
            "replaced_by": [
              { "rule": "e1", "replaced_by": [ { "rule": "e2" } ] }
            ]
          },
          "id": "509d8829c5dbf40b452fd0e7c5b9c94f",
          "position": {
            "file": "./chain/rules.publicodes",
            "start": { "index": 77, "line": 8, "column": 4 },
            "end": { "index": 81, "line": 8, "column": 8 }
          }
        }
      },
      "chained_mechanisms": []
    }
  }

Replacements — exclusive candidates :

  $ publicodes compile ./exclusive/ -t json -o -
  {
    "other": {
      "type": "unknown",
      "id": "13187f17df16330db6aacb47820ffbad",
      "position": {
        "file": "./exclusive/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 5, "line": 1, "column": 6 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "unknown",
        "id": "13187f17df16330db6aacb47820ffbad",
        "position": {
          "file": "./exclusive/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 5, "line": 1, "column": 6 }
        }
      },
      "chained_mechanisms": []
    },
    "a": {
      "type": "number",
      "unit": "€",
      "id": "72d69ad0ad35c60e22f34e245971b51a",
      "position": {
        "file": "./exclusive/rules.publicodes",
        "start": { "index": 7, "line": 2, "column": 1 },
        "end": { "index": 8, "line": 2, "column": 2 }
      },
      "replaces": [
        {
          "reference": "other",
          "only_in": [],
          "except_in": [],
          "exclusive": true,
          "position": {
            "file": "./exclusive/rules.publicodes",
            "start": { "index": 40, "line": 4, "column": 19 },
            "end": { "index": 45, "line": 4, "column": 24 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "5fb41691bb92d0dd87c3c6f6787f2466",
        "position": {
          "file": "./exclusive/rules.publicodes",
          "start": { "index": 66, "line": 6, "column": 3 },
          "end": { "index": 72, "line": 6, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "d43a146eb5fdaf411331d12594a34980",
            "position": {
              "file": "./exclusive/rules.publicodes",
              "start": { "index": 74, "line": 6, "column": 11 },
              "end": { "index": 79, "line": 6, "column": 16 }
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
              "id": "d43a146eb5fdaf411331d12594a34980",
              "position": {
                "file": "./exclusive/rules.publicodes",
                "start": { "index": 74, "line": 6, "column": 11 },
                "end": { "index": 79, "line": 6, "column": 16 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "b": {
      "type": "number",
      "unit": "€",
      "id": "0e374e325bbbd46a2d4b8dc9b1052c76",
      "position": {
        "file": "./exclusive/rules.publicodes",
        "start": { "index": 80, "line": 7, "column": 1 },
        "end": { "index": 81, "line": 7, "column": 2 }
      },
      "replaces": [
        {
          "reference": "other",
          "only_in": [],
          "except_in": [],
          "exclusive": true,
          "position": {
            "file": "./exclusive/rules.publicodes",
            "start": { "index": 113, "line": 9, "column": 19 },
            "end": { "index": 118, "line": 9, "column": 24 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "8bd619d391b5b27b072f87070b6c661a",
        "position": {
          "file": "./exclusive/rules.publicodes",
          "start": { "index": 139, "line": 11, "column": 3 },
          "end": { "index": 145, "line": 11, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "32fb29654c3cacacb649c23d9f12a4e7",
            "position": {
              "file": "./exclusive/rules.publicodes",
              "start": { "index": 147, "line": 11, "column": 11 },
              "end": { "index": 150, "line": 11, "column": 14 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": {
                "kind": "const_number",
                "value": 0.0,
                "unit": "€"
              },
              "id": "32fb29654c3cacacb649c23d9f12a4e7",
              "position": {
                "file": "./exclusive/rules.publicodes",
                "start": { "index": 147, "line": 11, "column": 11 },
                "end": { "index": 150, "line": 11, "column": 14 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "x": {
      "type": "enum",
      "id": "b081a48d07ed32691d0edb0beb5b3567",
      "position": {
        "file": "./exclusive/rules.publicodes",
        "start": { "index": 151, "line": 12, "column": 1 },
        "end": { "index": 152, "line": 12, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "enum",
        "id": "d6bc7134c5af4e0ff7a6cbed356c765e",
        "position": {
          "file": "./exclusive/rules.publicodes",
          "start": { "index": 154, "line": 12, "column": 4 },
          "end": { "index": 159, "line": 12, "column": 9 }
        },
        "parameters": {
          "kind": "ref",
          "type": "enum",
          "parameters": {
            "rule": "other",
            "replaced_by": [ { "rule": "b" }, { "rule": "a" } ]
          },
          "id": "d6bc7134c5af4e0ff7a6cbed356c765e",
          "position": {
            "file": "./exclusive/rules.publicodes",
            "start": { "index": 154, "line": 12, "column": 4 },
            "end": { "index": 159, "line": 12, "column": 9 }
          }
        }
      },
      "chained_mechanisms": []
    }
  }

Replacements — scope (« dans » / « sauf dans ») :

  $ publicodes compile ./scope/ -t json -o -
  {
    "base": {
      "type": "unknown",
      "id": "ee20e6b50ce767861930b669a2457b3a",
      "position": {
        "file": "./scope/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 4, "line": 1, "column": 5 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "unknown",
        "id": "ee20e6b50ce767861930b669a2457b3a",
        "position": {
          "file": "./scope/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 4, "line": 1, "column": 5 }
        }
      },
      "chained_mechanisms": []
    },
    "e1": {
      "type": "number",
      "unit": "€",
      "id": "35adc43cd0f0d3c4f05d163f61fe15a5",
      "position": {
        "file": "./scope/rules.publicodes",
        "start": { "index": 6, "line": 2, "column": 1 },
        "end": { "index": 8, "line": 2, "column": 3 }
      },
      "replaces": [
        {
          "reference": "base",
          "only_in": [],
          "except_in": [ "x" ],
          "exclusive": false,
          "position": {
            "file": "./scope/rules.publicodes",
            "start": { "index": 40, "line": 4, "column": 19 },
            "end": { "index": 44, "line": 4, "column": 23 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "f9cf10d0c93085bed0052e9e637ced09",
        "position": {
          "file": "./scope/rules.publicodes",
          "start": { "index": 64, "line": 6, "column": 3 },
          "end": { "index": 70, "line": 6, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "1803815973b3b3dc283ae347dd7bfe5d",
            "position": {
              "file": "./scope/rules.publicodes",
              "start": { "index": 72, "line": 6, "column": 11 },
              "end": { "index": 75, "line": 6, "column": 14 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": {
                "kind": "const_number",
                "value": 5.0,
                "unit": "€"
              },
              "id": "1803815973b3b3dc283ae347dd7bfe5d",
              "position": {
                "file": "./scope/rules.publicodes",
                "start": { "index": 72, "line": 6, "column": 11 },
                "end": { "index": 75, "line": 6, "column": 14 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "x": {
      "type": "unknown",
      "id": "50296e9fed1a7b46dddb526a3ce7c831",
      "position": {
        "file": "./scope/rules.publicodes",
        "start": { "index": 76, "line": 7, "column": 1 },
        "end": { "index": 77, "line": 7, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "unknown",
        "id": "19c937f9bd0b223043980f38d1c9fb9a",
        "position": {
          "file": "./scope/rules.publicodes",
          "start": { "index": 79, "line": 7, "column": 4 },
          "end": { "index": 83, "line": 7, "column": 8 }
        },
        "parameters": {
          "kind": "ref",
          "parameters": { "rule": "base" },
          "id": "19c937f9bd0b223043980f38d1c9fb9a",
          "position": {
            "file": "./scope/rules.publicodes",
            "start": { "index": 79, "line": 7, "column": 4 },
            "end": { "index": 83, "line": 7, "column": 8 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "y": {
      "type": "number",
      "unit": "€",
      "id": "1f6033cfc96df450880d3530054c145a",
      "position": {
        "file": "./scope/rules.publicodes",
        "start": { "index": 84, "line": 8, "column": 1 },
        "end": { "index": 85, "line": 8, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "7a6f3816cb1df5bd840a8f1d5b2f5056",
        "position": {
          "file": "./scope/rules.publicodes",
          "start": { "index": 87, "line": 8, "column": 4 },
          "end": { "index": 91, "line": 8, "column": 8 }
        },
        "parameters": {
          "kind": "ref",
          "type": "number",
          "unit": "€",
          "parameters": { "rule": "base", "replaced_by": [ { "rule": "e1" } ] },
          "id": "7a6f3816cb1df5bd840a8f1d5b2f5056",
          "position": {
            "file": "./scope/rules.publicodes",
            "start": { "index": 87, "line": 8, "column": 4 },
            "end": { "index": 91, "line": 8, "column": 8 }
          }
        }
      },
      "chained_mechanisms": []
    }
  }

Replacements — « rend non applicable » :

  $ publicodes compile ./make-not-applicable/ -t json -o -
  {
    "base": {
      "type": "unknown",
      "id": "062f09ffbffe86923b49ff21ce8d1e14",
      "position": {
        "file": "./make-not-applicable/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 4, "line": 1, "column": 5 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "unknown",
        "id": "062f09ffbffe86923b49ff21ce8d1e14",
        "position": {
          "file": "./make-not-applicable/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 4, "line": 1, "column": 5 }
        }
      },
      "chained_mechanisms": []
    },
    "v": {
      "type": "boolean",
      "id": "821fd4b43c6699901086285b657e40ec",
      "position": {
        "file": "./make-not-applicable/rules.publicodes",
        "start": { "index": 6, "line": 2, "column": 1 },
        "end": { "index": 7, "line": 2, "column": 2 }
      },
      "makes_not_applicable": [
        {
          "reference": "base",
          "only_in": [],
          "except_in": [],
          "exclusive": false,
          "position": {
            "file": "./make-not-applicable/rules.publicodes",
            "start": { "index": 32, "line": 3, "column": 24 },
            "end": { "index": 36, "line": 3, "column": 28 }
          }
        }
      ],
      "value_mechanism": {
        "kind": "value",
        "type": "boolean",
        "id": "3ec9700e4c6436e7c7695700085aac4a",
        "position": {
          "file": "./make-not-applicable/rules.publicodes",
          "start": { "index": 39, "line": 4, "column": 3 },
          "end": { "index": 45, "line": 4, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "boolean",
            "id": "9a648051798b711defded17705a0762c",
            "position": {
              "file": "./make-not-applicable/rules.publicodes",
              "start": { "index": 47, "line": 4, "column": 11 },
              "end": { "index": 50, "line": 4, "column": 14 }
            },
            "parameters": {
              "kind": "constant",
              "type": "boolean",
              "parameters": { "kind": "const_boolean", "value": true },
              "id": "9a648051798b711defded17705a0762c",
              "position": {
                "file": "./make-not-applicable/rules.publicodes",
                "start": { "index": 47, "line": 4, "column": 11 },
                "end": { "index": 50, "line": 4, "column": 14 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "x": {
      "type": "unknown",
      "id": "9f1b24db968b25f270f93d2b20ba9384",
      "position": {
        "file": "./make-not-applicable/rules.publicodes",
        "start": { "index": 51, "line": 5, "column": 1 },
        "end": { "index": 52, "line": 5, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "unknown",
        "id": "160bee4e36d230f90cba8cfc1481acbd",
        "position": {
          "file": "./make-not-applicable/rules.publicodes",
          "start": { "index": 54, "line": 5, "column": 4 },
          "end": { "index": 58, "line": 5, "column": 8 }
        },
        "parameters": {
          "kind": "ref",
          "parameters": {
            "rule": "base",
            "made_not_applicable_by": [ { "rule": "v" } ]
          },
          "id": "160bee4e36d230f90cba8cfc1481acbd",
          "position": {
            "file": "./make-not-applicable/rules.publicodes",
            "start": { "index": 54, "line": 5, "column": 4 },
            "end": { "index": 58, "line": 5, "column": 8 }
          }
        }
      },
      "chained_mechanisms": []
    }
  }
