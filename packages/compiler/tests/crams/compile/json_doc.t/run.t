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
                "id": "b330e868a4ee75bdb9673f4b374368bf",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 5, "line": 2, "column": 3 },
                  "end": { "index": 11, "line": 2, "column": 9 }
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
                      "id": "53c2c6e359fd92fb12891eac38793e59",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 80, "line": 8, "column": 7 },
                        "end": { "index": 86, "line": 8, "column": 13 }
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
                          "id": "cf6b772cd42698f02d7e852a34313551",
                          "position": {
                            "file": "ok/rules.publicodes",
                            "start": { "index": 96, "line": 9, "column": 7 },
                            "end": { "index": 104, "line": 9, "column": 15 }
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
                  "id": "42af92aad66aef67de55ea117b04b7bb",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 61, "line": 6, "column": 3 },
                    "end": { "index": 66, "line": 6, "column": 8 }
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
                  "id": "42af92aad66aef67de55ea117b04b7bb",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 61, "line": 6, "column": 3 },
                    "end": { "index": 66, "line": 6, "column": 8 }
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
            "id": "8b1fd0195e4732d89a9d8bd2f82b63fd",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 148, "line": 14, "column": 5 },
              "end": { "index": 149, "line": 14, "column": 6 }
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
                      "id": "eaeb53ae1ab4129fa5ca998b24a52276",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 192, "line": 18, "column": 7 },
                        "end": { "index": 194, "line": 18, "column": 9 }
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
                      "id": "cab900a212d6c4e86155301584c76f7b",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 209, "line": 19, "column": 7 },
                        "end": { "index": 214, "line": 19, "column": 12 }
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
                      "id": "abb323c5fb4a669140ce96f2b273f164",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 227, "line": 20, "column": 7 },
                        "end": { "index": 229, "line": 20, "column": 9 }
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
                      "id": "75351d742095be58c25106e2134a166f",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 243, "line": 21, "column": 7 },
                        "end": { "index": 248, "line": 21, "column": 12 }
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
                  "id": "0beea03e419ada228f530eda5493132d",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 260, "line": 22, "column": 7 },
                    "end": { "index": 265, "line": 22, "column": 12 }
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
                "id": "375265e5a5330ccb98ce30d1dd6d0ae7",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 336, "line": 28, "column": 3 },
                  "end": { "index": 342, "line": 28, "column": 9 }
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
            "id": "6e958ff2e0c6b6af8b7c8a916deceade",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 350, "line": 29, "column": 1 },
              "end": { "index": 351, "line": 29, "column": 2 }
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
                "id": "4718358da0921b79490f05cd21d138d0",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 361, "line": 31, "column": 3 },
                  "end": { "index": 367, "line": 31, "column": 9 }
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
                    "id": "afafc1aab9936444e382cb08fc157307",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 400, "line": 34, "column": 3 },
                      "end": { "index": 408, "line": 34, "column": 11 }
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
                    "id": "afafc1aab9936444e382cb08fc157307",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 400, "line": 34, "column": 3 },
                      "end": { "index": 408, "line": 34, "column": 11 }
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
                    "id": "afafc1aab9936444e382cb08fc157307",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 400, "line": 34, "column": 3 },
                      "end": { "index": 408, "line": 34, "column": 11 }
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
            "id": "caf7ef889f1edc979789dd84d850b241",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 390, "line": 33, "column": 5 },
              "end": { "index": 394, "line": 33, "column": 9 }
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
                "id": "deca5743988cb4963ef1ecbd661bd179",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 449, "line": 39, "column": 3 },
                  "end": { "index": 455, "line": 39, "column": 9 }
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
                  "id": "04ff0686e92917b8722d8a3c065e58bd",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 462, "line": 40, "column": 3 },
                    "end": { "index": 475, "line": 40, "column": 16 }
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
                "id": "d24d99cec040687675fac66e5c45707f",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 489, "line": 42, "column": 3 },
                  "end": { "index": 495, "line": 42, "column": 9 }
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
                  "id": "1d4170a008fe7e9a5550e66144d9fbc1",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 502, "line": 43, "column": 3 },
                    "end": { "index": 519, "line": 43, "column": 20 }
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
                  "id": "dd2468b224a417fc4bbf3374ee09dd34",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 548, "line": 46, "column": 3 },
                    "end": { "index": 558, "line": 46, "column": 13 }
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
                "id": "d3a5646cd96122c13d28ce493dc5a3a2",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 568, "line": 48, "column": 3 },
                  "end": { "index": 574, "line": 48, "column": 9 }
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
                  "id": "24d865e5b12c5b69db0cc0fe177cd3d1",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 580, "line": 49, "column": 3 },
                    "end": { "index": 587, "line": 49, "column": 10 }
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
                "id": "2be8869347e49a63193de6d0098ec37b",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 598, "line": 51, "column": 3 },
                  "end": { "index": 604, "line": 51, "column": 9 }
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
                  "id": "24216a81fc80214620c7a3b2d78493ad",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 610, "line": 52, "column": 3 },
                    "end": { "index": 618, "line": 52, "column": 11 }
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
                  "id": "f3a20b788a484e0ae8daf1d8f8347ad8",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 627, "line": 54, "column": 3 },
                    "end": { "index": 634, "line": 54, "column": 10 }
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
                  "id": "48814d0d42e81b1835e2a955336e4aee",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 645, "line": 56, "column": 3 },
                    "end": { "index": 666, "line": 56, "column": 24 }
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
                  "id": "40a75ee6698b4089c983662b9d877196",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 677, "line": 58, "column": 3 },
                    "end": { "index": 697, "line": 58, "column": 23 }
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
      },
      {
        "name": "q",
        "_publicodes": {
          "id": "a85468d2fca866b8f4cb33974a03e918",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 712, "line": 60, "column": 1 },
            "end": { "index": 713, "line": 60, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "variations",
          "_publicodes": {
            "id": "89129915ff64e38296ff0bdd95661c13",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 717, "line": 61, "column": 3 },
              "end": { "index": 727, "line": 61, "column": 13 }
            }
          },
          "parameters": {
            "conditions": [
              {
                "if": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "ae09062e76497f9207269738e5cf0823",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 735, "line": 62, "column": 7 },
                        "end": { "index": 737, "line": 62, "column": 9 }
                      }
                    },
                    "parameters": {
                      "type": "constant",
                      "parameters": {
                        "type": "bool",
                        "parameters": { "value": true }
                      }
                    }
                  },
                  "chainable mecanisms": []
                },
                "then": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "3c998a9a4f91162f9a49fbc783e7d812",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 749, "line": 63, "column": 7 },
                        "end": { "index": 754, "line": 63, "column": 12 }
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
              },
              {
                "if": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "bd9a5aadc3ae1c0766ee368514ae6a80",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 768, "line": 64, "column": 7 },
                        "end": { "index": 770, "line": 64, "column": 9 }
                      }
                    },
                    "parameters": {
                      "type": "constant",
                      "parameters": {
                        "type": "bool",
                        "parameters": { "value": false }
                      }
                    }
                  },
                  "chainable mecanisms": []
                },
                "then": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "578b86ae693636f768eb5c06a45614b8",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 782, "line": 65, "column": 7 },
                        "end": { "index": 787, "line": 65, "column": 12 }
                      }
                    },
                    "parameters": {
                      "type": "constant",
                      "parameters": {
                        "type": "symbol",
                        "parameters": { "value": "bar" }
                      }
                    }
                  },
                  "chainable mecanisms": []
                }
              }
            ]
          }
        },
        "chainable mecanisms": []
      },
      {
        "name": "r",
        "_publicodes": {
          "id": "34bb3c58881a81d9eb5a564aba2d8fe9",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 795, "line": 66, "column": 1 },
            "end": { "index": 796, "line": 66, "column": 2 }
          }
        },
        "value mecanism": {
          "type": "variations",
          "_publicodes": {
            "id": "8651138b0c019be4c49df4a7cadc8238",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 857, "line": 71, "column": 3 },
              "end": { "index": 867, "line": 71, "column": 13 }
            }
          },
          "parameters": {
            "conditions": [
              {
                "if": {
                  "value mecanism": {
                    "type": "expr",
                    "_publicodes": {
                      "id": "a39f356b0b91019e88fe0a2a09cbb30f",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 875, "line": 72, "column": 7 },
                        "end": { "index": 877, "line": 72, "column": 9 }
                      }
                    },
                    "parameters": {
                      "type": "eq",
                      "parameters": {
                        "left": {
                          "type": "constant",
                          "parameters": {
                            "type": "number",
                            "parameters": { "value": 5.0 }
                          }
                        },
                        "right": {
                          "type": "constant",
                          "parameters": {
                            "type": "number",
                            "parameters": { "value": 1.0 }
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
                      "id": "573400a8e3c6f93430ab506ed658570c",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 891, "line": 73, "column": 7 },
                        "end": { "index": 896, "line": 73, "column": 12 }
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
              }
            ]
          }
        },
        "chainable mecanisms": [
          {
            "type": "type",
            "_publicodes": {
              "id": "0e4ff2e1429a37ff505a42e721479bc8",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 800, "line": 67, "column": 3 },
                "end": { "index": 804, "line": 67, "column": 7 }
              }
            },
            "parameters": { "type": "'foo', 'bar'" }
          }
        ]
      }
    ]
  }

  $ publicodes compile ok -o - | ../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {10.000000€} */ (
      $ret("dfb3c6796b344957f44c2e7300f71dff", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("42af92aad66aef67de55ea117b04b7bb", ctx, $add(
        $ret("df39a19cbe24fa860540eb7e75d9de92", ctx, $ref("a", _a, ctx, params)),
        $ret("42af92aad66aef67de55ea117b04b7bb", ctx, $add(
          $ret("3cc3f240a23f984312aea0769bd5c568", ctx, $ref("b . c", _b_·_c, ctx, params)),
          $ret("df39a19cbe24fa860540eb7e75d9de92", ctx, ((ctx) => $ret("df39a19cbe24fa860540eb7e75d9de92", ctx, $ref("a", _a, ctx, params)))(
          			{
          				...ctx,
          					"a": $ret("df39a19cbe24fa860540eb7e75d9de92", ctx, 30.),
          			}
          		))))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {55.000000€} */ (
      $ret("233d46a39aa61b1b99cbe5c01e0fbf81", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $cond(
        $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $eq(
          $ret("f9ce896d4a9abd3d1b8dbb1c4e297fd7", ctx, $gt(
            $ret("4fa6a0388713154f9115910c563f75ce", ctx, $ref("a", _a, ctx, params)),
            () => $ret("12fc410435c3fde2cecced5f92aec122", ctx, 20.))),
          $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, true))), () => $ret("0d55b0bd7d204b083e38cceb31742fa5", ctx, 20.), () => $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $cond(
          $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, $eq(
            $ret("be354af8a0b9b89073d0231a78f2d54c", ctx, $gt(
              $ret("4fa6a0388713154f9115910c563f75ce", ctx, $ref("a", _a, ctx, params)),
              () => $ret("a4177905ea6c46748202c10e2e2bdba2", ctx, 5.))),
            $ret("70e4c4a5aa0d531d504d903dd427cc22", ctx, true))), () => $ret("4b9b7a91ed4c95bddf9dd12a2f9a10fd", ctx, 5.), () => $ret("2fcb42f66ae8d0ba5e6662c7776547fa", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("b98093565171af625aecadfe1fe747d8", ctx, $add(
        $ret("a98d9e857166c57052deffc0bc3d6235", ctx, $ref("a", _a, ctx, params)),
        $ret("f04616eaaedc4fe3dc922f1e1f61a859", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("ba22056e27833dff59c87d75403e0c2d", ctx, (-$ret("351777ba7c933c6cf6dd2d62c0bfbc70", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("d261b92b31edeceb55cf0a21a1159419", ctx, ((ctx) => $ret("d261b92b31edeceb55cf0a21a1159419", ctx, $add(
        $ret("a369e3fe2d67e373aa5fafb4d61d4a23", ctx, $ref("b", _b, ctx, params)),
        $ret("f6fa180da1df794e59ee03a7fec72a98", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      					"a": $ret("210ae98ccf1b505aa542f2e38adc1e09", ctx, 2.),
      					"b . c": $ret("529ed2f0d11cd3de1c855166b00ed38c", ctx, 3.),
      					"g . here": $ret("f6fa180da1df794e59ee03a7fec72a98", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {5.000000€} */ (
      $ret("96e452abcb8db5630752b6bc7c8adb61", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {30.000000aucune} */ (
      $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, $cond(
        $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, $or(
          $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, (isNotDefined($ret("c5977727da2862f6fbc361dcbd49fbd7", ctx, $gt(
            $ret("cdf4baec6de9dbabf439366a24b4263f", ctx, $ref("g", _g, ctx, params)),
            () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.)))))),
          () => $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, $or(
            $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, $eq(
              $ret("c5977727da2862f6fbc361dcbd49fbd7", ctx, $gt(
                $ret("cdf4baec6de9dbabf439366a24b4263f", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.))),
              $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, false))),
            () => $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, $eq(
              $ret("c5977727da2862f6fbc361dcbd49fbd7", ctx, $gt(
                $ret("cdf4baec6de9dbabf439366a24b4263f", ctx, $ref("g", _g, ctx, params)),
                () => $ret("3598d8309a2f44998cade37eacf5b8b5", ctx, 20.))),
              $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, NotApplicable))))))), () => $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, NotApplicable), () => $ret("054ea3efdb5eadbd6a68952db6cce7f9", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {30.000000aucune} */ (
      $ret("2daf2319f6592f55b59a413213ae9c38", ctx, $cond(
        $ret("2daf2319f6592f55b59a413213ae9c38", ctx, $or(
          $ret("2daf2319f6592f55b59a413213ae9c38", ctx, (isNotDefined($ret("a5c8dd1f526a4d376bbfcd7cd54231c4", ctx, $gt(
            $ret("6dc60d40d515561c197527b3798b53ed", ctx, $ref("g", _g, ctx, params)),
            () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.)))))),
          () => $ret("2daf2319f6592f55b59a413213ae9c38", ctx, $or(
            $ret("2daf2319f6592f55b59a413213ae9c38", ctx, $eq(
              $ret("a5c8dd1f526a4d376bbfcd7cd54231c4", ctx, $gt(
                $ret("6dc60d40d515561c197527b3798b53ed", ctx, $ref("g", _g, ctx, params)),
                () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.))),
              $ret("2daf2319f6592f55b59a413213ae9c38", ctx, false))),
            () => $ret("2daf2319f6592f55b59a413213ae9c38", ctx, $eq(
              $ret("a5c8dd1f526a4d376bbfcd7cd54231c4", ctx, $gt(
                $ret("6dc60d40d515561c197527b3798b53ed", ctx, $ref("g", _g, ctx, params)),
                () => $ret("706db75cdf95b9ed7c4442f0af6c5940", ctx, 20.))),
              $ret("2daf2319f6592f55b59a413213ae9c38", ctx, NotApplicable))))))), () => $ret("2daf2319f6592f55b59a413213ae9c38", ctx, 30.), () => $ret("2daf2319f6592f55b59a413213ae9c38", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("dd2468b224a417fc4bbf3374ee09dd34", ctx, $cond(
        $ret("dd2468b224a417fc4bbf3374ee09dd34", ctx, (isNotDefined($ret("4dd128f83551869d4cd97e1ac99b309b", ctx, $get("j", ctx, params))))), () => $ret("e9749d8c0d9f8ccbcaaae789a74ac4a5", ctx, 20.), () => $ret("4dd128f83551869d4cd97e1ac99b309b", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {2.300000aucune} */ (
      $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, $cond(
        $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, $and(
          $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, $neq(
            $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3),
            $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, NotApplicable))),
          () => $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, $gt(
            $ret("0ca5948ac06e266f5076c7a1a7611848", ctx, 4.),
            () => $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3))))), () => $ret("b17dc7e427cf8afea464c4a228752bc5", ctx, 2.3), () => $ret("0ca5948ac06e266f5076c7a1a7611848", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {3.000000aucune} */ (
      $ret("b8bee0b4d1909a31172817500746d0a4", ctx, $cond(
        $ret("b8bee0b4d1909a31172817500746d0a4", ctx, $and(
          $ret("b8bee0b4d1909a31172817500746d0a4", ctx, $neq(
            $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.),
            $ret("b8bee0b4d1909a31172817500746d0a4", ctx, NotApplicable))),
          () => $ret("b8bee0b4d1909a31172817500746d0a4", ctx, $lt(
            $ret("43b51d25e91301a1f5d231ed694cac7a", ctx, 2.),
            () => $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.))))), () => $ret("b8bee0b4d1909a31172817500746d0a4", ctx, 3.), () => $ret("43b51d25e91301a1f5d231ed694cac7a", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("d79f36416fece81425e0870cd85b023c", ctx, $round("nearest", $ret("d79f36416fece81425e0870cd85b023c", ctx, $get("m", ctx, params)), () => $ret("d79f36416fece81425e0870cd85b023c", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("9a1277fc15ed4ef68174aca2db3341e2", ctx, $round("down", $ret("9a1277fc15ed4ef68174aca2db3341e2", ctx, $get("n", ctx, params)), () => $ret("9a1277fc15ed4ef68174aca2db3341e2", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("9eefb1d8169ec53b896ee6369c28130a", ctx, $round("up", $ret("9eefb1d8169ec53b896ee6369c28130a", ctx, $get("o", ctx, params)), () => $ret("9eefb1d8169ec53b896ee6369c28130a", ctx, 2.3)))
    )
  
  function _p(ctx, params) {
    return /** @type {'foo'} */ (
      $ret("7a4b65152797006a36e155d3959e6250", ctx, "foo")
    )
  
  function _q(ctx, params) {
    return /** @type {'bar'|'foo'} */ (
      $ret("89129915ff64e38296ff0bdd95661c13", ctx, $cond(
        $ret("89129915ff64e38296ff0bdd95661c13", ctx, $eq(
          $ret("1413f4e83de89a540b748b90f97dccea", ctx, true),
          $ret("89129915ff64e38296ff0bdd95661c13", ctx, true))), () => $ret("653fedc93360236646d104ff6c284d0f", ctx, "foo"), () => $ret("89129915ff64e38296ff0bdd95661c13", ctx, $cond(
          $ret("89129915ff64e38296ff0bdd95661c13", ctx, $eq(
            $ret("5ea9807021df2d38e89f776a8398aa41", ctx, false),
            $ret("89129915ff64e38296ff0bdd95661c13", ctx, true))), () => $ret("376321b5d1cd24ea1be87197dd6d34df", ctx, "bar"), () => $ret("89129915ff64e38296ff0bdd95661c13", ctx, NotApplicable)))))
    )
  
  function _r(ctx, params) {
    return /** @type {'foo'|'bar'} */ (
      $ret("8651138b0c019be4c49df4a7cadc8238", ctx, $cond(
        $ret("8651138b0c019be4c49df4a7cadc8238", ctx, $eq(
          $ret("10c0223705b199c5ec39541449b8b44b", ctx, $eq(
            $ret("ec82c37b0c0a4b652f90723f84e541ef", ctx, 5.),
            $ret("a3fa8ec07fbbbb942570db231be8b1d5", ctx, 1.))),
          $ret("8651138b0c019be4c49df4a7cadc8238", ctx, true))), () => $ret("0b0b83cdf2e9428ceeb71c11604b9c79", ctx, "foo"), () => $ret("8651138b0c019be4c49df4a7cadc8238", ctx, NotApplicable)))
    )
