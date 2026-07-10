Valid json doc :

  $ publicodes compile ./ok/example/ -t json -o -
  {
    "a": {
      "type": "number",
      "unit": "€",
      "id": "e3de83a01259fcc2507884d72ac1b8f7",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 1, "line": 1, "column": 2 }
      },
      "title": "A",
      "description": "la valeur A",
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "10f824d111f47be89cda2b7970cbd5c4",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 5, "line": 2, "column": 3 },
          "end": { "index": 11, "line": 2, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "8d47d3ca5b989cd22f6f87e097e899de",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 13, "line": 2, "column": 11 },
              "end": { "index": 17, "line": 2, "column": 15 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": { "kind": "number", "value": 10.0, "unit": "€" },
              "id": "8d47d3ca5b989cd22f6f87e097e899de",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
      "id": "f910c4044e9e6cd3f7d53b8ff1540b6d",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 56, "line": 5, "column": 1 },
        "end": { "index": 57, "line": 5, "column": 2 }
      },
      "value_mechanism": {
        "kind": "sum",
        "type": "number",
        "unit": "€",
        "id": "b7caa156fe9e5c7e1e73b106471c9fbc",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 61, "line": 6, "column": 3 },
          "end": { "index": 66, "line": 6, "column": 8 }
        },
        "parameters": [
          {
            "value_mechanism": {
              "kind": "value",
              "type": "unknown",
              "id": "fdb865eb8102d1f3c0dd58f6e359bf44",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 80, "line": 8, "column": 7 },
                "end": { "index": 86, "line": 8, "column": 13 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "7376ca41dea2a05ace8fc15304576e71",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 88, "line": 8, "column": 15 },
                    "end": { "index": 89, "line": 8, "column": 16 }
                  },
                  "parameters": {
                    "kind": "ref",
                    "type": "number",
                    "unit": "€",
                    "parameters": "a",
                    "id": "7376ca41dea2a05ace8fc15304576e71",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
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
                "id": "7e9534cba09caa7c995eba8c46bcfd79",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 96, "line": 9, "column": 7 },
                  "end": { "index": 104, "line": 9, "column": 15 }
                },
                "parameters": {
                  "a": {
                    "value_mechanism": {
                      "kind": "expr",
                      "type": "unknown",
                      "id": "595b0c17f535d045274041b9a0a1855a",
                      "position": {
                        "file": "./ok/example/rules.publicodes",
                        "start": { "index": 117, "line": 10, "column": 12 },
                        "end": { "index": 119, "line": 10, "column": 14 }
                      },
                      "parameters": {
                        "kind": "constant",
                        "type": "unknown",
                        "parameters": { "kind": "number", "value": 30.0 },
                        "id": "595b0c17f535d045274041b9a0a1855a",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
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
              "id": "cc6dc6886b3af08a122c0f8a48384c3a",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 126, "line": 11, "column": 7 },
                "end": { "index": 127, "line": 11, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": "a",
                "id": "cc6dc6886b3af08a122c0f8a48384c3a",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
              "id": "9dc30d4d4ec44af344fc9beb20db9c0d",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 134, "line": 12, "column": 7 },
                "end": { "index": 135, "line": 12, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": "b . c",
                "id": "9dc30d4d4ec44af344fc9beb20db9c0d",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "f65ab69d8d49eb00d5cd1bfbb80b34e8",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 148, "line": 14, "column": 5 },
        "end": { "index": 149, "line": 14, "column": 6 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "d34862e6bd782c4198dd76069a047222",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 151, "line": 14, "column": 8 },
          "end": { "index": 153, "line": 14, "column": 10 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "number", "value": 55.0 },
          "id": "d34862e6bd782c4198dd76069a047222",
          "position": {
            "file": "./ok/example/rules.publicodes",
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
      "id": "dffdf3d821e13c7a4fdc49eb20d64205",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 154, "line": 15, "column": 1 },
        "end": { "index": 155, "line": 15, "column": 2 }
      },
      "value_mechanism": {
        "kind": "variations",
        "type": "number",
        "unit": "€",
        "id": "1bcee7aaa1bd26510744c6e6e6c1476f",
        "position": {
          "file": "./ok/example/rules.publicodes",
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
                  "id": "379268a6728565052872e84cc59d2ae6",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
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
                        "parameters": "a",
                        "id": "92ee92803f9b13f9c08ff3a034f65d79",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 196, "line": 18, "column": 11 },
                          "end": { "index": 197, "line": 18, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "number", "value": 20.0 },
                        "id": "2e80d7ac0607c370e7fd09f2aeca3896",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 200, "line": 18, "column": 15 },
                          "end": { "index": 202, "line": 18, "column": 17 }
                        }
                      }
                    },
                    "id": "379268a6728565052872e84cc59d2ae6",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
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
                  "id": "6d81f6b8c0f6eee9f791a246f7cb71be",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 216, "line": 19, "column": 14 },
                    "end": { "index": 220, "line": 19, "column": 18 }
                  },
                  "parameters": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": {
                      "kind": "number",
                      "value": 20.0,
                      "unit": "€"
                    },
                    "id": "6d81f6b8c0f6eee9f791a246f7cb71be",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
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
                  "id": "febe8b3e2c605df1d6f27028f8d17ffd",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
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
                        "parameters": "a",
                        "id": "4580c231891aacc8f2bac4dcf0649324",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 231, "line": 20, "column": 11 },
                          "end": { "index": 232, "line": 20, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "number", "value": 5.0 },
                        "id": "15122ef90c36d657ff8ddaaaa527d85a",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 235, "line": 20, "column": 15 },
                          "end": { "index": 236, "line": 20, "column": 16 }
                        }
                      }
                    },
                    "id": "febe8b3e2c605df1d6f27028f8d17ffd",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
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
                  "id": "3be844f96ba0ba8d09a556b3bce9aee1",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 250, "line": 21, "column": 14 },
                    "end": { "index": 253, "line": 21, "column": 17 }
                  },
                  "parameters": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": {
                      "kind": "number",
                      "value": 5.0,
                      "unit": "€"
                    },
                    "id": "3be844f96ba0ba8d09a556b3bce9aee1",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
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
              "id": "35695be255c34515f1808225a01c09c8",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 267, "line": 22, "column": 14 },
                "end": { "index": 268, "line": 22, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "€",
                "parameters": { "kind": "number", "value": 0.0 },
                "id": "35695be255c34515f1808225a01c09c8",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
          "type": "unknown",
          "id": "478b91f0e64214c83910eb8f80458bbb",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 159, "line": 16, "column": 3 },
            "end": { "index": 163, "line": 16, "column": 7 }
          },
          "parameters": { "value": "number" }
        }
      ]
    },
    "e": {
      "type": "number",
      "unit": "€",
      "id": "3693739a4799a7967fd9f6c1260d1992",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 269, "line": 23, "column": 1 },
        "end": { "index": 270, "line": 23, "column": 2 }
      },
      "public": true,
      "meta": { "une meta": "23", "une autre meta": "42" },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "69c0f513877664f9a7c8d9788a98af76",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 336, "line": 28, "column": 3 },
          "end": { "index": 342, "line": 28, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "1f95f9a5bbeaabf027ab49dafd83f9a2",
            "position": {
              "file": "./ok/example/rules.publicodes",
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
                  "parameters": "a",
                  "id": "bd1b6ad52d15466d78052cf7df6f898d",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 344, "line": 28, "column": 11 },
                    "end": { "index": 345, "line": 28, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": "b",
                  "id": "1133814094f7e537eb8dc5ec862882b5",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 348, "line": 28, "column": 15 },
                    "end": { "index": 349, "line": 28, "column": 16 }
                  }
                }
              },
              "id": "1f95f9a5bbeaabf027ab49dafd83f9a2",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
      "id": "1ee29fe1bb6ad91d9c59f56d5ac7d297",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 350, "line": 29, "column": 1 },
        "end": { "index": 351, "line": 29, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "6e26168b88ecdb52398b96cef8a1a567",
        "position": {
          "file": "./ok/example/rules.publicodes",
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
            "parameters": "e",
            "id": "45cec1888d5c370898070feec68c6cc2",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 354, "line": 29, "column": 5 },
              "end": { "index": 355, "line": 29, "column": 6 }
            }
          },
          "id": "6e26168b88ecdb52398b96cef8a1a567",
          "position": {
            "file": "./ok/example/rules.publicodes",
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
      "id": "626e396fbf83c4709d4cdab48dc0c69a",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 356, "line": 30, "column": 1 },
        "end": { "index": 357, "line": 30, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "6a1c0c82e0490879d09440095f9ea662",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 361, "line": 31, "column": 3 },
          "end": { "index": 367, "line": 31, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "a7dbd11b1e543737e3e121abf22b60e4",
            "position": {
              "file": "./ok/example/rules.publicodes",
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
                  "parameters": "b",
                  "id": "00129db3f6bd9477a966d1f074fd3783",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 369, "line": 31, "column": 11 },
                    "end": { "index": 370, "line": 31, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": "g . here",
                  "id": "41697ec63e11b929d94198cd48976882",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 373, "line": 31, "column": 15 },
                    "end": { "index": 377, "line": 31, "column": 19 }
                  }
                }
              },
              "id": "a7dbd11b1e543737e3e121abf22b60e4",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
          "id": "7e9798e032e4287594dc7d232960cf9e",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 400, "line": 34, "column": 3 },
            "end": { "index": 408, "line": 34, "column": 11 }
          },
          "parameters": {
            "a": {
              "value_mechanism": {
                "kind": "expr",
                "type": "unknown",
                "id": "c02ec14716102dac6e9109832a512303",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 417, "line": 35, "column": 8 },
                  "end": { "index": 418, "line": 35, "column": 9 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "unknown",
                  "parameters": { "kind": "number", "value": 2.0 },
                  "id": "c02ec14716102dac6e9109832a512303",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
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
                "type": "unknown",
                "id": "952d97e6dede9eaf7d5408d9a5cd4275",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 430, "line": 36, "column": 12 },
                  "end": { "index": 431, "line": 36, "column": 13 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "unknown",
                  "parameters": { "kind": "number", "value": 3.0 },
                  "id": "952d97e6dede9eaf7d5408d9a5cd4275",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
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
                "type": "unknown",
                "id": "48bcd184f7ead186da3d6c15a1aeaeaf",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 442, "line": 37, "column": 11 },
                  "end": { "index": 443, "line": 37, "column": 12 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "unknown",
                  "parameters": { "kind": "number", "value": 9.0 },
                  "id": "48bcd184f7ead186da3d6c15a1aeaeaf",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
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
      "id": "082aa7a4949917c41280ec63b1d9e678",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 390, "line": 33, "column": 5 },
        "end": { "index": 394, "line": 33, "column": 9 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "58dc14caf290f5005a19962c8f8a9a72",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 396, "line": 33, "column": 11 },
          "end": { "index": 397, "line": 33, "column": 12 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "number", "value": 5.0 },
          "id": "58dc14caf290f5005a19962c8f8a9a72",
          "position": {
            "file": "./ok/example/rules.publicodes",
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
      "id": "9eb04852bf7feb054cd2210cc1665ce1",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 444, "line": 38, "column": 1 },
        "end": { "index": 445, "line": 38, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "cf3407f09d65b9909a88d8cf79ab90e9",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 449, "line": 39, "column": 3 },
          "end": { "index": 455, "line": 39, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "64a1b24a77b882891a31680e5fa89462",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 457, "line": 39, "column": 11 },
              "end": { "index": 459, "line": 39, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "number", "value": 30.0 },
              "id": "64a1b24a77b882891a31680e5fa89462",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
          "id": "aed8e031776cd178d056efd808767920",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 462, "line": 40, "column": 3 },
            "end": { "index": 475, "line": 40, "column": 16 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "27c1c650e5f2dc949cd7386294b6b069",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
                    "parameters": "g",
                    "id": "8722f95287996850bf3221f5a633522a",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 477, "line": 40, "column": 18 },
                      "end": { "index": 478, "line": 40, "column": 19 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "number", "value": 20.0 },
                    "id": "dbde4e44c57517873c5abcd454e180b1",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 481, "line": 40, "column": 22 },
                      "end": { "index": 483, "line": 40, "column": 24 }
                    }
                  }
                },
                "id": "27c1c650e5f2dc949cd7386294b6b069",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "ee479ef4839e287ca12487da43ab9a44",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 484, "line": 41, "column": 1 },
        "end": { "index": 485, "line": 41, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "3b87d8a424caefac720ba519270798e3",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 489, "line": 42, "column": 3 },
          "end": { "index": 495, "line": 42, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "7cecdb85484bd252b76704352e3fda06",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 497, "line": 42, "column": 11 },
              "end": { "index": 499, "line": 42, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "number", "value": 30.0 },
              "id": "7cecdb85484bd252b76704352e3fda06",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
          "id": "bb1d1f0c834d485e9e54a8137e598918",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 502, "line": 43, "column": 3 },
            "end": { "index": 519, "line": 43, "column": 20 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "fc0b43e789f4bf3bdaa078366b45ff2b",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
                    "parameters": "g",
                    "id": "0d91870b3b92c382721211ad658901a2",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 521, "line": 43, "column": 22 },
                      "end": { "index": 522, "line": 43, "column": 23 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "number", "value": 20.0 },
                    "id": "3c6a84a1c49d3db2d16126e0e2e54850",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 525, "line": 43, "column": 26 },
                      "end": { "index": 527, "line": 43, "column": 28 }
                    }
                  }
                },
                "id": "fc0b43e789f4bf3bdaa078366b45ff2b",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "2d4c19e34e1f891b55398c232d213f0b",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 528, "line": 44, "column": 1 },
        "end": { "index": 529, "line": 44, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "2d4c19e34e1f891b55398c232d213f0b",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 528, "line": 44, "column": 1 },
          "end": { "index": 529, "line": 44, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "type_def",
          "type": "unknown",
          "id": "63cd591781d0accc7eccb08c83fc1521",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 533, "line": 45, "column": 3 },
            "end": { "index": 537, "line": 45, "column": 7 }
          },
          "parameters": { "value": "number" }
        },
        {
          "kind": "default",
          "type": "number",
          "unit": "aucune",
          "id": "36b64c740e797f3da3ae98bbc8b4c173",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 548, "line": 46, "column": 3 },
            "end": { "index": 558, "line": 46, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "6c6935e8b5db5bc024ab8110014d0f87",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 560, "line": 46, "column": 15 },
                "end": { "index": 562, "line": 46, "column": 17 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 20.0 },
                "id": "6c6935e8b5db5bc024ab8110014d0f87",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "0ac8baea5292f4da901f8cde01a7a859",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 563, "line": 47, "column": 1 },
        "end": { "index": 564, "line": 47, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "9c0089866056c07831d35692f4ef1fe7",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 568, "line": 48, "column": 3 },
          "end": { "index": 574, "line": 48, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "e4e5a0e71cca211236e660570626c448",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 576, "line": 48, "column": 11 },
              "end": { "index": 577, "line": 48, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "number", "value": 4.0 },
              "id": "e4e5a0e71cca211236e660570626c448",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
          "id": "7ba8f0e46bfceefa4be6c40f7052f996",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 580, "line": 49, "column": 3 },
            "end": { "index": 587, "line": 49, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "1a10aa3f0e1d172300c290beacc10145",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 589, "line": 49, "column": 12 },
                "end": { "index": 592, "line": 49, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 2.3 },
                "id": "1a10aa3f0e1d172300c290beacc10145",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "f3d957dcc75aed53b33e7d8eded8989a",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 593, "line": 50, "column": 1 },
        "end": { "index": 594, "line": 50, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "a4b6b866cd8bc678b2bb4b994651ddc3",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 598, "line": 51, "column": 3 },
          "end": { "index": 604, "line": 51, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "703e26ad78b10a053b188e9c85f3e4cb",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 606, "line": 51, "column": 11 },
              "end": { "index": 607, "line": 51, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "number", "value": 2.0 },
              "id": "703e26ad78b10a053b188e9c85f3e4cb",
              "position": {
                "file": "./ok/example/rules.publicodes",
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
          "id": "b67860c87a65eb553bb5c8f04cc0bac8",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 610, "line": 52, "column": 3 },
            "end": { "index": 618, "line": 52, "column": 11 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "dcbcf10c6c7c9d00bd19cfbc4eca5b3c",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 620, "line": 52, "column": 13 },
                "end": { "index": 621, "line": 52, "column": 14 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 3.0 },
                "id": "dcbcf10c6c7c9d00bd19cfbc4eca5b3c",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "7a6824239f9738733a19872161254506",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 622, "line": 53, "column": 1 },
        "end": { "index": 623, "line": 53, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "7a6824239f9738733a19872161254506",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 622, "line": 53, "column": 1 },
          "end": { "index": 623, "line": 53, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_nearest",
          "type": "unknown",
          "id": "6a2ab61ce42b07f1299df6c548aba6ec",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 627, "line": 54, "column": 3 },
            "end": { "index": 634, "line": 54, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "5b1eb71254712afe6ff916bba64fbdee",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 636, "line": 54, "column": 12 },
                "end": { "index": 639, "line": 54, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 2.3 },
                "id": "5b1eb71254712afe6ff916bba64fbdee",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "6472ae7476687f9d705cb0f6cf89dd82",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 640, "line": 55, "column": 1 },
        "end": { "index": 641, "line": 55, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "6472ae7476687f9d705cb0f6cf89dd82",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 640, "line": 55, "column": 1 },
          "end": { "index": 641, "line": 55, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_down",
          "type": "unknown",
          "id": "5d36d06ec2cf502814790421574d1321",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 645, "line": 56, "column": 3 },
            "end": { "index": 666, "line": 56, "column": 24 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "429f61faaab2e7b2b6e0db6ae580e223",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 668, "line": 56, "column": 26 },
                "end": { "index": 671, "line": 56, "column": 29 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 2.3 },
                "id": "429f61faaab2e7b2b6e0db6ae580e223",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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
      "id": "5362e34b7b0cbdfeb8f117de3a8104f1",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 672, "line": 57, "column": 1 },
        "end": { "index": 673, "line": 57, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "5362e34b7b0cbdfeb8f117de3a8104f1",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 672, "line": 57, "column": 1 },
          "end": { "index": 673, "line": 57, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_up",
          "type": "unknown",
          "id": "d41825eec6548841548416e221324983",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 677, "line": 58, "column": 3 },
            "end": { "index": 697, "line": 58, "column": 23 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "7a9dbfffe97119be7c1deb558ba61287",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 699, "line": 58, "column": 25 },
                "end": { "index": 702, "line": 58, "column": 28 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "number", "value": 2.3 },
                "id": "7a9dbfffe97119be7c1deb558ba61287",
                "position": {
                  "file": "./ok/example/rules.publicodes",
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

  $ publicodes compile ./ok/example/ -o - | ../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("8d47d3ca5b989cd22f6f87e097e899de", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("b7caa156fe9e5c7e1e73b106471c9fbc", ctx, $add(
        $ret("cc6dc6886b3af08a122c0f8a48384c3a", ctx, $ref("a", _a, ctx, params)),
        $ret("b7caa156fe9e5c7e1e73b106471c9fbc", ctx, $add(
          $ret("9dc30d4d4ec44af344fc9beb20db9c0d", ctx, $ref("b . c", _b_·_c, ctx, params)),
          $ret("7e9534cba09caa7c995eba8c46bcfd79", ctx, ((ctx) => $ret("7376ca41dea2a05ace8fc15304576e71", ctx, $ref("a", _a, ctx, params)))(
          			{
          				...ctx,
          					"a": $ret("595b0c17f535d045274041b9a0a1855a", ctx, 30.),
          			}
          		))))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {number} */ (
      $ret("d34862e6bd782c4198dd76069a047222", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, $cond(
        $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, $eq(
          $ret("379268a6728565052872e84cc59d2ae6", ctx, $gt(
            $ret("92ee92803f9b13f9c08ff3a034f65d79", ctx, $ref("a", _a, ctx, params)),
            () => $ret("2e80d7ac0607c370e7fd09f2aeca3896", ctx, 20.))),
          $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, true))), () => $ret("6d81f6b8c0f6eee9f791a246f7cb71be", ctx, 20.), () => $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, $cond(
          $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, $eq(
            $ret("febe8b3e2c605df1d6f27028f8d17ffd", ctx, $gt(
              $ret("4580c231891aacc8f2bac4dcf0649324", ctx, $ref("a", _a, ctx, params)),
              () => $ret("15122ef90c36d657ff8ddaaaa527d85a", ctx, 5.))),
            $ret("1bcee7aaa1bd26510744c6e6e6c1476f", ctx, true))), () => $ret("3be844f96ba0ba8d09a556b3bce9aee1", ctx, 5.), () => $ret("35695be255c34515f1808225a01c09c8", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("1f95f9a5bbeaabf027ab49dafd83f9a2", ctx, $add(
        $ret("bd1b6ad52d15466d78052cf7df6f898d", ctx, $ref("a", _a, ctx, params)),
        $ret("1133814094f7e537eb8dc5ec862882b5", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("6e26168b88ecdb52398b96cef8a1a567", ctx, (-$ret("45cec1888d5c370898070feec68c6cc2", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("7e9798e032e4287594dc7d232960cf9e", ctx, ((ctx) => $ret("a7dbd11b1e543737e3e121abf22b60e4", ctx, $add(
        $ret("00129db3f6bd9477a966d1f074fd3783", ctx, $ref("b", _b, ctx, params)),
        $ret("41697ec63e11b929d94198cd48976882", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      					"a": $ret("c02ec14716102dac6e9109832a512303", ctx, 2.),
      					"b . c": $ret("952d97e6dede9eaf7d5408d9a5cd4275", ctx, 3.),
      					"g . here": $ret("48bcd184f7ead186da3d6c15a1aeaeaf", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {number} */ (
      $ret("58dc14caf290f5005a19962c8f8a9a72", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {number} */ (
      $ret("aed8e031776cd178d056efd808767920", ctx, $cond(
        $ret("aed8e031776cd178d056efd808767920", ctx, $or(
          $ret("aed8e031776cd178d056efd808767920", ctx, (isNotDefined($ret("27c1c650e5f2dc949cd7386294b6b069", ctx, $gt(
            $ret("8722f95287996850bf3221f5a633522a", ctx, $ref("g", _g, ctx, params)),
            () => $ret("dbde4e44c57517873c5abcd454e180b1", ctx, 20.)))))),
          () => $ret("aed8e031776cd178d056efd808767920", ctx, $or(
            $ret("aed8e031776cd178d056efd808767920", ctx, $eq(
              $ret("27c1c650e5f2dc949cd7386294b6b069", ctx, $gt(
                $ret("8722f95287996850bf3221f5a633522a", ctx, $ref("g", _g, ctx, params)),
                () => $ret("dbde4e44c57517873c5abcd454e180b1", ctx, 20.))),
              $ret("aed8e031776cd178d056efd808767920", ctx, false))),
            () => $ret("aed8e031776cd178d056efd808767920", ctx, $eq(
              $ret("27c1c650e5f2dc949cd7386294b6b069", ctx, $gt(
                $ret("8722f95287996850bf3221f5a633522a", ctx, $ref("g", _g, ctx, params)),
                () => $ret("dbde4e44c57517873c5abcd454e180b1", ctx, 20.))),
              $ret("aed8e031776cd178d056efd808767920", ctx, NotApplicable))))))), () => $ret("aed8e031776cd178d056efd808767920", ctx, NotApplicable), () => $ret("64a1b24a77b882891a31680e5fa89462", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {number} */ (
      $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, $cond(
        $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, $or(
          $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, (isNotDefined($ret("fc0b43e789f4bf3bdaa078366b45ff2b", ctx, $gt(
            $ret("0d91870b3b92c382721211ad658901a2", ctx, $ref("g", _g, ctx, params)),
            () => $ret("3c6a84a1c49d3db2d16126e0e2e54850", ctx, 20.)))))),
          () => $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, $or(
            $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, $eq(
              $ret("fc0b43e789f4bf3bdaa078366b45ff2b", ctx, $gt(
                $ret("0d91870b3b92c382721211ad658901a2", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3c6a84a1c49d3db2d16126e0e2e54850", ctx, 20.))),
              $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, false))),
            () => $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, $eq(
              $ret("fc0b43e789f4bf3bdaa078366b45ff2b", ctx, $gt(
                $ret("0d91870b3b92c382721211ad658901a2", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3c6a84a1c49d3db2d16126e0e2e54850", ctx, 20.))),
              $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, NotApplicable))))))), () => $ret("7cecdb85484bd252b76704352e3fda06", ctx, 30.), () => $ret("bb1d1f0c834d485e9e54a8137e598918", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("36b64c740e797f3da3ae98bbc8b4c173", ctx, $cond(
        $ret("36b64c740e797f3da3ae98bbc8b4c173", ctx, (isNotDefined($ret("2d4c19e34e1f891b55398c232d213f0b", ctx, $get("j", ctx, params))))), () => $ret("6c6935e8b5db5bc024ab8110014d0f87", ctx, 20.), () => $ret("2d4c19e34e1f891b55398c232d213f0b", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {number} */ (
      $ret("7ba8f0e46bfceefa4be6c40f7052f996", ctx, $cond(
        $ret("7ba8f0e46bfceefa4be6c40f7052f996", ctx, $and(
          $ret("7ba8f0e46bfceefa4be6c40f7052f996", ctx, $neq(
            $ret("1a10aa3f0e1d172300c290beacc10145", ctx, 2.3),
            $ret("7ba8f0e46bfceefa4be6c40f7052f996", ctx, NotApplicable))),
          () => $ret("7ba8f0e46bfceefa4be6c40f7052f996", ctx, $gt(
            $ret("e4e5a0e71cca211236e660570626c448", ctx, 4.),
            () => $ret("1a10aa3f0e1d172300c290beacc10145", ctx, 2.3))))), () => $ret("1a10aa3f0e1d172300c290beacc10145", ctx, 2.3), () => $ret("e4e5a0e71cca211236e660570626c448", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {number} */ (
      $ret("b67860c87a65eb553bb5c8f04cc0bac8", ctx, $cond(
        $ret("b67860c87a65eb553bb5c8f04cc0bac8", ctx, $and(
          $ret("b67860c87a65eb553bb5c8f04cc0bac8", ctx, $neq(
            $ret("dcbcf10c6c7c9d00bd19cfbc4eca5b3c", ctx, 3.),
            $ret("b67860c87a65eb553bb5c8f04cc0bac8", ctx, NotApplicable))),
          () => $ret("b67860c87a65eb553bb5c8f04cc0bac8", ctx, $lt(
            $ret("703e26ad78b10a053b188e9c85f3e4cb", ctx, 2.),
            () => $ret("dcbcf10c6c7c9d00bd19cfbc4eca5b3c", ctx, 3.))))), () => $ret("dcbcf10c6c7c9d00bd19cfbc4eca5b3c", ctx, 3.), () => $ret("703e26ad78b10a053b188e9c85f3e4cb", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("7a6824239f9738733a19872161254506", ctx, $round("nearest", $ret("7a6824239f9738733a19872161254506", ctx, $get("m", ctx, params)), () => $ret("5b1eb71254712afe6ff916bba64fbdee", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("6472ae7476687f9d705cb0f6cf89dd82", ctx, $round("down", $ret("6472ae7476687f9d705cb0f6cf89dd82", ctx, $get("n", ctx, params)), () => $ret("429f61faaab2e7b2b6e0db6ae580e223", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("5362e34b7b0cbdfeb8f117de3a8104f1", ctx, $round("up", $ret("5362e34b7b0cbdfeb8f117de3a8104f1", ctx, $get("o", ctx, params)), () => $ret("7a9dbfffe97119be7c1deb558ba61287", ctx, 2.3)))
    )

Correctly handle types:

  $ publicodes compile ./ok/simple-tjm/ -t json -o -
  {
    "charges": {
      "type": "number",
      "unit": "€",
      "id": "1003622708598d5859c440be417631e9",
      "position": {
        "file": "./ok/simple-tjm/rules.publicodes",
        "start": { "index": 0, "line": 1, "column": 1 },
        "end": { "index": 7, "line": 1, "column": 8 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "€",
        "id": "1003622708598d5859c440be417631e9",
        "position": {
          "file": "./ok/simple-tjm/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 7, "line": 1, "column": 8 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "not_applicable_if",
          "type": "number",
          "unit": "€",
          "id": "05db36e95399f3522d24c9eabb755b2a",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 11, "line": 2, "column": 3 },
            "end": { "index": 28, "line": 2, "column": 20 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "f0fada48f401ed8555fe889afca81cb5",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 30, "line": 2, "column": 22 },
                "end": { "index": 47, "line": 2, "column": 39 }
              },
              "parameters": {
                "kind": "ref",
                "type": "boolean",
                "parameters": "auto-entrepreneur",
                "id": "f0fada48f401ed8555fe889afca81cb5",
                "position": {
                  "file": "./ok/simple-tjm/rules.publicodes",
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
          "id": "92ceffc24d1a2eb50e63e33790e09278",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 50, "line": 3, "column": 3 },
            "end": { "index": 60, "line": 3, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "value",
              "type": "unknown",
              "id": "5d18fad863b210918658500fb78fc322",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 66, "line": 4, "column": 5 },
                "end": { "index": 72, "line": 4, "column": 11 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "6f3f3cf95365d3b5169b83ecda09ec2e",
                  "position": {
                    "file": "./ok/simple-tjm/rules.publicodes",
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
                          "kind": "number",
                          "value": 10.0,
                          "unit": "%"
                        },
                        "id": "5a69f0412dbe1b6ea41eb0b85f95e2e2",
                        "position": {
                          "file": "./ok/simple-tjm/rules.publicodes",
                          "start": { "index": 74, "line": 4, "column": 13 },
                          "end": { "index": 77, "line": 4, "column": 16 }
                        }
                      },
                      "right": {
                        "kind": "ref",
                        "type": "number",
                        "unit": "€",
                        "parameters": "chiffre d'affaires",
                        "id": "2d823e73cfeebbbaab0110c3716112fe",
                        "position": {
                          "file": "./ok/simple-tjm/rules.publicodes",
                          "start": { "index": 80, "line": 4, "column": 19 },
                          "end": { "index": 98, "line": 4, "column": 37 }
                        }
                      }
                    },
                    "id": "6f3f3cf95365d3b5169b83ecda09ec2e",
                    "position": {
                      "file": "./ok/simple-tjm/rules.publicodes",
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
                "id": "8b840fb90808f5ac17078ebc7eff8828",
                "position": {
                  "file": "./ok/simple-tjm/rules.publicodes",
                  "start": { "index": 103, "line": 5, "column": 5 },
                  "end": { "index": 111, "line": 5, "column": 13 }
                },
                "parameters": {
                  "value_mechanism": {
                    "kind": "expr",
                    "type": "number",
                    "unit": "€",
                    "id": "419f6cbff97865ad1727a4f0ee409a23",
                    "position": {
                      "file": "./ok/simple-tjm/rules.publicodes",
                      "start": { "index": 113, "line": 5, "column": 15 },
                      "end": { "index": 117, "line": 5, "column": 19 }
                    },
                    "parameters": {
                      "kind": "constant",
                      "type": "number",
                      "unit": "€",
                      "parameters": {
                        "kind": "number",
                        "value": 100.0,
                        "unit": "€"
                      },
                      "id": "419f6cbff97865ad1727a4f0ee409a23",
                      "position": {
                        "file": "./ok/simple-tjm/rules.publicodes",
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
      "id": "cf9f4b888549e433a041c1fdc207d930",
      "position": {
        "file": "./ok/simple-tjm/rules.publicodes",
        "start": { "index": 119, "line": 7, "column": 1 },
        "end": { "index": 136, "line": 7, "column": 18 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "boolean",
        "id": "cf9f4b888549e433a041c1fdc207d930",
        "position": {
          "file": "./ok/simple-tjm/rules.publicodes",
          "start": { "index": 119, "line": 7, "column": 1 },
          "end": { "index": 136, "line": 7, "column": 18 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "default",
          "type": "boolean",
          "id": "9788ef2bf83da78a7785e0aaa7810019",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 140, "line": 8, "column": 3 },
            "end": { "index": 150, "line": 8, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "f4cf7c38669cad052b87198e2f365607",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 152, "line": 8, "column": 15 },
                "end": { "index": 155, "line": 8, "column": 18 }
              },
              "parameters": {
                "kind": "constant",
                "type": "boolean",
                "parameters": { "kind": "bool", "value": false },
                "id": "f4cf7c38669cad052b87198e2f365607",
                "position": {
                  "file": "./ok/simple-tjm/rules.publicodes",
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
      "id": "405be3984122c18473445e06ce92013e",
      "position": {
        "file": "./ok/simple-tjm/rules.publicodes",
        "start": { "index": 157, "line": 10, "column": 1 },
        "end": { "index": 175, "line": 10, "column": 19 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "unknown",
        "id": "a13d235de5b1cabe3b49e6998ca8adfa",
        "position": {
          "file": "./ok/simple-tjm/rules.publicodes",
          "start": { "index": 179, "line": 11, "column": 3 },
          "end": { "index": 185, "line": 11, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "0647719c3836a1f7ebaf8096f92d83a3",
            "position": {
              "file": "./ok/simple-tjm/rules.publicodes",
              "start": { "index": 187, "line": 11, "column": 11 },
              "end": { "index": 189, "line": 11, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": { "kind": "number", "value": 10.0 },
              "id": "0647719c3836a1f7ebaf8096f92d83a3",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
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
          "type": "unknown",
          "id": "d77cfe9497d214be678dfca242584fae",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 192, "line": 12, "column": 3 },
            "end": { "index": 197, "line": 12, "column": 8 }
          },
          "parameters": { "value": "€" }
        }
      ]
    }
  }
