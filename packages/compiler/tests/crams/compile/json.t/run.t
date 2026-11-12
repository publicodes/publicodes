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
        "type": "number",
        "unit": "€",
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
            "id": "a18cf7e590c78413e65dfb6ae9e928ca",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 13, "line": 2, "column": 11 },
              "end": { "index": 19, "line": 2, "column": 15 }
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
              "id": "a18cf7e590c78413e65dfb6ae9e928ca",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 13, "line": 2, "column": 11 },
                "end": { "index": 19, "line": 2, "column": 15 }
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
      "id": "22078241674028bcb35f045fafe717ea",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 58, "line": 5, "column": 1 },
        "end": { "index": 59, "line": 5, "column": 2 }
      },
      "value_mechanism": {
        "kind": "sum",
        "type": "number",
        "unit": "€",
        "id": "c0c4cdc877834554a65e61addf88c853",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 63, "line": 6, "column": 3 },
          "end": { "index": 68, "line": 6, "column": 8 }
        },
        "parameters": [
          {
            "value_mechanism": {
              "kind": "value",
              "type": "number",
              "unit": "€",
              "id": "2bf5abfd9a7de09e410dd1e362f5c3ea",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 82, "line": 8, "column": 7 },
                "end": { "index": 88, "line": 8, "column": 13 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "1c443b276cabb88257180ee9cd0b5642",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 90, "line": 8, "column": 15 },
                    "end": { "index": 91, "line": 8, "column": 16 }
                  },
                  "parameters": {
                    "kind": "ref",
                    "type": "number",
                    "unit": "€",
                    "parameters": "a",
                    "id": "1c443b276cabb88257180ee9cd0b5642",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 90, "line": 8, "column": 15 },
                      "end": { "index": 91, "line": 8, "column": 16 }
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
                "id": "802bd1410979d2c1e97ded5ad78c90fe",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 98, "line": 9, "column": 7 },
                  "end": { "index": 106, "line": 9, "column": 15 }
                },
                "parameters": {
                  "a": {
                    "value_mechanism": {
                      "kind": "expr",
                      "type": "number",
                      "unit": "€",
                      "id": "1b2fc3cc04e9fb3d2f24c3e041798c73",
                      "position": {
                        "file": "./ok/example/rules.publicodes",
                        "start": { "index": 119, "line": 10, "column": 12 },
                        "end": { "index": 121, "line": 10, "column": 14 }
                      },
                      "parameters": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 30.0 },
                        "id": "1b2fc3cc04e9fb3d2f24c3e041798c73",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 119, "line": 10, "column": 12 },
                          "end": { "index": 121, "line": 10, "column": 14 }
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
              "id": "898baf16a21d3aefda1ef7d927f672f7",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 128, "line": 11, "column": 7 },
                "end": { "index": 129, "line": 11, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": "a",
                "id": "898baf16a21d3aefda1ef7d927f672f7",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 128, "line": 11, "column": 7 },
                  "end": { "index": 129, "line": 11, "column": 8 }
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
              "id": "ce354e2ebc3316ddf0f3fe93e7534889",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 136, "line": 12, "column": 7 },
                "end": { "index": 137, "line": 12, "column": 8 }
              },
              "parameters": {
                "kind": "ref",
                "type": "number",
                "unit": "€",
                "parameters": "b . c",
                "id": "ce354e2ebc3316ddf0f3fe93e7534889",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 136, "line": 12, "column": 7 },
                  "end": { "index": 137, "line": 12, "column": 8 }
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
      "id": "9ec17dc12980bc85a70e5fa3b5e10c0b",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 150, "line": 14, "column": 5 },
        "end": { "index": 151, "line": 14, "column": 6 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "c509141f6339e0a3b4060cb0b6988408",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 153, "line": 14, "column": 8 },
          "end": { "index": 155, "line": 14, "column": 10 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "const_number", "value": 55.0 },
          "id": "c509141f6339e0a3b4060cb0b6988408",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 153, "line": 14, "column": 8 },
            "end": { "index": 155, "line": 14, "column": 10 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "d": {
      "type": "number",
      "unit": "€",
      "id": "e3f518c24a08ca8703758f973b0447dd",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 156, "line": 15, "column": 1 },
        "end": { "index": 157, "line": 15, "column": 2 }
      },
      "value_mechanism": {
        "kind": "variations",
        "type": "enum",
        "id": "6f0ff61623dd67a941e66e1906adda8d",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 176, "line": 17, "column": 3 },
          "end": { "index": 186, "line": 17, "column": 13 }
        },
        "parameters": {
          "conditions": [
            {
              "if": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "boolean",
                  "id": "c3e6f5a8a57d6e1b35ae5e9cd7ee37df",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 198, "line": 18, "column": 11 },
                    "end": { "index": 204, "line": 18, "column": 17 }
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
                        "id": "3481742e4dbbdc3d8590f5c4a5173a6e",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 198, "line": 18, "column": 11 },
                          "end": { "index": 199, "line": 18, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 20.0 },
                        "id": "749c97b4ae3e8bcc036f1baad596d5be",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 202, "line": 18, "column": 15 },
                          "end": { "index": 204, "line": 18, "column": 17 }
                        }
                      }
                    },
                    "id": "c3e6f5a8a57d6e1b35ae5e9cd7ee37df",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 198, "line": 18, "column": 11 },
                      "end": { "index": 204, "line": 18, "column": 17 }
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
                  "id": "761f16fbe7c346c719db77dcb443f4ca",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 218, "line": 19, "column": 14 },
                    "end": { "index": 224, "line": 19, "column": 18 }
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
                    "id": "761f16fbe7c346c719db77dcb443f4ca",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 218, "line": 19, "column": 14 },
                      "end": { "index": 224, "line": 19, "column": 18 }
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
                  "id": "ede5805b7f1b5c5c9c64871032716ace",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 235, "line": 20, "column": 11 },
                    "end": { "index": 240, "line": 20, "column": 16 }
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
                        "id": "b1c7f891f8b6eacc37f74a04d1ee6436",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 235, "line": 20, "column": 11 },
                          "end": { "index": 236, "line": 20, "column": 12 }
                        }
                      },
                      "right": {
                        "kind": "constant",
                        "type": "number",
                        "unit": "€",
                        "parameters": { "kind": "const_number", "value": 5.0 },
                        "id": "56666f1009c4ea7aa5abd8fc4603d73c",
                        "position": {
                          "file": "./ok/example/rules.publicodes",
                          "start": { "index": 239, "line": 20, "column": 15 },
                          "end": { "index": 240, "line": 20, "column": 16 }
                        }
                      }
                    },
                    "id": "ede5805b7f1b5c5c9c64871032716ace",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 235, "line": 20, "column": 11 },
                      "end": { "index": 240, "line": 20, "column": 16 }
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
                  "id": "cda3dfdccc13db89264e3a078fa84282",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 254, "line": 21, "column": 14 },
                    "end": { "index": 259, "line": 21, "column": 17 }
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
                    "id": "cda3dfdccc13db89264e3a078fa84282",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 254, "line": 21, "column": 14 },
                      "end": { "index": 259, "line": 21, "column": 17 }
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
              "id": "3fd53ea504e5be7693eea9f69702f1c6",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 273, "line": 22, "column": 14 },
                "end": { "index": 274, "line": 22, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "€",
                "parameters": { "kind": "const_number", "value": 0.0 },
                "id": "3fd53ea504e5be7693eea9f69702f1c6",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 273, "line": 22, "column": 14 },
                  "end": { "index": 274, "line": 22, "column": 15 }
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
          "id": "9360a03a77ac70a252def41d45b04ae4",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 161, "line": 16, "column": 3 },
            "end": { "index": 165, "line": 16, "column": 7 }
          },
          "parameters": { "type": "number" }
        }
      ]
    },
    "e": {
      "type": "number",
      "unit": "€",
      "id": "ad4605f71e799e41694366138a720849",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 275, "line": 23, "column": 1 },
        "end": { "index": 276, "line": 23, "column": 2 }
      },
      "public": true,
      "meta": { "une meta": "23", "une autre meta": "42" },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "024cfe95812aabe662ac8a7ee6189805",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 342, "line": 28, "column": 3 },
          "end": { "index": 348, "line": 28, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "686aeea015437466089f89653e4d5739",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 350, "line": 28, "column": 11 },
              "end": { "index": 355, "line": 28, "column": 16 }
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
                  "id": "95e720ac59c94859927691c47f11a38d",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 350, "line": 28, "column": 11 },
                    "end": { "index": 351, "line": 28, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": "b",
                  "id": "1048d1aec6b336b502a92138efd8f782",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 354, "line": 28, "column": 15 },
                    "end": { "index": 355, "line": 28, "column": 16 }
                  }
                }
              },
              "id": "686aeea015437466089f89653e4d5739",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 350, "line": 28, "column": 11 },
                "end": { "index": 355, "line": 28, "column": 16 }
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
      "id": "1feefdb391d0c7a43266402f8e973e08",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 356, "line": 29, "column": 1 },
        "end": { "index": 357, "line": 29, "column": 2 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "b2d574579b050cf046c21493dc41384b",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 359, "line": 29, "column": 4 },
          "end": { "index": 361, "line": 29, "column": 6 }
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
            "id": "0ecfa8eb4321fef43cad35cdfb36bb26",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 360, "line": 29, "column": 5 },
              "end": { "index": 361, "line": 29, "column": 6 }
            }
          },
          "id": "b2d574579b050cf046c21493dc41384b",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 359, "line": 29, "column": 4 },
            "end": { "index": 361, "line": 29, "column": 6 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "g": {
      "type": "number",
      "unit": "€",
      "id": "44f274f0d15f4ed4ce0063d2b6bbfb97",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 362, "line": 30, "column": 1 },
        "end": { "index": 363, "line": 30, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "51d4b3f16daa83818075c25d07e15242",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 367, "line": 31, "column": 3 },
          "end": { "index": 373, "line": 31, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "7316fc0a4c1dc331ebd67f2677a2896f",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 375, "line": 31, "column": 11 },
              "end": { "index": 383, "line": 31, "column": 19 }
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
                  "id": "a5777d38f478ac723ab76637d6f39c56",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 375, "line": 31, "column": 11 },
                    "end": { "index": 376, "line": 31, "column": 12 }
                  }
                },
                "right": {
                  "kind": "ref",
                  "type": "number",
                  "unit": "€",
                  "parameters": "g . here",
                  "id": "9610db847f41d618179368900b09bca4",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 379, "line": 31, "column": 15 },
                    "end": { "index": 383, "line": 31, "column": 19 }
                  }
                }
              },
              "id": "7316fc0a4c1dc331ebd67f2677a2896f",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 375, "line": 31, "column": 11 },
                "end": { "index": 383, "line": 31, "column": 19 }
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
          "id": "8c3c8b4d558d15922cd4a396357d7b6e",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 406, "line": 34, "column": 3 },
            "end": { "index": 414, "line": 34, "column": 11 }
          },
          "parameters": {
            "a": {
              "value_mechanism": {
                "kind": "expr",
                "type": "number",
                "unit": "€",
                "id": "916418821b90d02a6e29ca3f424ebad6",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 423, "line": 35, "column": 8 },
                  "end": { "index": 424, "line": 35, "column": 9 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 2.0 },
                  "id": "916418821b90d02a6e29ca3f424ebad6",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 423, "line": 35, "column": 8 },
                    "end": { "index": 424, "line": 35, "column": 9 }
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
                "id": "6d67754d75c43aefba968900939f2033",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 436, "line": 36, "column": 12 },
                  "end": { "index": 437, "line": 36, "column": 13 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 3.0 },
                  "id": "6d67754d75c43aefba968900939f2033",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 436, "line": 36, "column": 12 },
                    "end": { "index": 437, "line": 36, "column": 13 }
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
                "id": "8320f40a1388b8343956ae32c98e2352",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 448, "line": 37, "column": 11 },
                  "end": { "index": 449, "line": 37, "column": 12 }
                },
                "parameters": {
                  "kind": "constant",
                  "type": "number",
                  "unit": "€",
                  "parameters": { "kind": "const_number", "value": 9.0 },
                  "id": "8320f40a1388b8343956ae32c98e2352",
                  "position": {
                    "file": "./ok/example/rules.publicodes",
                    "start": { "index": 448, "line": 37, "column": 11 },
                    "end": { "index": 449, "line": 37, "column": 12 }
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
      "id": "44f395d2a6ffdd9da9e3be772444f728",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 396, "line": 33, "column": 5 },
        "end": { "index": 400, "line": 33, "column": 9 }
      },
      "value_mechanism": {
        "kind": "expr",
        "type": "number",
        "unit": "€",
        "id": "2c570ebf604acc58df6a3dcb6caa2be3",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 402, "line": 33, "column": 11 },
          "end": { "index": 403, "line": 33, "column": 12 }
        },
        "parameters": {
          "kind": "constant",
          "type": "number",
          "unit": "€",
          "parameters": { "kind": "const_number", "value": 5.0 },
          "id": "2c570ebf604acc58df6a3dcb6caa2be3",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 402, "line": 33, "column": 11 },
            "end": { "index": 403, "line": 33, "column": 12 }
          }
        }
      },
      "chained_mechanisms": []
    },
    "h": {
      "type": "number",
      "unit": "aucune",
      "id": "c91312fdff07d86d911f9b39f39a43fc",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 450, "line": 38, "column": 1 },
        "end": { "index": 451, "line": 38, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "f3186eec2500bf488ed6a96384bffefc",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 455, "line": 39, "column": 3 },
          "end": { "index": 461, "line": 39, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "7782750b5516adb49750e8c5237a6df5",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 463, "line": 39, "column": 11 },
              "end": { "index": 465, "line": 39, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 30.0 },
              "id": "7782750b5516adb49750e8c5237a6df5",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 463, "line": 39, "column": 11 },
                "end": { "index": 465, "line": 39, "column": 13 }
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
          "id": "446e1ee063b5e8002f64b6fcc2d45042",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 468, "line": 40, "column": 3 },
            "end": { "index": 481, "line": 40, "column": 16 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "3347f6b9138b7b4160d037a7c398db84",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 483, "line": 40, "column": 18 },
                "end": { "index": 489, "line": 40, "column": 24 }
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
                    "id": "cb515232f8fc23e3c1e7ad31d214afeb",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 483, "line": 40, "column": 18 },
                      "end": { "index": 484, "line": 40, "column": 19 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "const_number", "value": 20.0 },
                    "id": "cb80b4f1b44346aa6fe35c58f8cb9f04",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 487, "line": 40, "column": 22 },
                      "end": { "index": 489, "line": 40, "column": 24 }
                    }
                  }
                },
                "id": "3347f6b9138b7b4160d037a7c398db84",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 483, "line": 40, "column": 18 },
                  "end": { "index": 489, "line": 40, "column": 24 }
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
      "id": "57450ce273f2d82c64b7216893a4d0f7",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 490, "line": 41, "column": 1 },
        "end": { "index": 491, "line": 41, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "8d16080f67f9a10d9d03e0a89382b945",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 495, "line": 42, "column": 3 },
          "end": { "index": 501, "line": 42, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "4699f19d3a1f85e967624a7f2b383c54",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 503, "line": 42, "column": 11 },
              "end": { "index": 505, "line": 42, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 30.0 },
              "id": "4699f19d3a1f85e967624a7f2b383c54",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 503, "line": 42, "column": 11 },
                "end": { "index": 505, "line": 42, "column": 13 }
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
          "id": "a5138aafdea076fb3d14b4316ea96eb8",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 508, "line": 43, "column": 3 },
            "end": { "index": 525, "line": 43, "column": 20 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "00e966a87dbcef9d52bae6fdbdb88338",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 527, "line": 43, "column": 22 },
                "end": { "index": 533, "line": 43, "column": 28 }
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
                    "id": "52161086dfec40532bc3118b182a80f7",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 527, "line": 43, "column": 22 },
                      "end": { "index": 528, "line": 43, "column": 23 }
                    }
                  },
                  "right": {
                    "kind": "constant",
                    "type": "number",
                    "unit": "€",
                    "parameters": { "kind": "const_number", "value": 20.0 },
                    "id": "5cbc018ca7d0cd2838ab94c73fd6f35f",
                    "position": {
                      "file": "./ok/example/rules.publicodes",
                      "start": { "index": 531, "line": 43, "column": 26 },
                      "end": { "index": 533, "line": 43, "column": 28 }
                    }
                  }
                },
                "id": "00e966a87dbcef9d52bae6fdbdb88338",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 527, "line": 43, "column": 22 },
                  "end": { "index": 533, "line": 43, "column": 28 }
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
      "id": "590b645fb117d9492b02ed41f33c4e45",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 534, "line": 44, "column": 1 },
        "end": { "index": 535, "line": 44, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "590b645fb117d9492b02ed41f33c4e45",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 534, "line": 44, "column": 1 },
          "end": { "index": 535, "line": 44, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "type_def",
          "type": "number",
          "unit": "aucune",
          "id": "ed8a52cd040397d694572dc1ae0da418",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 539, "line": 45, "column": 3 },
            "end": { "index": 543, "line": 45, "column": 7 }
          },
          "parameters": { "type": "number" }
        },
        {
          "kind": "default",
          "type": "number",
          "unit": "aucune",
          "id": "a65f76da9db701f7e7eeb77b1c0e5857",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 554, "line": 46, "column": 3 },
            "end": { "index": 565, "line": 46, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "92a673637b1005ccad824d4e532f63d7",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 567, "line": 46, "column": 15 },
                "end": { "index": 569, "line": 46, "column": 17 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 20.0 },
                "id": "92a673637b1005ccad824d4e532f63d7",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 567, "line": 46, "column": 15 },
                  "end": { "index": 569, "line": 46, "column": 17 }
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
      "id": "06baddbd570d3603a3ec865c0e899d13",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 570, "line": 47, "column": 1 },
        "end": { "index": 571, "line": 47, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "755b5616e24e7b3e1b7325ce501d3940",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 575, "line": 48, "column": 3 },
          "end": { "index": 581, "line": 48, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "2833261da6b87a180da6ed281fac0200",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 583, "line": 48, "column": 11 },
              "end": { "index": 584, "line": 48, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 4.0 },
              "id": "2833261da6b87a180da6ed281fac0200",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 583, "line": 48, "column": 11 },
                "end": { "index": 584, "line": 48, "column": 12 }
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
          "id": "a6d602a228dee2d66663aded6fcece76",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 587, "line": 49, "column": 3 },
            "end": { "index": 594, "line": 49, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "07f53217e7530bc159b8cf8a60dcf932",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 596, "line": 49, "column": 12 },
                "end": { "index": 599, "line": 49, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "07f53217e7530bc159b8cf8a60dcf932",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 596, "line": 49, "column": 12 },
                  "end": { "index": 599, "line": 49, "column": 15 }
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
      "id": "d6f5409760cd6bf820ff8a472d04359c",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 600, "line": 50, "column": 1 },
        "end": { "index": 601, "line": 50, "column": 2 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "aucune",
        "id": "71c425cd8c013e9d7feebb3341481cb9",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 605, "line": 51, "column": 3 },
          "end": { "index": 611, "line": 51, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "aucune",
            "id": "27ee97c4fa34ccd263c1ef6c7bdf3b63",
            "position": {
              "file": "./ok/example/rules.publicodes",
              "start": { "index": 613, "line": 51, "column": 11 },
              "end": { "index": 614, "line": 51, "column": 12 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "aucune",
              "parameters": { "kind": "const_number", "value": 2.0 },
              "id": "27ee97c4fa34ccd263c1ef6c7bdf3b63",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 613, "line": 51, "column": 11 },
                "end": { "index": 614, "line": 51, "column": 12 }
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
          "id": "0b432ee5aa74782133f4f6d72fc58abd",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 617, "line": 52, "column": 3 },
            "end": { "index": 625, "line": 52, "column": 11 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "8cd345ce6d6dc9fb5493e979b7624b26",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 627, "line": 52, "column": 13 },
                "end": { "index": 628, "line": 52, "column": 14 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 3.0 },
                "id": "8cd345ce6d6dc9fb5493e979b7624b26",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 627, "line": 52, "column": 13 },
                  "end": { "index": 628, "line": 52, "column": 14 }
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
      "id": "8e860156af6a4c6f3cac4eedc7b84b27",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 629, "line": 53, "column": 1 },
        "end": { "index": 630, "line": 53, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "8e860156af6a4c6f3cac4eedc7b84b27",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 629, "line": 53, "column": 1 },
          "end": { "index": 630, "line": 53, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_nearest",
          "type": "number",
          "unit": "aucune",
          "id": "234f2382079c6be448162ec158375cd2",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 634, "line": 54, "column": 3 },
            "end": { "index": 641, "line": 54, "column": 10 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "6cdfddaebef29803eb20c1ba29eacbde",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 643, "line": 54, "column": 12 },
                "end": { "index": 646, "line": 54, "column": 15 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "6cdfddaebef29803eb20c1ba29eacbde",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 643, "line": 54, "column": 12 },
                  "end": { "index": 646, "line": 54, "column": 15 }
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
      "id": "e96c58bee3538ae4b2f56aa431de06e3",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 647, "line": 55, "column": 1 },
        "end": { "index": 648, "line": 55, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "e96c58bee3538ae4b2f56aa431de06e3",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 647, "line": 55, "column": 1 },
          "end": { "index": 648, "line": 55, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_down",
          "type": "number",
          "unit": "aucune",
          "id": "8cb4974b5d90b85a51943c6e3a15befa",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 652, "line": 56, "column": 3 },
            "end": { "index": 675, "line": 56, "column": 24 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "9a92bfeb325fa267e787b0521957392e",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 677, "line": 56, "column": 26 },
                "end": { "index": 680, "line": 56, "column": 29 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "9a92bfeb325fa267e787b0521957392e",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 677, "line": 56, "column": 26 },
                  "end": { "index": 680, "line": 56, "column": 29 }
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
      "id": "c52ad9fc7653c5d471374421be05cd70",
      "position": {
        "file": "./ok/example/rules.publicodes",
        "start": { "index": 681, "line": 57, "column": 1 },
        "end": { "index": 682, "line": 57, "column": 2 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "number",
        "unit": "aucune",
        "id": "c52ad9fc7653c5d471374421be05cd70",
        "position": {
          "file": "./ok/example/rules.publicodes",
          "start": { "index": 681, "line": 57, "column": 1 },
          "end": { "index": 682, "line": 57, "column": 2 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "round_up",
          "type": "number",
          "unit": "aucune",
          "id": "bda2a200e10ff7243780a94a0429892a",
          "position": {
            "file": "./ok/example/rules.publicodes",
            "start": { "index": 686, "line": 58, "column": 3 },
            "end": { "index": 707, "line": 58, "column": 23 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "number",
              "unit": "aucune",
              "id": "b8dff70665755c433ddc829af9c09192",
              "position": {
                "file": "./ok/example/rules.publicodes",
                "start": { "index": 709, "line": 58, "column": 25 },
                "end": { "index": 712, "line": 58, "column": 28 }
              },
              "parameters": {
                "kind": "constant",
                "type": "number",
                "unit": "aucune",
                "parameters": { "kind": "const_number", "value": 2.3 },
                "id": "b8dff70665755c433ddc829af9c09192",
                "position": {
                  "file": "./ok/example/rules.publicodes",
                  "start": { "index": 709, "line": 58, "column": 25 },
                  "end": { "index": 712, "line": 58, "column": 28 }
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
    return /** @type {10.000000} */ (
      $ret("a18cf7e590c78413e65dfb6ae9e928ca", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("c0c4cdc877834554a65e61addf88c853", ctx, $add(
        $ret("c0c4cdc877834554a65e61addf88c853", ctx, $add(
          $ret("802bd1410979d2c1e97ded5ad78c90fe", ctx, ((ctx) => $ret("1c443b276cabb88257180ee9cd0b5642", ctx, $ref("a", _a, ctx, params)))(
          			{
          				...ctx,
          				_context_stack: ctx._context_stack + "-802bd1410979d2c1e97ded5ad78c90fe",
          					"a": $ret("1b2fc3cc04e9fb3d2f24c3e041798c73", ctx, 30.),
          			}
          		)),
          $ret("898baf16a21d3aefda1ef7d927f672f7", ctx, $ref("a", _a, ctx, params)))),
        $ret("ce354e2ebc3316ddf0f3fe93e7534889", ctx, $ref("b . c", _b_·_c, ctx, params))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {55.000000} */ (
      $ret("c509141f6339e0a3b4060cb0b6988408", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, $cond(
        $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, $eq(
          $ret("c3e6f5a8a57d6e1b35ae5e9cd7ee37df", ctx, $gt(
            $ret("3481742e4dbbdc3d8590f5c4a5173a6e", ctx, $ref("a", _a, ctx, params)),
            () => $ret("749c97b4ae3e8bcc036f1baad596d5be", ctx, 20.))),
          $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, true))), () => $ret("761f16fbe7c346c719db77dcb443f4ca", ctx, 20.), () => $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, $cond(
          $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, $eq(
            $ret("ede5805b7f1b5c5c9c64871032716ace", ctx, $gt(
              $ret("b1c7f891f8b6eacc37f74a04d1ee6436", ctx, $ref("a", _a, ctx, params)),
              () => $ret("56666f1009c4ea7aa5abd8fc4603d73c", ctx, 5.))),
            $ret("6f0ff61623dd67a941e66e1906adda8d", ctx, true))), () => $ret("cda3dfdccc13db89264e3a078fa84282", ctx, 5.), () => $ret("3fd53ea504e5be7693eea9f69702f1c6", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("686aeea015437466089f89653e4d5739", ctx, $add(
        $ret("95e720ac59c94859927691c47f11a38d", ctx, $ref("a", _a, ctx, params)),
        $ret("1048d1aec6b336b502a92138efd8f782", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("b2d574579b050cf046c21493dc41384b", ctx, $neg($ret("0ecfa8eb4321fef43cad35cdfb36bb26", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("8c3c8b4d558d15922cd4a396357d7b6e", ctx, ((ctx) => $ret("7316fc0a4c1dc331ebd67f2677a2896f", ctx, $add(
        $ret("a5777d38f478ac723ab76637d6f39c56", ctx, $ref("b", _b, ctx, params)),
        $ret("9610db847f41d618179368900b09bca4", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      				_context_stack: ctx._context_stack + "-8c3c8b4d558d15922cd4a396357d7b6e",
      					"a": $ret("916418821b90d02a6e29ca3f424ebad6", ctx, 2.),
      					"b . c": $ret("6d67754d75c43aefba968900939f2033", ctx, 3.),
      					"g . here": $ret("8320f40a1388b8343956ae32c98e2352", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {5.000000} */ (
      $ret("2c570ebf604acc58df6a3dcb6caa2be3", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {30.000000} */ (
      $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, $cond(
        $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, $or(
          $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, (isNotDefined($ret("3347f6b9138b7b4160d037a7c398db84", ctx, $gt(
            $ret("cb515232f8fc23e3c1e7ad31d214afeb", ctx, $ref("g", _g, ctx, params)),
            () => $ret("cb80b4f1b44346aa6fe35c58f8cb9f04", ctx, 20.)))))),
          () => $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, $or(
            $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, $eq(
              $ret("3347f6b9138b7b4160d037a7c398db84", ctx, $gt(
                $ret("cb515232f8fc23e3c1e7ad31d214afeb", ctx, $ref("g", _g, ctx, params)),
                () => $ret("cb80b4f1b44346aa6fe35c58f8cb9f04", ctx, 20.))),
              $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, false))),
            () => $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, $eq(
              $ret("3347f6b9138b7b4160d037a7c398db84", ctx, $gt(
                $ret("cb515232f8fc23e3c1e7ad31d214afeb", ctx, $ref("g", _g, ctx, params)),
                () => $ret("cb80b4f1b44346aa6fe35c58f8cb9f04", ctx, 20.))),
              $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, NotApplicable))))))), () => $ret("446e1ee063b5e8002f64b6fcc2d45042", ctx, NotApplicable), () => $ret("7782750b5516adb49750e8c5237a6df5", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {30.000000} */ (
      $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, $cond(
        $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, $or(
          $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, (isNotDefined($ret("00e966a87dbcef9d52bae6fdbdb88338", ctx, $gt(
            $ret("52161086dfec40532bc3118b182a80f7", ctx, $ref("g", _g, ctx, params)),
            () => $ret("5cbc018ca7d0cd2838ab94c73fd6f35f", ctx, 20.)))))),
          () => $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, $or(
            $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, $eq(
              $ret("00e966a87dbcef9d52bae6fdbdb88338", ctx, $gt(
                $ret("52161086dfec40532bc3118b182a80f7", ctx, $ref("g", _g, ctx, params)),
                () => $ret("5cbc018ca7d0cd2838ab94c73fd6f35f", ctx, 20.))),
              $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, false))),
            () => $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, $eq(
              $ret("00e966a87dbcef9d52bae6fdbdb88338", ctx, $gt(
                $ret("52161086dfec40532bc3118b182a80f7", ctx, $ref("g", _g, ctx, params)),
                () => $ret("5cbc018ca7d0cd2838ab94c73fd6f35f", ctx, 20.))),
              $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, NotApplicable))))))), () => $ret("4699f19d3a1f85e967624a7f2b383c54", ctx, 30.), () => $ret("a5138aafdea076fb3d14b4316ea96eb8", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("a65f76da9db701f7e7eeb77b1c0e5857", ctx, $cond(
        $ret("a65f76da9db701f7e7eeb77b1c0e5857", ctx, (isNotDefined($ret("590b645fb117d9492b02ed41f33c4e45", ctx, $get("j", ctx, params))))), () => $ret("92a673637b1005ccad824d4e532f63d7", ctx, 20.), () => $ret("590b645fb117d9492b02ed41f33c4e45", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {2.300000} */ (
      $ret("a6d602a228dee2d66663aded6fcece76", ctx, $cond(
        $ret("a6d602a228dee2d66663aded6fcece76", ctx, $and(
          $ret("a6d602a228dee2d66663aded6fcece76", ctx, $neq(
            $ret("07f53217e7530bc159b8cf8a60dcf932", ctx, 2.3),
            $ret("a6d602a228dee2d66663aded6fcece76", ctx, NotApplicable))),
          () => $ret("a6d602a228dee2d66663aded6fcece76", ctx, $gt(
            $ret("2833261da6b87a180da6ed281fac0200", ctx, 4.),
            () => $ret("07f53217e7530bc159b8cf8a60dcf932", ctx, 2.3))))), () => $ret("07f53217e7530bc159b8cf8a60dcf932", ctx, 2.3), () => $ret("2833261da6b87a180da6ed281fac0200", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {3.000000} */ (
      $ret("0b432ee5aa74782133f4f6d72fc58abd", ctx, $cond(
        $ret("0b432ee5aa74782133f4f6d72fc58abd", ctx, $and(
          $ret("0b432ee5aa74782133f4f6d72fc58abd", ctx, $neq(
            $ret("8cd345ce6d6dc9fb5493e979b7624b26", ctx, 3.),
            $ret("0b432ee5aa74782133f4f6d72fc58abd", ctx, NotApplicable))),
          () => $ret("0b432ee5aa74782133f4f6d72fc58abd", ctx, $lt(
            $ret("27ee97c4fa34ccd263c1ef6c7bdf3b63", ctx, 2.),
            () => $ret("8cd345ce6d6dc9fb5493e979b7624b26", ctx, 3.))))), () => $ret("8cd345ce6d6dc9fb5493e979b7624b26", ctx, 3.), () => $ret("27ee97c4fa34ccd263c1ef6c7bdf3b63", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("234f2382079c6be448162ec158375cd2", ctx, $round("nearest", $ret("8e860156af6a4c6f3cac4eedc7b84b27", ctx, $get("m", ctx, params)), () => $ret("6cdfddaebef29803eb20c1ba29eacbde", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("8cb4974b5d90b85a51943c6e3a15befa", ctx, $round("down", $ret("e96c58bee3538ae4b2f56aa431de06e3", ctx, $get("n", ctx, params)), () => $ret("9a92bfeb325fa267e787b0521957392e", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("bda2a200e10ff7243780a94a0429892a", ctx, $round("up", $ret("c52ad9fc7653c5d471374421be05cd70", ctx, $get("o", ctx, params)), () => $ret("b8dff70665755c433ddc829af9c09192", ctx, 2.3)))
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
          "id": "ce7b405c3343012131c9806337d9e0e0",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 50, "line": 3, "column": 3 },
            "end": { "index": 61, "line": 3, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "value",
              "type": "number",
              "unit": "€",
              "id": "79ff5584fb2e4c63d6929019dd72d4ab",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 67, "line": 4, "column": 5 },
                "end": { "index": 73, "line": 4, "column": 11 }
              },
              "parameters": {
                "value_mechanism": {
                  "kind": "expr",
                  "type": "number",
                  "unit": "€",
                  "id": "edfa380a24e90a26e18f90e6a756641b",
                  "position": {
                    "file": "./ok/simple-tjm/rules.publicodes",
                    "start": { "index": 75, "line": 4, "column": 13 },
                    "end": { "index": 99, "line": 4, "column": 37 }
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
                        "id": "24ceebf6913303e89f68300381326ad6",
                        "position": {
                          "file": "./ok/simple-tjm/rules.publicodes",
                          "start": { "index": 75, "line": 4, "column": 13 },
                          "end": { "index": 78, "line": 4, "column": 16 }
                        }
                      },
                      "right": {
                        "kind": "ref",
                        "type": "number",
                        "unit": "€",
                        "parameters": "chiffre d'affaires",
                        "id": "f948eaff3259251e4df6f138eda69e35",
                        "position": {
                          "file": "./ok/simple-tjm/rules.publicodes",
                          "start": { "index": 81, "line": 4, "column": 19 },
                          "end": { "index": 99, "line": 4, "column": 37 }
                        }
                      }
                    },
                    "id": "edfa380a24e90a26e18f90e6a756641b",
                    "position": {
                      "file": "./ok/simple-tjm/rules.publicodes",
                      "start": { "index": 75, "line": 4, "column": 13 },
                      "end": { "index": 99, "line": 4, "column": 37 }
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
                "id": "04b52039b4f410af4c80261f0be4b7e0",
                "position": {
                  "file": "./ok/simple-tjm/rules.publicodes",
                  "start": { "index": 104, "line": 5, "column": 5 },
                  "end": { "index": 112, "line": 5, "column": 13 }
                },
                "parameters": {
                  "value_mechanism": {
                    "kind": "expr",
                    "type": "number",
                    "unit": "€",
                    "id": "b0573dc2d89da20b9c71ced7200f0d4d",
                    "position": {
                      "file": "./ok/simple-tjm/rules.publicodes",
                      "start": { "index": 114, "line": 5, "column": 15 },
                      "end": { "index": 120, "line": 5, "column": 19 }
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
                      "id": "b0573dc2d89da20b9c71ced7200f0d4d",
                      "position": {
                        "file": "./ok/simple-tjm/rules.publicodes",
                        "start": { "index": 114, "line": 5, "column": 15 },
                        "end": { "index": 120, "line": 5, "column": 19 }
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
      "id": "cd838794879991ddd4e6a3b82d513673",
      "position": {
        "file": "./ok/simple-tjm/rules.publicodes",
        "start": { "index": 122, "line": 7, "column": 1 },
        "end": { "index": 139, "line": 7, "column": 18 }
      },
      "value_mechanism": {
        "kind": "not_defined",
        "type": "boolean",
        "id": "cd838794879991ddd4e6a3b82d513673",
        "position": {
          "file": "./ok/simple-tjm/rules.publicodes",
          "start": { "index": 122, "line": 7, "column": 1 },
          "end": { "index": 139, "line": 7, "column": 18 }
        }
      },
      "chained_mechanisms": [
        {
          "kind": "default",
          "type": "boolean",
          "id": "aaec6d27255dd53b688a85baaf6f4a4f",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 143, "line": 8, "column": 3 },
            "end": { "index": 154, "line": 8, "column": 13 }
          },
          "parameters": {
            "value_mechanism": {
              "kind": "expr",
              "type": "boolean",
              "id": "b734f910a8280b7ead952c7b9b882d51",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 156, "line": 8, "column": 15 },
                "end": { "index": 159, "line": 8, "column": 18 }
              },
              "parameters": {
                "kind": "constant",
                "type": "boolean",
                "parameters": { "kind": "const_boolean", "value": false },
                "id": "b734f910a8280b7ead952c7b9b882d51",
                "position": {
                  "file": "./ok/simple-tjm/rules.publicodes",
                  "start": { "index": 156, "line": 8, "column": 15 },
                  "end": { "index": 159, "line": 8, "column": 18 }
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
      "id": "ce8648a9414199ba85f2f52a013e43d5",
      "position": {
        "file": "./ok/simple-tjm/rules.publicodes",
        "start": { "index": 161, "line": 10, "column": 1 },
        "end": { "index": 179, "line": 10, "column": 19 }
      },
      "value_mechanism": {
        "kind": "value",
        "type": "number",
        "unit": "€",
        "id": "3050b35aeb53f8aaaa4380c731eafad8",
        "position": {
          "file": "./ok/simple-tjm/rules.publicodes",
          "start": { "index": 183, "line": 11, "column": 3 },
          "end": { "index": 189, "line": 11, "column": 9 }
        },
        "parameters": {
          "value_mechanism": {
            "kind": "expr",
            "type": "number",
            "unit": "€",
            "id": "f9914206f46f530498659dae6dd2d0e6",
            "position": {
              "file": "./ok/simple-tjm/rules.publicodes",
              "start": { "index": 191, "line": 11, "column": 11 },
              "end": { "index": 193, "line": 11, "column": 13 }
            },
            "parameters": {
              "kind": "constant",
              "type": "number",
              "unit": "€",
              "parameters": { "kind": "const_number", "value": 10.0 },
              "id": "f9914206f46f530498659dae6dd2d0e6",
              "position": {
                "file": "./ok/simple-tjm/rules.publicodes",
                "start": { "index": 191, "line": 11, "column": 11 },
                "end": { "index": 193, "line": 11, "column": 13 }
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
          "id": "76c205abe7eaad9a8d6f9a7750ea03da",
          "position": {
            "file": "./ok/simple-tjm/rules.publicodes",
            "start": { "index": 196, "line": 12, "column": 3 },
            "end": { "index": 202, "line": 12, "column": 8 }
          },
          "parameters": { "type": "number", "unit": "€" }
        }
      ]
    }
  }
