Valid json doc :

  $ publicodes compile . -t json -o -
  {
    "a": {
      "type": "number",
      "unit": "€",
      "id": "e0fd5968c881c53d4daaa1da678cfa09",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 1, "line": 1, "column": 2 }
      },
      "title": "A",
      "description": "la valeur A",
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "3064b365e18c8aae561f3ae8173791bc",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 5, "line": 2, "column": 3 },
          "end": { "index": 11, "line": 2, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "8c53200048a761596ecae3e1e3bf0d41",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 13, "line": 2, "column": 11 },
              "end": { "index": 17, "line": 2, "column": 15 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": {
                "kind": "const_number",
                "value": 10.0,
                "unit": "€"
              },
              "id": "8c53200048a761596ecae3e1e3bf0d41",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 13, "line": 2, "column": 11 },
                "end": { "index": 17, "line": 2, "column": 15 }
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
      "id": "85d966683d9505df5c5f03f6cf094c68",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 56, "line": 5, "column": 1 },
        "end": { "index": 57, "line": 5, "column": 2 }
      },
      "value_mechanism": {
        "kind": "sum",
        "type": "number",
        "unit": "€",
        "id": "ff79a2db81cac7b17e568fcd2d7edf5a",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 61, "line": 6, "column": 3 },
          "end": { "index": 66, "line": 6, "column": 8 }
        },
        "parameters": [
          {
            "value_mechanism": {
              "kind": "value",
              "type": "number",
              "unit": "€",
              "id": "0a16f393332e6228d15a27dcc851be89",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 80, "line": 8, "column": 7 },
                "end": { "index": 86, "line": 8, "column": 13 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "607482e8a1a50f7f33a94672c51e4bba",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 88, "line": 8, "column": 15 },
                    "end": { "index": 89, "line": 8, "column": 16 }
                  },
                  "parameters": {
                    "kind": "ref",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "rule": "a" },
                    "id": "607482e8a1a50f7f33a94672c51e4bba",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 88, "line": 8, "column": 15 },
                      "end": { "index": 89, "line": 8, "column": 16 }
                    }
                  }
                },
                "chained_mechanisms": []
              }
            },
            "chained_mechanisms": [
              {
                "kind": "context",
                "type": "number",
                "unit": "€",
                "id": "f5c30e4e84bf738d213540cfb36bf2a4",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 96, "line": 9, "column": 7 },
                  "end": { "index": 104, "line": 9, "column": 15 }
                },
                "parameters": {
                  "a": {
                    "value_mechanism": {
                      "kind": "expr",
                      "type": "number",
                      "unit": "€",
                      "id": "cbbb38b3c23969c6db449330c9fb3586",
                      "position": {
                        "file": "./rules.publicodes",
                        "start": { "index": 117, "line": 10, "column": 12 },
                        "end": { "index": 119, "line": 10, "column": 14 }
                      },
                      "parameters": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 30.0 },
                        "id": "cbbb38b3c23969c6db449330c9fb3586",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 117, "line": 10, "column": 12 },
                          "end": { "index": 119, "line": 10, "column": 14 }
                        }
                      }
                    },
                    "chained_mechanisms": []
                  }
                }
              }
            ]
          },
          {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "€",
              "id": "4fd650849b843a93fc12a8a17768e33b",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 126, "line": 11, "column": 7 },
                "end": { "index": 127, "line": 11, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": { "rule": "a" },
                "id": "4fd650849b843a93fc12a8a17768e33b",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 126, "line": 11, "column": 7 },
                  "end": { "index": 127, "line": 11, "column": 8 }
                }
              }
            },
            "chained_mechanisms": []
          },
          {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "€",
              "id": "0619c80afde2af8cffee7f4efe428260",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 134, "line": 12, "column": 7 },
                "end": { "index": 135, "line": 12, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": { "rule": "b . c" },
                "id": "0619c80afde2af8cffee7f4efe428260",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 134, "line": 12, "column": 7 },
                  "end": { "index": 135, "line": 12, "column": 8 }
                }
              }
            },
            "chained_mechanisms": []
          }
        ]
      },
      "chained_mechanisms": []
    },
    "b . c": {
      "type": "number",
      "unit": "€",
      "id": "26fa17a55d7139079717b158f83199b2",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 148, "line": 14, "column": 5 },
        "end": { "index": 149, "line": 14, "column": 6 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "b11107b71fb9389430e680fcb5514f4e",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 151, "line": 14, "column": 8 },
          "end": { "index": 153, "line": 14, "column": 10 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "const_number", "value": 55.0 },
          "id": "b11107b71fb9389430e680fcb5514f4e",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 151, "line": 14, "column": 8 },
            "end": { "index": 153, "line": 14, "column": 10 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "d": {
      "type": "number",
      "unit": "€",
      "id": "d018fa9a66806ea22f6c2a3efe7d65b0",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 154, "line": 15, "column": 1 },
        "end": { "index": 155, "line": 15, "column": 2 }
      },
      "value_mechanism": {
        "kind": "variations",
        "type": "enum",
        "id": "c52608930469dcbd5d92ae1c48d2ace7",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 174, "line": 17, "column": 3 },
          "end": { "index": 184, "line": 17, "column": 13 }
        },
        "parameters": {
          "conditions": [
            {
              "if": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "boolean",
                  "id": "3e9f5aabfb2e4591854a0c92f1ebd7e2",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 196, "line": 18, "column": 11 },
                    "end": { "index": 202, "line": 18, "column": 17 }
                  },
                  "parameters": {
                    "kind": "gt",
                    "type": "boolean",
                    "parameters": {
                      "left": {
                        "kind": "ref",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "rule": "a" },
                        "id": "b3db789b60d2cc2cd3b1fa0033f12c6a",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 196, "line": 18, "column": 11 },
                          "end": { "index": 197, "line": 18, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 20.0 },
                        "id": "d7f3aa0c5a448fb5365bad3bdb8d6e7e",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 200, "line": 18, "column": 15 },
                          "end": { "index": 202, "line": 18, "column": 17 }
                        }
                      }
                    },
                    "id": "3e9f5aabfb2e4591854a0c92f1ebd7e2",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 196, "line": 18, "column": 11 },
                      "end": { "index": 202, "line": 18, "column": 17 }
                    }
                  }
                },
                "chained_mechanisms": []
              },
              "then": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "aaa25f4d8aa80b47f775e710e30192cd",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 216, "line": 19, "column": 14 },
                    "end": { "index": 220, "line": 19, "column": 18 }
                  },
                  "parameters": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": {
                      "kind": "const_number",
                      "value": 20.0,
                      "unit": "€"
                    },
                    "id": "aaa25f4d8aa80b47f775e710e30192cd",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 216, "line": 19, "column": 14 },
                      "end": { "index": 220, "line": 19, "column": 18 }
                    }
                  }
                },
                "chained_mechanisms": []
              }
            },
            {
              "if": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "boolean",
                  "id": "78a1c83468d98579acf02c7aed917ddc",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 231, "line": 20, "column": 11 },
                    "end": { "index": 236, "line": 20, "column": 16 }
                  },
                  "parameters": {
                    "kind": "gt",
                    "type": "boolean",
                    "parameters": {
                      "left": {
                        "kind": "ref",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "rule": "a" },
                        "id": "85ed9e46d68d10be3651ce2d1839fa5c",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 231, "line": 20, "column": 11 },
                          "end": { "index": 232, "line": 20, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 5.0 },
                        "id": "2d28879da7cf4680704d99a1424281ed",
                        "position": {
                          "file": "./rules.publicodes",
                          "start": { "index": 235, "line": 20, "column": 15 },
                          "end": { "index": 236, "line": 20, "column": 16 }
                        }
                      }
                    },
                    "id": "78a1c83468d98579acf02c7aed917ddc",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 231, "line": 20, "column": 11 },
                      "end": { "index": 236, "line": 20, "column": 16 }
                    }
                  }
                },
                "chained_mechanisms": []
              },
              "then": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "ba827429653151b7b75a1fa3b9435406",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 250, "line": 21, "column": 14 },
                    "end": { "index": 253, "line": 21, "column": 17 }
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
                    "id": "ba827429653151b7b75a1fa3b9435406",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 250, "line": 21, "column": 14 },
                      "end": { "index": 253, "line": 21, "column": 17 }
                    }
                  }
                },
                "chained_mechanisms": []
              }
            }
          ],
          "else": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "€",
              "id": "d55e2265821f803a64844f20cc15fecd",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 267, "line": 22, "column": 14 },
                "end": { "index": 268, "line": 22, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "€",
                "parameters": { "kind": "const_number", "value": 0.0 },
                "id": "d55e2265821f803a64844f20cc15fecd",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 267, "line": 22, "column": 14 },
                  "end": { "index": 268, "line": 22, "column": 15 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "type_def",
          "type": "number",
          "unit": "€",
          "id": "494e115dc123daf24b536efd30d7359c",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 159, "line": 16, "column": 3 },
            "end": { "index": 163, "line": 16, "column": 7 }
          },
          "parameters": { "type": "number" }
        }
      ]
    },
    "e": {
      "type": "number",
      "unit": "€",
      "id": "2920a300f32236192cd3a8ae3a82f771",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 269, "line": 23, "column": 1 },
        "end": { "index": 270, "line": 23, "column": 2 }
      },
      "public": true,
      "meta": { "une meta": "23", "une autre meta": "42" },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "e51f09b0d0bbf019f47e6a298146e686",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 336, "line": 28, "column": 3 },
          "end": { "index": 342, "line": 28, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "9a680db42b58c703053d621e7191e015",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 344, "line": 28, "column": 11 },
              "end": { "index": 349, "line": 28, "column": 16 }
            },
            "parameters": {
              "kind": "add",
              "type": "number",
              "unit": "€",
              "parameters": {
                "left": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "rule": "a" },
                  "id": "9be2e75819f7db42f75121c6d6433b89",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 344, "line": 28, "column": 11 },
                    "end": { "index": 345, "line": 28, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "rule": "b" },
                  "id": "2ef088a137d75c50707049c690c2f01a",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 348, "line": 28, "column": 15 },
                    "end": { "index": 349, "line": 28, "column": 16 }
                  }
                }
              },
              "id": "9a680db42b58c703053d621e7191e015",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 344, "line": 28, "column": 11 },
                "end": { "index": 349, "line": 28, "column": 16 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": []
    },
    "f": {
      "type": "number",
      "unit": "€",
      "id": "4b75590dbbd63e0c83dcc01829c30d51",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 350, "line": 29, "column": 1 },
        "end": { "index": 351, "line": 29, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "afebb17f3986bbf956d14603535413a1",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 353, "line": 29, "column": 4 },
          "end": { "index": 355, "line": 29, "column": 6 }
        },
        "parameters": {
          "kind": "neg",
          "type": "number",
          "unit": "€",
          "parameters": {
            "kind": "ref",
            "type": "number",
            "unit": "€",
            "parameters": { "rule": "e" },
            "id": "ea02a8ba13e92750eaa1c6daee71a830",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 354, "line": 29, "column": 5 },
              "end": { "index": 355, "line": 29, "column": 6 }
            }
          },
          "id": "afebb17f3986bbf956d14603535413a1",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 353, "line": 29, "column": 4 },
            "end": { "index": 355, "line": 29, "column": 6 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "g": {
      "type": "number",
      "unit": "€",
      "id": "83c10e644564e1dfa5cbb65bde2e261a",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 356, "line": 30, "column": 1 },
        "end": { "index": 357, "line": 30, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "fd1451ad08c7725a7baa87c03cda4d46",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 361, "line": 31, "column": 3 },
          "end": { "index": 367, "line": 31, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "08ecce99ccb92d3a0a1ac628f7003c3d",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 369, "line": 31, "column": 11 },
              "end": { "index": 377, "line": 31, "column": 19 }
            },
            "parameters": {
              "kind": "add",
              "type": "number",
              "unit": "€",
              "parameters": {
                "left": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "rule": "b" },
                  "id": "ec34c2632f530167d897fdea46c00755",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 369, "line": 31, "column": 11 },
                    "end": { "index": 370, "line": 31, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "rule": "g . here" },
                  "id": "e6d37e231ed7853fc48ebf4549a2d0b5",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 373, "line": 31, "column": 15 },
                    "end": { "index": 377, "line": 31, "column": 19 }
                  }
                }
              },
              "id": "08ecce99ccb92d3a0a1ac628f7003c3d",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 369, "line": 31, "column": 11 },
                "end": { "index": 377, "line": 31, "column": 19 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": [
        {
          "kind": "context",
          "type": "number",
          "unit": "€",
          "id": "c9c2121f4542e313f9af1159395edbef",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 400, "line": 34, "column": 3 },
            "end": { "index": 408, "line": 34, "column": 11 }
          },
          "parameters": {
            "a": {
              "value_mechanism": {
                "kind": "expr",
                "type": "number",
                "unit": "€",
                "id": "70bc91a79e650a3de1a13547ecfdb162",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 417, "line": 35, "column": 8 },
                  "end": { "index": 418, "line": 35, "column": 9 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 2.0 },
                  "id": "70bc91a79e650a3de1a13547ecfdb162",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 417, "line": 35, "column": 8 },
                    "end": { "index": 418, "line": 35, "column": 9 }
                  }
                }
              },
              "chained_mechanisms": []
            },
            "b . c": {
              "value_mechanism": {
                "kind": "expr",
                "type": "number",
                "unit": "€",
                "id": "d4d008305cadabcdc6037e13a7389c14",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 430, "line": 36, "column": 12 },
                  "end": { "index": 431, "line": 36, "column": 13 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 3.0 },
                  "id": "d4d008305cadabcdc6037e13a7389c14",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 430, "line": 36, "column": 12 },
                    "end": { "index": 431, "line": 36, "column": 13 }
                  }
                }
              },
              "chained_mechanisms": []
            },
            "g . here": {
              "value_mechanism": {
                "kind": "expr",
                "type": "number",
                "unit": "€",
                "id": "ea172deda873744cd84d66c80ab87331",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 442, "line": 37, "column": 11 },
                  "end": { "index": 443, "line": 37, "column": 12 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 9.0 },
                  "id": "ea172deda873744cd84d66c80ab87331",
                  "position": {
                    "file": "./rules.publicodes",
                    "start": { "index": 442, "line": 37, "column": 11 },
                    "end": { "index": 443, "line": 37, "column": 12 }
                  }
                }
              },
              "chained_mechanisms": []
            }
          }
        }
      ]
    },
    "g . here": {
      "type": "number",
      "unit": "€",
      "id": "f937da887ec592be076f065be83b4c51",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 390, "line": 33, "column": 5 },
        "end": { "index": 394, "line": 33, "column": 9 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "7e070350e9f6c4d8c975a188e3fa4d21",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 396, "line": 33, "column": 11 },
          "end": { "index": 397, "line": 33, "column": 12 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "const_number", "value": 5.0 },
          "id": "7e070350e9f6c4d8c975a188e3fa4d21",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 396, "line": 33, "column": 11 },
            "end": { "index": 397, "line": 33, "column": 12 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "h": {
      "type": "number",
      "unit": "aucune",
      "id": "7e0a9f8d8c8ca876b1d5740f934e0a95",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 444, "line": 38, "column": 1 },
        "end": { "index": 445, "line": 38, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "bc10fa45a9b3180f6fe289024ec912e1",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 449, "line": 39, "column": 3 },
          "end": { "index": 455, "line": 39, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "6160c0395a8f8ab524dcb2b05a96ef2d",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 457, "line": 39, "column": 11 },
              "end": { "index": 459, "line": 39, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 30.0 },
              "id": "6160c0395a8f8ab524dcb2b05a96ef2d",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 457, "line": 39, "column": 11 },
                "end": { "index": 459, "line": 39, "column": 13 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": [
        {
          "kind": "applicable_if",
          "type": "number",
          "unit": "aucune",
          "id": "41f7633e7a4fe3ce1d9e2baaabd3bde1",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 462, "line": 40, "column": 3 },
            "end": { "index": 475, "line": 40, "column": 16 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "4206ec76ab8b78e1e846fceaf1a6d56d",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 477, "line": 40, "column": 18 },
                "end": { "index": 483, "line": 40, "column": 24 }
              },
              "parameters": {
                "kind": "gt",
                "type": "boolean",
                "parameters": {
                  "left": {
                    "kind": "ref",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "rule": "g" },
                    "id": "d352c3c8c35a48e08bc0a2b72baaf34c",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 477, "line": 40, "column": 18 },
                      "end": { "index": 478, "line": 40, "column": 19 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "const_number", "value": 20.0 },
                    "id": "8bf3bcd66982408fdac9409788b5130b",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 481, "line": 40, "column": 22 },
                      "end": { "index": 483, "line": 40, "column": 24 }
                    }
                  }
                },
                "id": "4206ec76ab8b78e1e846fceaf1a6d56d",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 477, "line": 40, "column": 18 },
                  "end": { "index": 483, "line": 40, "column": 24 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "i": {
      "type": "number",
      "unit": "aucune",
      "id": "c7eccdaa952fb354fffb74ae34654fab",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 484, "line": 41, "column": 1 },
        "end": { "index": 485, "line": 41, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "6c9bf2821477f83615a4b0f6798717ce",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 489, "line": 42, "column": 3 },
          "end": { "index": 495, "line": 42, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "0ac14150e7642a3985c11859d84a1a31",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 497, "line": 42, "column": 11 },
              "end": { "index": 499, "line": 42, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 30.0 },
              "id": "0ac14150e7642a3985c11859d84a1a31",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 497, "line": 42, "column": 11 },
                "end": { "index": 499, "line": 42, "column": 13 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": [
        {
          "kind": "not_applicable_if",
          "type": "number",
          "unit": "aucune",
          "id": "04410a4612806663e6baad1d699490bd",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 502, "line": 43, "column": 3 },
            "end": { "index": 519, "line": 43, "column": 20 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "4e8f3c7e54a41ef1516e23c3de9d3480",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 521, "line": 43, "column": 22 },
                "end": { "index": 527, "line": 43, "column": 28 }
              },
              "parameters": {
                "kind": "gt",
                "type": "boolean",
                "parameters": {
                  "left": {
                    "kind": "ref",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "rule": "g" },
                    "id": "0a67dc065b57d1803c14b8ab845da1c8",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 521, "line": 43, "column": 22 },
                      "end": { "index": 522, "line": 43, "column": 23 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "const_number", "value": 20.0 },
                    "id": "22d9f8357c2091866956ba7b9efba8c0",
                    "position": {
                      "file": "./rules.publicodes",
                      "start": { "index": 525, "line": 43, "column": 26 },
                      "end": { "index": 527, "line": 43, "column": 28 }
                    }
                  }
                },
                "id": "4e8f3c7e54a41ef1516e23c3de9d3480",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 521, "line": 43, "column": 22 },
                  "end": { "index": 527, "line": 43, "column": 28 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "j": {
      "type": "number",
      "unit": "aucune",
      "id": "0b51594e439e3ef80b60ac6d6ec38993",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 528, "line": 44, "column": 1 },
        "end": { "index": 529, "line": 44, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "0b51594e439e3ef80b60ac6d6ec38993",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 528, "line": 44, "column": 1 },
          "end": { "index": 529, "line": 44, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "type_def",
          "type": "number",
          "unit": "aucune",
          "id": "8b7cee36449f76dd4fc12530ca4f04bb",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 533, "line": 45, "column": 3 },
            "end": { "index": 537, "line": 45, "column": 7 }
          },
          "parameters": { "type": "number" }
        },
        {
          "kind": "default",
          "type": "number",
          "unit": "aucune",
          "id": "bf3fc036b1e0afe09e9cbe118e38feb0",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 548, "line": 46, "column": 3 },
            "end": { "index": 558, "line": 46, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "e5d045027455ff26040f109c5564cb35",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 560, "line": 46, "column": 15 },
                "end": { "index": 562, "line": 46, "column": 17 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 20.0 },
                "id": "e5d045027455ff26040f109c5564cb35",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 560, "line": 46, "column": 15 },
                  "end": { "index": 562, "line": 46, "column": 17 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "k": {
      "type": "number",
      "unit": "aucune",
      "id": "6877f050de82ce045a5b6a4755afb16b",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 563, "line": 47, "column": 1 },
        "end": { "index": 564, "line": 47, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "929bb3b02af3b428e0871af04bebea0e",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 568, "line": 48, "column": 3 },
          "end": { "index": 574, "line": 48, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "0b466fb90c009cb71c7e069063d77d6a",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 576, "line": 48, "column": 11 },
              "end": { "index": 577, "line": 48, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 4.0 },
              "id": "0b466fb90c009cb71c7e069063d77d6a",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 576, "line": 48, "column": 11 },
                "end": { "index": 577, "line": 48, "column": 12 }
              }
            }
          },
          "chained_mechanisms": []
        }
      },
      "chained_mechanisms": [
        {
          "kind": "ceiling",
          "type": "number",
          "unit": "aucune",
          "id": "cbfde12b14aab7ca62b1a3bd44791e05",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 580, "line": 49, "column": 3 },
            "end": { "index": 587, "line": 49, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "64bde61212d177b7485e3acc6cd75993",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 589, "line": 49, "column": 12 },
                "end": { "index": 592, "line": 49, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "64bde61212d177b7485e3acc6cd75993",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 589, "line": 49, "column": 12 },
                  "end": { "index": 592, "line": 49, "column": 15 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "l": {
      "type": "number",
      "unit": "aucune",
      "id": "7ff3a9eea4c17c369ca9e23a8ad3c3eb",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 593, "line": 50, "column": 1 },
        "end": { "index": 594, "line": 50, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "61ee4d5fe6ae5d9bd8f5fe887d913ab0",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 598, "line": 51, "column": 3 },
          "end": { "index": 604, "line": 51, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "7d2d86b774a2e716038399da627aa9cd",
            "position": {
              "file": "./rules.publicodes",
              "start": { "index": 606, "line": 51, "column": 11 },
              "end": { "index": 607, "line": 51, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 2.0 },
              "id": "7d2d86b774a2e716038399da627aa9cd",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 606, "line": 51, "column": 11 },
                "end": { "index": 607, "line": 51, "column": 12 }
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
          "unit": "aucune",
          "id": "355217a0bf6aee14ae02e524cf1db217",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 610, "line": 52, "column": 3 },
            "end": { "index": 618, "line": 52, "column": 11 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "f109c2fe444e06719d9f110fe1cc064c",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 620, "line": 52, "column": 13 },
                "end": { "index": 621, "line": 52, "column": 14 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 3.0 },
                "id": "f109c2fe444e06719d9f110fe1cc064c",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 620, "line": 52, "column": 13 },
                  "end": { "index": 621, "line": 52, "column": 14 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "m": {
      "type": "number",
      "unit": "aucune",
      "id": "35a79ca25226bd7a44b834a77cdf59ca",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 622, "line": 53, "column": 1 },
        "end": { "index": 623, "line": 53, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "35a79ca25226bd7a44b834a77cdf59ca",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 622, "line": 53, "column": 1 },
          "end": { "index": 623, "line": 53, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_nearest",
          "type": "number",
          "unit": "aucune",
          "id": "139111f18d0fde6a00af968527f2b807",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 627, "line": 54, "column": 3 },
            "end": { "index": 634, "line": 54, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "b4deafa85c38cdc602b0c120fc8d2211",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 636, "line": 54, "column": 12 },
                "end": { "index": 639, "line": 54, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "b4deafa85c38cdc602b0c120fc8d2211",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 636, "line": 54, "column": 12 },
                  "end": { "index": 639, "line": 54, "column": 15 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "n": {
      "type": "number",
      "unit": "aucune",
      "id": "1660062f1fd3e699853fea79f3b0a1ec",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 640, "line": 55, "column": 1 },
        "end": { "index": 641, "line": 55, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "1660062f1fd3e699853fea79f3b0a1ec",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 640, "line": 55, "column": 1 },
          "end": { "index": 641, "line": 55, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_down",
          "type": "number",
          "unit": "aucune",
          "id": "937738b161e750aa70276f7c7ffc729e",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 645, "line": 56, "column": 3 },
            "end": { "index": 666, "line": 56, "column": 24 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "dfb36252a0bc10b16ced275825540b0d",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 668, "line": 56, "column": 26 },
                "end": { "index": 671, "line": 56, "column": 29 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "dfb36252a0bc10b16ced275825540b0d",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 668, "line": 56, "column": 26 },
                  "end": { "index": 671, "line": 56, "column": 29 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    },
    "o": {
      "type": "number",
      "unit": "aucune",
      "id": "48cc205da162ade87c9160a7ef78664d",
      "position": {
        "file": "./rules.publicodes",
        "start": { "index": 672, "line": 57, "column": 1 },
        "end": { "index": 673, "line": 57, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "48cc205da162ade87c9160a7ef78664d",
        "position": {
          "file": "./rules.publicodes",
          "start": { "index": 672, "line": 57, "column": 1 },
          "end": { "index": 673, "line": 57, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_up",
          "type": "number",
          "unit": "aucune",
          "id": "27287304c72e15930d3d73c8ad8af7e2",
          "position": {
            "file": "./rules.publicodes",
            "start": { "index": 677, "line": 58, "column": 3 },
            "end": { "index": 697, "line": 58, "column": 23 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "0d24e8b18fc3c30944b34f9a5a2b17d1",
              "position": {
                "file": "./rules.publicodes",
                "start": { "index": 699, "line": 58, "column": 25 },
                "end": { "index": 702, "line": 58, "column": 28 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "0d24e8b18fc3c30944b34f9a5a2b17d1",
                "position": {
                  "file": "./rules.publicodes",
                  "start": { "index": 699, "line": 58, "column": 25 },
                  "end": { "index": 702, "line": 58, "column": 28 }
                }
              }
            },
            "chained_mechanisms": []
          }
        }
      ]
    }
  }

  $ publicodes compile . -o - | ../../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {10.000000} */ (
      $ret("8c53200048a761596ecae3e1e3bf0d41", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("ff79a2db81cac7b17e568fcd2d7edf5a", ctx, $add(
        $ret("ff79a2db81cac7b17e568fcd2d7edf5a", ctx, $add(
          $ret("f5c30e4e84bf738d213540cfb36bf2a4", ctx, ((ctx) => $ret("607482e8a1a50f7f33a94672c51e4bba", ctx, $ref("a", _a, ctx, params)))(
          			{
          				...ctx,
          				_context_stack: ctx._context_stack + "-f5c30e4e84bf738d213540cfb36bf2a4",
          					"a": $ret("cbbb38b3c23969c6db449330c9fb3586", ctx, 30.),
          			}
          		)),
          $ret("4fd650849b843a93fc12a8a17768e33b", ctx, $ref("a", _a, ctx, params)))),
        $ret("0619c80afde2af8cffee7f4efe428260", ctx, $ref("b . c", _b_·_c, ctx, params))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {55.000000} */ (
      $ret("b11107b71fb9389430e680fcb5514f4e", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, $cond(
        $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, $eq(
          $ret("3e9f5aabfb2e4591854a0c92f1ebd7e2", ctx, $gt(
            $ret("b3db789b60d2cc2cd3b1fa0033f12c6a", ctx, $ref("a", _a, ctx, params)),
            () => $ret("d7f3aa0c5a448fb5365bad3bdb8d6e7e", ctx, 20.))),
          $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, true))), () => $ret("aaa25f4d8aa80b47f775e710e30192cd", ctx, 20.), () => $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, $cond(
          $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, $eq(
            $ret("78a1c83468d98579acf02c7aed917ddc", ctx, $gt(
              $ret("85ed9e46d68d10be3651ce2d1839fa5c", ctx, $ref("a", _a, ctx, params)),
              () => $ret("2d28879da7cf4680704d99a1424281ed", ctx, 5.))),
            $ret("c52608930469dcbd5d92ae1c48d2ace7", ctx, true))), () => $ret("ba827429653151b7b75a1fa3b9435406", ctx, 5.), () => $ret("d55e2265821f803a64844f20cc15fecd", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("9a680db42b58c703053d621e7191e015", ctx, $add(
        $ret("9be2e75819f7db42f75121c6d6433b89", ctx, $ref("a", _a, ctx, params)),
        $ret("2ef088a137d75c50707049c690c2f01a", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("afebb17f3986bbf956d14603535413a1", ctx, $neg($ret("ea02a8ba13e92750eaa1c6daee71a830", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("c9c2121f4542e313f9af1159395edbef", ctx, ((ctx) => $ret("08ecce99ccb92d3a0a1ac628f7003c3d", ctx, $add(
        $ret("ec34c2632f530167d897fdea46c00755", ctx, $ref("b", _b, ctx, params)),
        $ret("e6d37e231ed7853fc48ebf4549a2d0b5", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      				_context_stack: ctx._context_stack + "-c9c2121f4542e313f9af1159395edbef",
      					"a": $ret("70bc91a79e650a3de1a13547ecfdb162", ctx, 2.),
      					"b . c": $ret("d4d008305cadabcdc6037e13a7389c14", ctx, 3.),
      					"g . here": $ret("ea172deda873744cd84d66c80ab87331", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {5.000000} */ (
      $ret("7e070350e9f6c4d8c975a188e3fa4d21", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {30.000000} */ (
      $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, $cond(
        $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, $or(
          $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, (isNotDefined($ret("4206ec76ab8b78e1e846fceaf1a6d56d", ctx, $gt(
            $ret("d352c3c8c35a48e08bc0a2b72baaf34c", ctx, $ref("g", _g, ctx, params)),
            () => $ret("8bf3bcd66982408fdac9409788b5130b", ctx, 20.)))))),
          () => $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, $or(
            $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, $eq(
              $ret("4206ec76ab8b78e1e846fceaf1a6d56d", ctx, $gt(
                $ret("d352c3c8c35a48e08bc0a2b72baaf34c", ctx, $ref("g", _g, ctx, params)),
                () => $ret("8bf3bcd66982408fdac9409788b5130b", ctx, 20.))),
              $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, false))),
            () => $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, $eq(
              $ret("4206ec76ab8b78e1e846fceaf1a6d56d", ctx, $gt(
                $ret("d352c3c8c35a48e08bc0a2b72baaf34c", ctx, $ref("g", _g, ctx, params)),
                () => $ret("8bf3bcd66982408fdac9409788b5130b", ctx, 20.))),
              $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, NotApplicable))))))), () => $ret("41f7633e7a4fe3ce1d9e2baaabd3bde1", ctx, NotApplicable), () => $ret("6160c0395a8f8ab524dcb2b05a96ef2d", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {30.000000} */ (
      $ret("04410a4612806663e6baad1d699490bd", ctx, $cond(
        $ret("04410a4612806663e6baad1d699490bd", ctx, $or(
          $ret("04410a4612806663e6baad1d699490bd", ctx, (isNotDefined($ret("4e8f3c7e54a41ef1516e23c3de9d3480", ctx, $gt(
            $ret("0a67dc065b57d1803c14b8ab845da1c8", ctx, $ref("g", _g, ctx, params)),
            () => $ret("22d9f8357c2091866956ba7b9efba8c0", ctx, 20.)))))),
          () => $ret("04410a4612806663e6baad1d699490bd", ctx, $or(
            $ret("04410a4612806663e6baad1d699490bd", ctx, $eq(
              $ret("4e8f3c7e54a41ef1516e23c3de9d3480", ctx, $gt(
                $ret("0a67dc065b57d1803c14b8ab845da1c8", ctx, $ref("g", _g, ctx, params)),
                () => $ret("22d9f8357c2091866956ba7b9efba8c0", ctx, 20.))),
              $ret("04410a4612806663e6baad1d699490bd", ctx, false))),
            () => $ret("04410a4612806663e6baad1d699490bd", ctx, $eq(
              $ret("4e8f3c7e54a41ef1516e23c3de9d3480", ctx, $gt(
                $ret("0a67dc065b57d1803c14b8ab845da1c8", ctx, $ref("g", _g, ctx, params)),
                () => $ret("22d9f8357c2091866956ba7b9efba8c0", ctx, 20.))),
              $ret("04410a4612806663e6baad1d699490bd", ctx, NotApplicable))))))), () => $ret("0ac14150e7642a3985c11859d84a1a31", ctx, 30.), () => $ret("04410a4612806663e6baad1d699490bd", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("bf3fc036b1e0afe09e9cbe118e38feb0", ctx, $cond(
        $ret("bf3fc036b1e0afe09e9cbe118e38feb0", ctx, (isNotDefined($ret("0b51594e439e3ef80b60ac6d6ec38993", ctx, $get("j", ctx, params))))), () => $ret("e5d045027455ff26040f109c5564cb35", ctx, 20.), () => $ret("0b51594e439e3ef80b60ac6d6ec38993", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {2.300000} */ (
      $ret("cbfde12b14aab7ca62b1a3bd44791e05", ctx, $cond(
        $ret("cbfde12b14aab7ca62b1a3bd44791e05", ctx, $and(
          $ret("cbfde12b14aab7ca62b1a3bd44791e05", ctx, $neq(
            $ret("64bde61212d177b7485e3acc6cd75993", ctx, 2.3),
            $ret("cbfde12b14aab7ca62b1a3bd44791e05", ctx, NotApplicable))),
          () => $ret("cbfde12b14aab7ca62b1a3bd44791e05", ctx, $gt(
            $ret("0b466fb90c009cb71c7e069063d77d6a", ctx, 4.),
            () => $ret("64bde61212d177b7485e3acc6cd75993", ctx, 2.3))))), () => $ret("64bde61212d177b7485e3acc6cd75993", ctx, 2.3), () => $ret("0b466fb90c009cb71c7e069063d77d6a", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {3.000000} */ (
      $ret("355217a0bf6aee14ae02e524cf1db217", ctx, $cond(
        $ret("355217a0bf6aee14ae02e524cf1db217", ctx, $and(
          $ret("355217a0bf6aee14ae02e524cf1db217", ctx, $neq(
            $ret("f109c2fe444e06719d9f110fe1cc064c", ctx, 3.),
            $ret("355217a0bf6aee14ae02e524cf1db217", ctx, NotApplicable))),
          () => $ret("355217a0bf6aee14ae02e524cf1db217", ctx, $lt(
            $ret("7d2d86b774a2e716038399da627aa9cd", ctx, 2.),
            () => $ret("f109c2fe444e06719d9f110fe1cc064c", ctx, 3.))))), () => $ret("f109c2fe444e06719d9f110fe1cc064c", ctx, 3.), () => $ret("7d2d86b774a2e716038399da627aa9cd", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("139111f18d0fde6a00af968527f2b807", ctx, $round("nearest", $ret("35a79ca25226bd7a44b834a77cdf59ca", ctx, $get("m", ctx, params)), () => $ret("b4deafa85c38cdc602b0c120fc8d2211", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("937738b161e750aa70276f7c7ffc729e", ctx, $round("down", $ret("1660062f1fd3e699853fea79f3b0a1ec", ctx, $get("n", ctx, params)), () => $ret("dfb36252a0bc10b16ced275825540b0d", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("27287304c72e15930d3d73c8ad8af7e2", ctx, $round("up", $ret("48cc205da162ade87c9160a7ef78664d", ctx, $get("o", ctx, params)), () => $ret("0d24e8b18fc3c30944b34f9a5a2b17d1", ctx, 2.3)))
    )
