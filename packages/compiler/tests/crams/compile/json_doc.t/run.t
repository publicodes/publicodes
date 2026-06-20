Valid json doc :

  $ publicodes compile ok -t json_doc -o -
  {
    "rules": [
      {
        "name": "a",
        "title": "A",
        "description": "la valeur A",
        "_publicodes": {
          "id": "671cf31f521a21768557a1d05df98a17",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 0, "line": 1, "column": 1 },
            "end": { "index": 1, "line": 1, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "b330e868a4ee75bdb9673f4b374368bf",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 5, "line": 2, "column": 3 },
              "end": { "index": 11, "line": 2, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "dfb3c6796b344957f44c2e7300f71dff",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 13, "line": 2, "column": 11 },
                  "end": { "index": 17, "line": 2, "column": 15 }
                }
              },
              "parameters": {
                "type": "constant",
                "parameters": {
                  "type": "number",
                  "parameters": { "value": 10.0, "unit": "€" }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "b",
        "_publicodes": {
          "id": "969799a0c994d65e939da3be780d0195",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 56, "line": 5, "column": 1 },
            "end": { "index": 57, "line": 5, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "sum",
          "_publicodes": {
            "id": "42af92aad66aef67de55ea117b04b7bb",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 61, "line": 6, "column": 3 },
              "end": { "index": 66, "line": 6, "column": 8 }
            }
          },
          "parameters": [
            {
              "value mecanism": {
                "type": "value",
                "_publicodes": {
                  "id": "53c2c6e359fd92fb12891eac38793e59",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 80, "line": 8, "column": 7 },
                    "end": { "index": 86, "line": 8, "column": 13 }
                  }
                },
                "parameters": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "22e546e7e75af96371f69ad2d8af2964",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 88, "line": 8, "column": 15 },
                        "end": { "index": 89, "line": 8, "column": 16 }
                      }
                    },
                    "parameters": { "type": "ref", "parameters": "a" }
                  },
                  "chainable mecanisms": []
                }
              },
              "chainable mecanisms": [
                {
                  "type": "context",
                  "_publicodes": {
                    "id": "cf6b772cd42698f02d7e852a34313551",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 96, "line": 9, "column": 7 },
                      "end": { "index": 104, "line": 9, "column": 15 }
                    }
                  },
                  "parameters": {
                    "a": {
                      "value mecanism": {
                        "type": "expr",
                        "_publicodes": {
                          "id": "df39a19cbe24fa860540eb7e75d9de92",
                          "position": {
                            "file": "ok/rules.publicodes",
                            "start": { "index": 117, "line": 10, "column": 12 },
                            "end": { "index": 119, "line": 10, "column": 14 }
                          }
                        },
                        "parameters": {
                          "type": "constant",
                          "parameters": {
                            "type": "number",
                            "parameters": { "value": 30.0 }
                          }
                        }
                      },
                      "chainable mecanisms": []
                    }
                  }
                }
              ]
            },
            {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "fdf43fcb0f9e59345833e87010cf2284",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 126, "line": 11, "column": 7 },
                    "end": { "index": 127, "line": 11, "column": 8 }
                  }
                },
                "parameters": { "type": "ref", "parameters": "a" }
              },
              "chainable mecanisms": []
            },
            {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "7645595219f544844a979bd48abe21fa",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 134, "line": 12, "column": 7 },
                    "end": { "index": 135, "line": 12, "column": 8 }
                  }
                },
                "parameters": { "type": "ref", "parameters": "b . c" }
              },
              "chainable mecanisms": []
            }
          ]
        },
        "chainable mecanisms": []
      },
      {
        "name": "b . c",
        "_publicodes": {
          "id": "8b1fd0195e4732d89a9d8bd2f82b63fd",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 148, "line": 14, "column": 5 },
            "end": { "index": 149, "line": 14, "column": 6 }
          }
        },
        "value mecanism": {
          "type": "expr",
          "_publicodes": {
            "id": "233d46a39aa61b1b99cbe5c01e0fbf81",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 151, "line": 14, "column": 8 },
              "end": { "index": 153, "line": 14, "column": 10 }
            }
          },
          "parameters": {
            "type": "constant",
            "parameters": { "type": "number", "parameters": { "value": 55.0 } }
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "d",
        "_publicodes": {
          "id": "52e8c013cde911a60cb1e1d0631c1efe",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 154, "line": 15, "column": 1 },
            "end": { "index": 155, "line": 15, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "variations",
          "_publicodes": {
            "id": "70e4c4a5aa0d531d504d903dd427cc22",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 174, "line": 17, "column": 3 },
              "end": { "index": 184, "line": 17, "column": 13 }
            }
          },
          "parameters": {
            "conditions": [
              {
                "if": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "f9ce896d4a9abd3d1b8dbb1c4e297fd7",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 196, "line": 18, "column": 11 },
                        "end": { "index": 202, "line": 18, "column": 17 }
                      }
                    },
                    "parameters": {
                      "type": "gt",
                      "parameters": {
                        "left": { "type": "ref", "parameters": "a" },
                        "right": {
                          "type": "constant",
                          "parameters": {
                            "type": "number",
                            "parameters": { "value": 20.0 }
                          }
                        }
                      }
                    }
                  },
                  "chainable mecanisms": []
                },
                "then": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "0d55b0bd7d204b083e38cceb31742fa5",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 216, "line": 19, "column": 14 },
                        "end": { "index": 220, "line": 19, "column": 18 }
                      }
                    },
                    "parameters": {
                      "type": "constant",
                      "parameters": {
                        "type": "number",
                        "parameters": { "value": 20.0, "unit": "€" }
                      }
                    }
                  },
                  "chainable mecanisms": []
                }
              },
              {
                "if": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "be354af8a0b9b89073d0231a78f2d54c",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 231, "line": 20, "column": 11 },
                        "end": { "index": 236, "line": 20, "column": 16 }
                      }
                    },
                    "parameters": {
                      "type": "gt",
                      "parameters": {
                        "left": { "type": "ref", "parameters": "a" },
                        "right": {
                          "type": "constant",
                          "parameters": {
                            "type": "number",
                            "parameters": { "value": 5.0 }
                          }
                        }
                      }
                    }
                  },
                  "chainable mecanisms": []
                },
                "then": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "4b9b7a91ed4c95bddf9dd12a2f9a10fd",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 250, "line": 21, "column": 14 },
                        "end": { "index": 253, "line": 21, "column": 17 }
                      }
                    },
                    "parameters": {
                      "type": "constant",
                      "parameters": {
                        "type": "number",
                        "parameters": { "value": 5.0, "unit": "€" }
                      }
                    }
                  },
                  "chainable mecanisms": []
                }
              }
            ],
            "else": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "2fcb42f66ae8d0ba5e6662c7776547fa",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 267, "line": 22, "column": 14 },
                    "end": { "index": 268, "line": 22, "column": 15 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 0.0 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        },
        "chainable mecanisms": [
          {
            "type": "type",
            "_publicodes": {
              "id": "43ea7b3cb3bb5028a0b16fbdd73b5741",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 159, "line": 16, "column": 3 },
                "end": { "index": 163, "line": 16, "column": 7 }
              }
            },
            "parameters": { "type": "number" }
          }
        ]
      },
      {
        "name": "e",
        "public": true,
        "meta": { "une meta": "23", "une autre meta": "42" },
        "_publicodes": {
          "id": "33974554be77431324881fd453cbbf50",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 269, "line": 23, "column": 1 },
            "end": { "index": 270, "line": 23, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "375265e5a5330ccb98ce30d1dd6d0ae7",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 336, "line": 28, "column": 3 },
              "end": { "index": 342, "line": 28, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "b98093565171af625aecadfe1fe747d8",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 344, "line": 28, "column": 11 },
                  "end": { "index": 349, "line": 28, "column": 16 }
                }
              },
              "parameters": {
                "type": "add",
                "parameters": {
                  "left": { "type": "ref", "parameters": "a" },
                  "right": { "type": "ref", "parameters": "b" }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "f",
        "_publicodes": {
          "id": "6e958ff2e0c6b6af8b7c8a916deceade",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 350, "line": 29, "column": 1 },
            "end": { "index": 351, "line": 29, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "expr",
          "_publicodes": {
            "id": "ba22056e27833dff59c87d75403e0c2d",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 353, "line": 29, "column": 4 },
              "end": { "index": 355, "line": 29, "column": 6 }
            }
          },
          "parameters": {
            "type": "neg",
            "parameters": { "type": "ref", "parameters": "e" }
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "g",
        "_publicodes": {
          "id": "9551bafb02d33f8ee5a742204baab0e2",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 356, "line": 30, "column": 1 },
            "end": { "index": 357, "line": 30, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "4718358da0921b79490f05cd21d138d0",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 361, "line": 31, "column": 3 },
              "end": { "index": 367, "line": 31, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "d261b92b31edeceb55cf0a21a1159419",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 369, "line": 31, "column": 11 },
                  "end": { "index": 377, "line": 31, "column": 19 }
                }
              },
              "parameters": {
                "type": "add",
                "parameters": {
                  "left": { "type": "ref", "parameters": "b" },
                  "right": { "type": "ref", "parameters": "g . here" }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": [
          {
            "type": "context",
            "_publicodes": {
              "id": "afafc1aab9936444e382cb08fc157307",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 400, "line": 34, "column": 3 },
                "end": { "index": 408, "line": 34, "column": 11 }
              }
            },
            "parameters": {
              "a": {
                "value mecanism": {
                  "type": "expr",
                  "_publicodes": {
                    "id": "210ae98ccf1b505aa542f2e38adc1e09",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 417, "line": 35, "column": 8 },
                      "end": { "index": 418, "line": 35, "column": 9 }
                    }
                  },
                  "parameters": {
                    "type": "constant",
                    "parameters": {
                      "type": "number",
                      "parameters": { "value": 2.0 }
                    }
                  }
                },
                "chainable mecanisms": []
              },
              "b . c": {
                "value mecanism": {
                  "type": "expr",
                  "_publicodes": {
                    "id": "529ed2f0d11cd3de1c855166b00ed38c",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 430, "line": 36, "column": 12 },
                      "end": { "index": 431, "line": 36, "column": 13 }
                    }
                  },
                  "parameters": {
                    "type": "constant",
                    "parameters": {
                      "type": "number",
                      "parameters": { "value": 3.0 }
                    }
                  }
                },
                "chainable mecanisms": []
              },
              "g . here": {
                "value mecanism": {
                  "type": "expr",
                  "_publicodes": {
                    "id": "f6fa180da1df794e59ee03a7fec72a98",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 442, "line": 37, "column": 11 },
                      "end": { "index": 443, "line": 37, "column": 12 }
                    }
                  },
                  "parameters": {
                    "type": "constant",
                    "parameters": {
                      "type": "number",
                      "parameters": { "value": 9.0 }
                    }
                  }
                },
                "chainable mecanisms": []
              }
            }
          }
        ]
      },
      {
        "name": "g . here",
        "_publicodes": {
          "id": "caf7ef889f1edc979789dd84d850b241",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 390, "line": 33, "column": 5 },
            "end": { "index": 394, "line": 33, "column": 9 }
          }
        },
        "value mecanism": {
          "type": "expr",
          "_publicodes": {
            "id": "96e452abcb8db5630752b6bc7c8adb61",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 396, "line": 33, "column": 11 },
              "end": { "index": 397, "line": 33, "column": 12 }
            }
          },
          "parameters": {
            "type": "constant",
            "parameters": { "type": "number", "parameters": { "value": 5.0 } }
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "h",
        "_publicodes": {
          "id": "ff8a9dba81b2dfcabf8b7107ba73c57f",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 444, "line": 38, "column": 1 },
            "end": { "index": 445, "line": 38, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "deca5743988cb4963ef1ecbd661bd179",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 449, "line": 39, "column": 3 },
              "end": { "index": 455, "line": 39, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "054ea3efdb5eadbd6a68952db6cce7f9",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 457, "line": 39, "column": 11 },
                  "end": { "index": 459, "line": 39, "column": 13 }
                }
              },
              "parameters": {
                "type": "constant",
                "parameters": {
                  "type": "number",
                  "parameters": { "value": 30.0 }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": [
          {
            "type": "applicable_if",
            "_publicodes": {
              "id": "04ff0686e92917b8722d8a3c065e58bd",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 462, "line": 40, "column": 3 },
                "end": { "index": 475, "line": 40, "column": 16 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "c5977727da2862f6fbc361dcbd49fbd7",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 477, "line": 40, "column": 18 },
                    "end": { "index": 483, "line": 40, "column": 24 }
                  }
                },
                "parameters": {
                  "type": "gt",
                  "parameters": {
                    "left": { "type": "ref", "parameters": "g" },
                    "right": {
                      "type": "constant",
                      "parameters": {
                        "type": "number",
                        "parameters": { "value": 20.0 }
                      }
                    }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "i",
        "_publicodes": {
          "id": "f9d4cec6e25a0e79506072bcccc6aa93",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 484, "line": 41, "column": 1 },
            "end": { "index": 485, "line": 41, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "d24d99cec040687675fac66e5c45707f",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 489, "line": 42, "column": 3 },
              "end": { "index": 495, "line": 42, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "2daf2319f6592f55b59a413213ae9c38",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 497, "line": 42, "column": 11 },
                  "end": { "index": 499, "line": 42, "column": 13 }
                }
              },
              "parameters": {
                "type": "constant",
                "parameters": {
                  "type": "number",
                  "parameters": { "value": 30.0 }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": [
          {
            "type": "not_applicable_if",
            "_publicodes": {
              "id": "1d4170a008fe7e9a5550e66144d9fbc1",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 502, "line": 43, "column": 3 },
                "end": { "index": 519, "line": 43, "column": 20 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "a5c8dd1f526a4d376bbfcd7cd54231c4",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 521, "line": 43, "column": 22 },
                    "end": { "index": 527, "line": 43, "column": 28 }
                  }
                },
                "parameters": {
                  "type": "gt",
                  "parameters": {
                    "left": { "type": "ref", "parameters": "g" },
                    "right": {
                      "type": "constant",
                      "parameters": {
                        "type": "number",
                        "parameters": { "value": 20.0 }
                      }
                    }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "j",
        "_publicodes": {
          "id": "4dd128f83551869d4cd97e1ac99b309b",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 528, "line": 44, "column": 1 },
            "end": { "index": 529, "line": 44, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "not_defined",
          "_publicodes": {
            "id": "4dd128f83551869d4cd97e1ac99b309b",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 528, "line": 44, "column": 1 },
              "end": { "index": 529, "line": 44, "column": 2 }
            }
          }
        },
        "chainable mecanisms": [
          {
            "type": "type",
            "_publicodes": {
              "id": "8d429db374150725a3f896b4de6637ba",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 533, "line": 45, "column": 3 },
                "end": { "index": 537, "line": 45, "column": 7 }
              }
            },
            "parameters": { "type": "number" }
          },
          {
            "type": "default",
            "_publicodes": {
              "id": "dd2468b224a417fc4bbf3374ee09dd34",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 548, "line": 46, "column": 3 },
                "end": { "index": 558, "line": 46, "column": 13 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "e9749d8c0d9f8ccbcaaae789a74ac4a5",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 560, "line": 46, "column": 15 },
                    "end": { "index": 562, "line": 46, "column": 17 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 20.0 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "k",
        "_publicodes": {
          "id": "6ce2999031aa6b9dc254713c2dd2bf6b",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 563, "line": 47, "column": 1 },
            "end": { "index": 564, "line": 47, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "d3a5646cd96122c13d28ce493dc5a3a2",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 568, "line": 48, "column": 3 },
              "end": { "index": 574, "line": 48, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "0ca5948ac06e266f5076c7a1a7611848",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 576, "line": 48, "column": 11 },
                  "end": { "index": 577, "line": 48, "column": 12 }
                }
              },
              "parameters": {
                "type": "constant",
                "parameters": {
                  "type": "number",
                  "parameters": { "value": 4.0 }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": [
          {
            "type": "ceiling",
            "_publicodes": {
              "id": "24d865e5b12c5b69db0cc0fe177cd3d1",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 580, "line": 49, "column": 3 },
                "end": { "index": 587, "line": 49, "column": 10 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "b17dc7e427cf8afea464c4a228752bc5",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 589, "line": 49, "column": 12 },
                    "end": { "index": 592, "line": 49, "column": 15 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 2.3 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "l",
        "_publicodes": {
          "id": "09da53f6baea1b170742ec76f50dd711",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 593, "line": 50, "column": 1 },
            "end": { "index": 594, "line": 50, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "value",
          "_publicodes": {
            "id": "2be8869347e49a63193de6d0098ec37b",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 598, "line": 51, "column": 3 },
              "end": { "index": 604, "line": 51, "column": 9 }
            }
          },
          "parameters": {
            "value mecanism": {
              "type": "expr",
              "_publicodes": {
                "id": "43b51d25e91301a1f5d231ed694cac7a",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 606, "line": 51, "column": 11 },
                  "end": { "index": 607, "line": 51, "column": 12 }
                }
              },
              "parameters": {
                "type": "constant",
                "parameters": {
                  "type": "number",
                  "parameters": { "value": 2.0 }
                }
              }
            },
            "chainable mecanisms": []
          }
        },
        "chainable mecanisms": [
          {
            "type": "floor",
            "_publicodes": {
              "id": "24216a81fc80214620c7a3b2d78493ad",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 610, "line": 52, "column": 3 },
                "end": { "index": 618, "line": 52, "column": 11 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "b8bee0b4d1909a31172817500746d0a4",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 620, "line": 52, "column": 13 },
                    "end": { "index": 621, "line": 52, "column": 14 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 3.0 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "m",
        "_publicodes": {
          "id": "27d84601f4a2a551e2ac5cc994c3add6",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 622, "line": 53, "column": 1 },
            "end": { "index": 623, "line": 53, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "not_defined",
          "_publicodes": {
            "id": "27d84601f4a2a551e2ac5cc994c3add6",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 622, "line": 53, "column": 1 },
              "end": { "index": 623, "line": 53, "column": 2 }
            }
          }
        },
        "chainable mecanisms": [
          {
            "type": "round nearest",
            "_publicodes": {
              "id": "f3a20b788a484e0ae8daf1d8f8347ad8",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 627, "line": 54, "column": 3 },
                "end": { "index": 634, "line": 54, "column": 10 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "d79f36416fece81425e0870cd85b023c",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 636, "line": 54, "column": 12 },
                    "end": { "index": 639, "line": 54, "column": 15 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 2.3 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "n",
        "_publicodes": {
          "id": "f7a4534321d211a5fef78a02cf4f31c1",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 640, "line": 55, "column": 1 },
            "end": { "index": 641, "line": 55, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "not_defined",
          "_publicodes": {
            "id": "f7a4534321d211a5fef78a02cf4f31c1",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 640, "line": 55, "column": 1 },
              "end": { "index": 641, "line": 55, "column": 2 }
            }
          }
        },
        "chainable mecanisms": [
          {
            "type": "round down",
            "_publicodes": {
              "id": "48814d0d42e81b1835e2a955336e4aee",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 645, "line": 56, "column": 3 },
                "end": { "index": 666, "line": 56, "column": 24 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "9a1277fc15ed4ef68174aca2db3341e2",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 668, "line": 56, "column": 26 },
                    "end": { "index": 671, "line": 56, "column": 29 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 2.3 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "o",
        "_publicodes": {
          "id": "63087e876b62b228ce1ca32f323fa133",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 672, "line": 57, "column": 1 },
            "end": { "index": 673, "line": 57, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "not_defined",
          "_publicodes": {
            "id": "63087e876b62b228ce1ca32f323fa133",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 672, "line": 57, "column": 1 },
              "end": { "index": 673, "line": 57, "column": 2 }
            }
          }
        },
        "chainable mecanisms": [
          {
            "type": "round up",
            "_publicodes": {
              "id": "40a75ee6698b4089c983662b9d877196",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 677, "line": 58, "column": 3 },
                "end": { "index": 697, "line": 58, "column": 23 }
              }
            },
            "parameters": {
              "value mecanism": {
                "type": "expr",
                "_publicodes": {
                  "id": "9eefb1d8169ec53b896ee6369c28130a",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 699, "line": 58, "column": 25 },
                    "end": { "index": 702, "line": 58, "column": 28 }
                  }
                },
                "parameters": {
                  "type": "constant",
                  "parameters": {
                    "type": "number",
                    "parameters": { "value": 2.3 }
                  }
                }
              },
              "chainable mecanisms": []
            }
          }
        ]
      },
      {
        "name": "p",
        "_publicodes": {
          "id": "502bb89b9ab8534e6191f8ea100d2cec",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 703, "line": 59, "column": 1 },
            "end": { "index": 704, "line": 59, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "expr",
          "_publicodes": {
            "id": "502bb89b9ab8534e6191f8ea100d2cec",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 703, "line": 59, "column": 1 },
              "end": { "index": 704, "line": 59, "column": 2 }
            }
          },
          "parameters": {
            "type": "constant",
            "parameters": {
              "type": "symbol",
              "parameters": { "value": "foo" }
            }
          }
        },
        "chainable mecanisms": []
      }
    ]
  }

  $ publicodes compile ok -o - | ../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("dfb3c6796b344957f44c2e7300f71dff", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("42af92aad66aef67de55ea117b04b7bb", ctx, $add(
        $ret("fdf43fcb0f9e59345833e87010cf2284", ctx, $ref("a", _a, ctx, params)),
        $ret("42af92aad66aef67de55ea117b04b7bb", ctx, $add(
          $ret("7645595219f544844a979bd48abe21fa", ctx, $ref("b . c", _b_·_c, ctx, params)),
          $ret("cf6b772cd42698f02d7e852a34313551", ctx, ((ctx) => $ret("22e546e7e75af96371f69ad2d8af2964", ctx, $ref("a", _a, ctx, params)))(
          			{
          				...ctx,
          					"a": $ret("df39a19cbe24fa860540eb7e75d9de92", ctx, 30.),
          			}
          		))))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {number} */ (
      $ret("233d46a39aa61b1b99cbe5c01e0fbf81", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $cond(
        $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $eq(
          $ret("2f5e60389611c1c6bc3e4e4478f1a702", ctx, $gt(
            $ret("b876e832d1c1cfc749952f4c3adf90b7", ctx, $ref("a", _a, ctx, params)),
            () => $ret("12fc410435c3fde2cecced5f92aec122", ctx, 20.))),
          $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, true))), () => $ret("0d55b0bd7d204b083e38cceb31742fa5", ctx, 20.), () => $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $cond(
          $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $eq(
            $ret("4fb9ae5096511d41691837ad27846fa6", ctx, $gt(
              $ret("c4907119921e373ccf421389cc13e9ad", ctx, $ref("a", _a, ctx, params)),
              () => $ret("a4177905ea6c46748202c10e2e2bdba2", ctx, 5.))),
            $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, true))), () => $ret("4b9b7a91ed4c95bddf9dd12a2f9a10fd", ctx, 5.), () => $ret("2fcb42f66ae8d0ba5e6662c7776547fa", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("f95ad0dbbb22c5e8767e609dea16911f", ctx, $add(
        $ret("a1a2199e81c13976e98730c176e3ee11", ctx, $ref("a", _a, ctx, params)),
        $ret("b30b94f8a1d3a541e69bf18766548f78", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("ba22056e27833dff59c87d75403e0c2d", ctx, (-$ret("100ec86cc10e97b572c01fb694cf12d5", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("afafc1aab9936444e382cb08fc157307", ctx, ((ctx) => $ret("e235ed437d08860552f60bc0e91d0421", ctx, $add(
        $ret("4f5e4d136c93ec364521a1a692012790", ctx, $ref("b", _b, ctx, params)),
        $ret("fa66d0fc6f7588a92efa7e30b3bf8d25", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      					"a": $ret("210ae98ccf1b505aa542f2e38adc1e09", ctx, 2.),
      					"b . c": $ret("529ed2f0d11cd3de1c855166b00ed38c", ctx, 3.),
      					"g . here": $ret("f6fa180da1df794e59ee03a7fec72a98", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {number} */ (
      $ret("96e452abcb8db5630752b6bc7c8adb61", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {number} */ (
      $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, $cond(
        $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, $or(
          $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, (isNotDefined($ret("18899ffbe32b76257a8c0db9e29dff49", ctx, $gt(
            $ret("d914314173af9efefd78bf8a679f1881", ctx, $ref("g", _g, ctx, params)),
            () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.)))))),
          () => $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, $or(
            $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, $eq(
              $ret("18899ffbe32b76257a8c0db9e29dff49", ctx, $gt(
                $ret("d914314173af9efefd78bf8a679f1881", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.))),
              $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, false))),
            () => $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, $eq(
              $ret("18899ffbe32b76257a8c0db9e29dff49", ctx, $gt(
                $ret("d914314173af9efefd78bf8a679f1881", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.))),
              $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, NotApplicable))))))), () => $ret("04ff0686e92917b8722d8a3c065e58bd", ctx, NotApplicable), () => $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {number} */ (
      $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, $cond(
        $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, $or(
          $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, (isNotDefined($ret("de4083c605783e083759724fb3d0b947", ctx, $gt(
            $ret("49ad0e3621f180134b876e4a3eed89fd", ctx, $ref("g", _g, ctx, params)),
            () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.)))))),
          () => $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, $or(
            $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, $eq(
              $ret("de4083c605783e083759724fb3d0b947", ctx, $gt(
                $ret("49ad0e3621f180134b876e4a3eed89fd", ctx, $ref("g", _g, ctx, params)),
                () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.))),
              $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, false))),
            () => $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, $eq(
              $ret("de4083c605783e083759724fb3d0b947", ctx, $gt(
                $ret("49ad0e3621f180134b876e4a3eed89fd", ctx, $ref("g", _g, ctx, params)),
                () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.))),
              $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, NotApplicable))))))), () => $ret("2daf2319f6592f55b59a413213ae9c38", ctx, 30.), () => $ret("1d4170a008fe7e9a5550e66144d9fbc1", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("dd2468b224a417fc4bbf3374ee09dd34", ctx, $cond(
        $ret("dd2468b224a417fc4bbf3374ee09dd34", ctx, (isNotDefined($ret("4dd128f83551869d4cd97e1ac99b309b", ctx, $get("j", ctx, params))))), () => $ret("e9749d8c0d9f8ccbcaaae789a74ac4a5", ctx, 20.), () => $ret("4dd128f83551869d4cd97e1ac99b309b", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {number} */ (
      $ret("24d865e5b12c5b69db0cc0fe177cd3d1", ctx, $cond(
        $ret("24d865e5b12c5b69db0cc0fe177cd3d1", ctx, $and(
          $ret("24d865e5b12c5b69db0cc0fe177cd3d1", ctx, $neq(
            $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3),
            $ret("24d865e5b12c5b69db0cc0fe177cd3d1", ctx, NotApplicable))),
          () => $ret("24d865e5b12c5b69db0cc0fe177cd3d1", ctx, $gt(
            $ret("0ca5948ac06e266f5076c7a1a7611848", ctx, 4.),
            () => $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3))))), () => $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3), () => $ret("0ca5948ac06e266f5076c7a1a7611848", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {number} */ (
      $ret("24216a81fc80214620c7a3b2d78493ad", ctx, $cond(
        $ret("24216a81fc80214620c7a3b2d78493ad", ctx, $and(
          $ret("24216a81fc80214620c7a3b2d78493ad", ctx, $neq(
            $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.),
            $ret("24216a81fc80214620c7a3b2d78493ad", ctx, NotApplicable))),
          () => $ret("24216a81fc80214620c7a3b2d78493ad", ctx, $lt(
            $ret("43b51d25e91301a1f5d231ed694cac7a", ctx, 2.),
            () => $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.))))), () => $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.), () => $ret("43b51d25e91301a1f5d231ed694cac7a", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("27d84601f4a2a551e2ac5cc994c3add6", ctx, $round("nearest", $ret("27d84601f4a2a551e2ac5cc994c3add6", ctx, $get("m", ctx, params)), () => $ret("d79f36416fece81425e0870cd85b023c", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("f7a4534321d211a5fef78a02cf4f31c1", ctx, $round("down", $ret("f7a4534321d211a5fef78a02cf4f31c1", ctx, $get("n", ctx, params)), () => $ret("9a1277fc15ed4ef68174aca2db3341e2", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("63087e876b62b228ce1ca32f323fa133", ctx, $round("up", $ret("63087e876b62b228ce1ca32f323fa133", ctx, $get("o", ctx, params)), () => $ret("9eefb1d8169ec53b896ee6369c28130a", ctx, 2.3)))
    )
  
  function _p(ctx, params) {
    return /** @type {"foo"} */ (
      $ret("7a4b65152797006a36e155d3959e6250", ctx, "foo")
    )
