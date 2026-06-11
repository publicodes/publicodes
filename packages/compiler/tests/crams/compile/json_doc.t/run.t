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
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "671cf31f521a21768557a1d05df98a17",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 0, "line": 1, "column": 1 },
                "end": { "index": 1, "line": 1, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "dfb3c6796b344957f44c2e7300f71dff",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 13, "line": 2, "column": 11 },
                    "end": { "index": 17, "line": 2, "column": 15 }
                  }
                },
                "value": {
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
        }
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
        "value": {
          "value mecanism": {
            "type": "sumn",
            "_publicodes": {
              "id": "969799a0c994d65e939da3be780d0195",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 56, "line": 5, "column": 1 },
                "end": { "index": 57, "line": 5, "column": 2 }
              }
            },
            "value": [
              {
                "value mecanism": {
                  "type": "value",
                  "_publicodes": {
                    "id": "42af92aad66aef67de55ea117b04b7bb",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 61, "line": 6, "column": 3 },
                      "end": { "index": 66, "line": 6, "column": 8 }
                    }
                  },
                  "value": {
                    "value mecanism": {
                      "type": "expression",
                      "_publicodes": {
                        "id": "22e546e7e75af96371f69ad2d8af2964",
                        "position": {
                          "file": "ok/rules.publicodes",
                          "start": { "index": 88, "line": 8, "column": 15 },
                          "end": { "index": 89, "line": 8, "column": 16 }
                        }
                      },
                      "value": { "type": "reference", "parameters": "a" }
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
                    "value": {
                      "a": {
                        "value mecanism": {
                          "type": "expression",
                          "_publicodes": {
                            "id": "df39a19cbe24fa860540eb7e75d9de92",
                            "position": {
                              "file": "ok/rules.publicodes",
                              "start": {
                                "index": 117,
                                "line": 10,
                                "column": 12
                              },
                              "end": { "index": 119, "line": 10, "column": 14 }
                            }
                          },
                          "value": {
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
                  "type": "expression",
                  "_publicodes": {
                    "id": "fdf43fcb0f9e59345833e87010cf2284",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 126, "line": 11, "column": 7 },
                      "end": { "index": 127, "line": 11, "column": 8 }
                    }
                  },
                  "value": { "type": "reference", "parameters": "a" }
                },
                "chainable mecanisms": []
              },
              {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "7645595219f544844a979bd48abe21fa",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 134, "line": 12, "column": 7 },
                      "end": { "index": 135, "line": 12, "column": 8 }
                    }
                  },
                  "value": { "type": "reference", "parameters": "b . c" }
                },
                "chainable mecanisms": []
              }
            ]
          },
          "chainable mecanisms": []
        }
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
        "value": {
          "value mecanism": {
            "type": "expression",
            "_publicodes": {
              "id": "233d46a39aa61b1b99cbe5c01e0fbf81",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 151, "line": 14, "column": 8 },
                "end": { "index": 153, "line": 14, "column": 10 }
              }
            },
            "value": {
              "type": "constant",
              "parameters": {
                "type": "number",
                "parameters": { "value": 55.0 }
              }
            }
          },
          "chainable mecanisms": []
        }
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
        "value": {
          "value mecanism": {
            "type": "variations",
            "_publicodes": {
              "id": "52e8c013cde911a60cb1e1d0631c1efe",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 154, "line": 15, "column": 1 },
                "end": { "index": 155, "line": 15, "column": 2 }
              }
            },
            "value": {
              "conditions": [
                {
                  "if": {
                    "value mecanism": {
                      "type": "expression",
                      "_publicodes": {
                        "id": "f9ce896d4a9abd3d1b8dbb1c4e297fd7",
                        "position": {
                          "file": "ok/rules.publicodes",
                          "start": { "index": 196, "line": 18, "column": 11 },
                          "end": { "index": 202, "line": 18, "column": 17 }
                        }
                      },
                      "value": {
                        "type": "greater than",
                        "parameters": {
                          "left": { "type": "reference", "parameters": "a" },
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
                      "type": "expression",
                      "_publicodes": {
                        "id": "0810c167be1f6bea68936aefa29443f6",
                        "position": {
                          "file": "ok/rules.publicodes",
                          "start": { "index": 216, "line": 19, "column": 14 },
                          "end": { "index": 218, "line": 19, "column": 16 }
                        }
                      },
                      "value": {
                        "type": "constant",
                        "parameters": {
                          "type": "number",
                          "parameters": { "value": 20.0 }
                        }
                      }
                    },
                    "chainable mecanisms": []
                  }
                },
                {
                  "if": {
                    "value mecanism": {
                      "type": "expression",
                      "_publicodes": {
                        "id": "e80d94f152af78098efd977fba92f83b",
                        "position": {
                          "file": "ok/rules.publicodes",
                          "start": { "index": 229, "line": 20, "column": 11 },
                          "end": { "index": 234, "line": 20, "column": 16 }
                        }
                      },
                      "value": {
                        "type": "greater than",
                        "parameters": {
                          "left": { "type": "reference", "parameters": "a" },
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
                      "type": "expression",
                      "_publicodes": {
                        "id": "696286ffa15e0165e4122cebfa200487",
                        "position": {
                          "file": "ok/rules.publicodes",
                          "start": { "index": 248, "line": 21, "column": 14 },
                          "end": { "index": 249, "line": 21, "column": 15 }
                        }
                      },
                      "value": {
                        "type": "constant",
                        "parameters": {
                          "type": "number",
                          "parameters": { "value": 5.0 }
                        }
                      }
                    },
                    "chainable mecanisms": []
                  }
                }
              ],
              "else": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "2eeba914d25693e73fffa6283fd01dd8",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 263, "line": 22, "column": 14 },
                      "end": { "index": 264, "line": 22, "column": 15 }
                    }
                  },
                  "value": {
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
              "value": { "type": "nombre" }
            }
          ]
        }
      },
      {
        "name": "e",
        "public": true,
        "meta": { "une meta": "23", "une autre meta": "42" },
        "_publicodes": {
          "id": "5bed73751a6b8c68c928f9cd402a8025",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 265, "line": 23, "column": 1 },
            "end": { "index": 266, "line": 23, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "5bed73751a6b8c68c928f9cd402a8025",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 265, "line": 23, "column": 1 },
                "end": { "index": 266, "line": 23, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "bbd370a4caf206705ca71fcbe5c439e9",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 340, "line": 28, "column": 11 },
                    "end": { "index": 345, "line": 28, "column": 16 }
                  }
                },
                "value": {
                  "type": "addition",
                  "parameters": {
                    "left": { "type": "reference", "parameters": "a" },
                    "right": { "type": "reference", "parameters": "b" }
                  }
                }
              },
              "chainable mecanisms": []
            }
          },
          "chainable mecanisms": []
        }
      },
      {
        "name": "f",
        "_publicodes": {
          "id": "797b2c8a9b6914e83f2bf0a031a6c07e",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 346, "line": 29, "column": 1 },
            "end": { "index": 347, "line": 29, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "expression",
            "_publicodes": {
              "id": "6524390fb76753ac1fec9a61b728960c",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 349, "line": 29, "column": 4 },
                "end": { "index": 351, "line": 29, "column": 6 }
              }
            },
            "value": {
              "type": "opposite of",
              "parameters": { "type": "reference", "parameters": "e" }
            }
          },
          "chainable mecanisms": []
        }
      },
      {
        "name": "g",
        "_publicodes": {
          "id": "d0c30e8cf564ff4703fd16fd75e950b6",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 352, "line": 30, "column": 1 },
            "end": { "index": 353, "line": 30, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "d0c30e8cf564ff4703fd16fd75e950b6",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 352, "line": 30, "column": 1 },
                "end": { "index": 353, "line": 30, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "95cf1f878fedcd5312b171570eb6b393",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 365, "line": 31, "column": 11 },
                    "end": { "index": 373, "line": 31, "column": 19 }
                  }
                },
                "value": {
                  "type": "addition",
                  "parameters": {
                    "left": { "type": "reference", "parameters": "b" },
                    "right": { "type": "reference", "parameters": "g . here" }
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
                "id": "85ce99a60924c6d8ff809998df3944fc",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 396, "line": 34, "column": 3 },
                  "end": { "index": 404, "line": 34, "column": 11 }
                }
              },
              "value": {
                "a": {
                  "value mecanism": {
                    "type": "expression",
                    "_publicodes": {
                      "id": "19bbc30ce6d4d20a7739adf6b420f2dc",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 413, "line": 35, "column": 8 },
                        "end": { "index": 414, "line": 35, "column": 9 }
                      }
                    },
                    "value": {
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
                    "type": "expression",
                    "_publicodes": {
                      "id": "347442b75f611d5de8d41cdca0d30e8b",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 426, "line": 36, "column": 12 },
                        "end": { "index": 427, "line": 36, "column": 13 }
                      }
                    },
                    "value": {
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
                    "type": "expression",
                    "_publicodes": {
                      "id": "bf10b90d9cde456d9e9f18e36af31bed",
                      "position": {
                        "file": "ok/rules.publicodes",
                        "start": { "index": 438, "line": 37, "column": 11 },
                        "end": { "index": 439, "line": 37, "column": 12 }
                      }
                    },
                    "value": {
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
        }
      },
      {
        "name": "g . here",
        "_publicodes": {
          "id": "b2cbcffaf59e9c0303ed90703cb528ca",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 386, "line": 33, "column": 5 },
            "end": { "index": 390, "line": 33, "column": 9 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "expression",
            "_publicodes": {
              "id": "353ca874bbde5742ad31b91acffdcbcc",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 392, "line": 33, "column": 11 },
                "end": { "index": 393, "line": 33, "column": 12 }
              }
            },
            "value": {
              "type": "constant",
              "parameters": {
                "type": "number",
                "parameters": { "value": 5.0 }
              }
            }
          },
          "chainable mecanisms": []
        }
      },
      {
        "name": "h",
        "_publicodes": {
          "id": "b0ea68402bb15f32d00afacc5e9c56b4",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 440, "line": 38, "column": 1 },
            "end": { "index": 441, "line": 38, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "b0ea68402bb15f32d00afacc5e9c56b4",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 440, "line": 38, "column": 1 },
                "end": { "index": 441, "line": 38, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "27a5ac9ea76c992825f09f74bad5c595",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 453, "line": 39, "column": 11 },
                    "end": { "index": 455, "line": 39, "column": 13 }
                  }
                },
                "value": {
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
              "type": "applicable if",
              "_publicodes": {
                "id": "e74ebece19e28c0c9e617b1bff2b67c8",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 458, "line": 40, "column": 3 },
                  "end": { "index": 471, "line": 40, "column": 16 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "b1347ae891ad72155997cbae67bc0532",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 473, "line": 40, "column": 18 },
                      "end": { "index": 479, "line": 40, "column": 24 }
                    }
                  },
                  "value": {
                    "type": "greater than",
                    "parameters": {
                      "left": { "type": "reference", "parameters": "g" },
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
        }
      },
      {
        "name": "i",
        "_publicodes": {
          "id": "3996f491a57fcaa77e0eedd8bc361ee5",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 480, "line": 41, "column": 1 },
            "end": { "index": 481, "line": 41, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "3996f491a57fcaa77e0eedd8bc361ee5",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 480, "line": 41, "column": 1 },
                "end": { "index": 481, "line": 41, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "f25d33c6e677041c031f20066dea65a8",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 493, "line": 42, "column": 11 },
                    "end": { "index": 495, "line": 42, "column": 13 }
                  }
                },
                "value": {
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
              "type": "not applicable if",
              "_publicodes": {
                "id": "dfd2b045fc68ca71aa33af67f70aa8f7",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 498, "line": 43, "column": 3 },
                  "end": { "index": 515, "line": 43, "column": 20 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "cec98e1a6aa09f7cbc083b2905a6c749",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 517, "line": 43, "column": 22 },
                      "end": { "index": 523, "line": 43, "column": 28 }
                    }
                  },
                  "value": {
                    "type": "greater than",
                    "parameters": {
                      "left": { "type": "reference", "parameters": "g" },
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
        }
      },
      {
        "name": "j",
        "_publicodes": {
          "id": "6d1238fc420eb75ee7322716f2a234b3",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 524, "line": 44, "column": 1 },
            "end": { "index": 525, "line": 44, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "not defined",
            "_publicodes": {
              "id": "6d1238fc420eb75ee7322716f2a234b3",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 524, "line": 44, "column": 1 },
                "end": { "index": 525, "line": 44, "column": 2 }
              }
            }
          },
          "chainable mecanisms": [
            {
              "type": "type",
              "_publicodes": {
                "id": "7115db45de2437f047f00890c697d923",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 529, "line": 45, "column": 3 },
                  "end": { "index": 533, "line": 45, "column": 7 }
                }
              },
              "value": { "type": "nombre" }
            },
            {
              "type": "default",
              "_publicodes": {
                "id": "27ac644898d7e7d32e16596e8cbb936e",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 544, "line": 46, "column": 3 },
                  "end": { "index": 554, "line": 46, "column": 13 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "3a42431674f39c55150b822b3feae53f",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 556, "line": 46, "column": 15 },
                      "end": { "index": 558, "line": 46, "column": 17 }
                    }
                  },
                  "value": {
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
        }
      },
      {
        "name": "k",
        "_publicodes": {
          "id": "b150a5a69c8bd3c42a66b58e3a7b7a4b",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 559, "line": 47, "column": 1 },
            "end": { "index": 560, "line": 47, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "b150a5a69c8bd3c42a66b58e3a7b7a4b",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 559, "line": 47, "column": 1 },
                "end": { "index": 560, "line": 47, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "12c7411008c04324ca04a36d38e5b507",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 572, "line": 48, "column": 11 },
                    "end": { "index": 573, "line": 48, "column": 12 }
                  }
                },
                "value": {
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
                "id": "0cf51c00fb795b1179092e898d0210b6",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 576, "line": 49, "column": 3 },
                  "end": { "index": 583, "line": 49, "column": 10 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "0c3066d1df9c4b22b0e092dd3b045185",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 585, "line": 49, "column": 12 },
                      "end": { "index": 588, "line": 49, "column": 15 }
                    }
                  },
                  "value": {
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
        }
      },
      {
        "name": "l",
        "_publicodes": {
          "id": "479ff20b4a938314f24b66e545a4847b",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 589, "line": 50, "column": 1 },
            "end": { "index": 590, "line": 50, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "value",
            "_publicodes": {
              "id": "479ff20b4a938314f24b66e545a4847b",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 589, "line": 50, "column": 1 },
                "end": { "index": 590, "line": 50, "column": 2 }
              }
            },
            "value": {
              "value mecanism": {
                "type": "expression",
                "_publicodes": {
                  "id": "3f518efcc8973f14c0b04f572aa7bb2e",
                  "position": {
                    "file": "ok/rules.publicodes",
                    "start": { "index": 602, "line": 51, "column": 11 },
                    "end": { "index": 603, "line": 51, "column": 12 }
                  }
                },
                "value": {
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
                "id": "d8241c37101737f383c4a2eff1a1d4a2",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 606, "line": 52, "column": 3 },
                  "end": { "index": 614, "line": 52, "column": 11 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "b5b46478020182250b6d304db217e998",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 616, "line": 52, "column": 13 },
                      "end": { "index": 617, "line": 52, "column": 14 }
                    }
                  },
                  "value": {
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
        }
      },
      {
        "name": "m",
        "_publicodes": {
          "id": "d59dd3bddfdfb3e7e7b66283bc64f3b1",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 618, "line": 53, "column": 1 },
            "end": { "index": 619, "line": 53, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "not defined",
            "_publicodes": {
              "id": "d59dd3bddfdfb3e7e7b66283bc64f3b1",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 618, "line": 53, "column": 1 },
                "end": { "index": 619, "line": 53, "column": 2 }
              }
            }
          },
          "chainable mecanisms": [
            {
              "type": "round nearest",
              "_publicodes": {
                "id": "b1e56ebfba34674d700a809c9e728e3e",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 623, "line": 54, "column": 3 },
                  "end": { "index": 630, "line": 54, "column": 10 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "8d8a0aeea038b3c4b5bf0f9259e172e9",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 632, "line": 54, "column": 12 },
                      "end": { "index": 635, "line": 54, "column": 15 }
                    }
                  },
                  "value": {
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
        }
      },
      {
        "name": "n",
        "_publicodes": {
          "id": "3efe0e0d7ecb6c3447fac218d636eb07",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 636, "line": 55, "column": 1 },
            "end": { "index": 637, "line": 55, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "not defined",
            "_publicodes": {
              "id": "3efe0e0d7ecb6c3447fac218d636eb07",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 636, "line": 55, "column": 1 },
                "end": { "index": 637, "line": 55, "column": 2 }
              }
            }
          },
          "chainable mecanisms": [
            {
              "type": "round down",
              "_publicodes": {
                "id": "c1dd1f060cdfdd5ab62f464329100e2b",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 641, "line": 56, "column": 3 },
                  "end": { "index": 662, "line": 56, "column": 24 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "686a5eb0eddebd23c8be15ba4cfa9511",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 664, "line": 56, "column": 26 },
                      "end": { "index": 667, "line": 56, "column": 29 }
                    }
                  },
                  "value": {
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
        }
      },
      {
        "name": "o",
        "_publicodes": {
          "id": "b961f0e95a9ec03a55c0fad429af1505",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 668, "line": 57, "column": 1 },
            "end": { "index": 669, "line": 57, "column": 2 }
          }
        },
        "value": {
          "value mecanism": {
            "type": "not defined",
            "_publicodes": {
              "id": "b961f0e95a9ec03a55c0fad429af1505",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 668, "line": 57, "column": 1 },
                "end": { "index": 669, "line": 57, "column": 2 }
              }
            }
          },
          "chainable mecanisms": [
            {
              "type": "round up",
              "_publicodes": {
                "id": "e37b1a9fa9eca18ccdb62ffbc25b8366",
                "position": {
                  "file": "ok/rules.publicodes",
                  "start": { "index": 673, "line": 58, "column": 3 },
                  "end": { "index": 693, "line": 58, "column": 23 }
                }
              },
              "value": {
                "value mecanism": {
                  "type": "expression",
                  "_publicodes": {
                    "id": "94946c8c785e4091b4a612f8b344f77c",
                    "position": {
                      "file": "ok/rules.publicodes",
                      "start": { "index": 695, "line": 58, "column": 25 },
                      "end": { "index": 698, "line": 58, "column": 28 }
                    }
                  },
                  "value": {
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
        }
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
      $ret("969799a0c994d65e939da3be780d0195", ctx, $add(
        $ret("fdf43fcb0f9e59345833e87010cf2284", ctx, $ref("a", _a, ctx, params)),
        $ret("969799a0c994d65e939da3be780d0195", ctx, $add(
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
      $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, $cond(
        $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, $eq(
          $ret("2f5e60389611c1c6bc3e4e4478f1a702", ctx, $gt(
            $ret("b876e832d1c1cfc749952f4c3adf90b7", ctx, $ref("a", _a, ctx, params)),
            () => $ret("12fc410435c3fde2cecced5f92aec122", ctx, 20.))),
          $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, true))), () => $ret("0810c167be1f6bea68936aefa29443f6", ctx, 20.), () => $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, $cond(
          $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, $eq(
            $ret("ec1ea70b3bd12375b862295d06425227", ctx, $gt(
              $ret("2dc5c0b0c43c058c103dbee17d837b4b", ctx, $ref("a", _a, ctx, params)),
              () => $ret("632ca371f1cdcb5398bdb3ef00b776f8", ctx, 5.))),
            $ret("52e8c013cde911a60cb1e1d0631c1efe", ctx, true))), () => $ret("696286ffa15e0165e4122cebfa200487", ctx, 5.), () => $ret("2eeba914d25693e73fffa6283fd01dd8", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("f00b3eb1885078b7feaef538cfc79395", ctx, $add(
        $ret("cecb053ca4e220361c96b8bff6806658", ctx, $ref("a", _a, ctx, params)),
        $ret("e7dda2490b9bf67f60ed446665389355", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("6524390fb76753ac1fec9a61b728960c", ctx, (-$ret("53fa90778dbf258770cfd17f294292c7", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("85ce99a60924c6d8ff809998df3944fc", ctx, ((ctx) => $ret("cfed4b232f1e1d939143770065c3f847", ctx, $add(
        $ret("d044190dc22a251f79fd8bc8d378f3e2", ctx, $ref("b", _b, ctx, params)),
        $ret("b8828c870faf9367e3bb39bacb7bc0a9", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      					"a": $ret("19bbc30ce6d4d20a7739adf6b420f2dc", ctx, 2.),
      					"b . c": $ret("347442b75f611d5de8d41cdca0d30e8b", ctx, 3.),
      					"g . here": $ret("bf10b90d9cde456d9e9f18e36af31bed", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {number} */ (
      $ret("353ca874bbde5742ad31b91acffdcbcc", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {number} */ (
      $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, $cond(
        $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, $or(
          $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, (isNotDefined($ret("d693d32a9602cf18dd5cdbf5c0d1a331", ctx, $gt(
            $ret("67eeee8a5da8f53213a7d7b5a48c24c4", ctx, $ref("g", _g, ctx, params)),
            () => $ret("56fb4bb347f186440464b69df74ae906", ctx, 20.)))))),
          () => $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, $or(
            $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, $eq(
              $ret("d693d32a9602cf18dd5cdbf5c0d1a331", ctx, $gt(
                $ret("67eeee8a5da8f53213a7d7b5a48c24c4", ctx, $ref("g", _g, ctx, params)),
                () => $ret("56fb4bb347f186440464b69df74ae906", ctx, 20.))),
              $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, false))),
            () => $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, $eq(
              $ret("d693d32a9602cf18dd5cdbf5c0d1a331", ctx, $gt(
                $ret("67eeee8a5da8f53213a7d7b5a48c24c4", ctx, $ref("g", _g, ctx, params)),
                () => $ret("56fb4bb347f186440464b69df74ae906", ctx, 20.))),
              $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, NotApplicable))))))), () => $ret("e74ebece19e28c0c9e617b1bff2b67c8", ctx, NotApplicable), () => $ret("27a5ac9ea76c992825f09f74bad5c595", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {number} */ (
      $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, $cond(
        $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, $or(
          $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, (isNotDefined($ret("e7cc2c5a8d8675e6cd6f377b5d51616b", ctx, $gt(
            $ret("6d1ddeacc70e4a50574173e885f0bede", ctx, $ref("g", _g, ctx, params)),
            () => $ret("5b0709d8395f1acabb34f4ca358d242d", ctx, 20.)))))),
          () => $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, $or(
            $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, $eq(
              $ret("e7cc2c5a8d8675e6cd6f377b5d51616b", ctx, $gt(
                $ret("6d1ddeacc70e4a50574173e885f0bede", ctx, $ref("g", _g, ctx, params)),
                () => $ret("5b0709d8395f1acabb34f4ca358d242d", ctx, 20.))),
              $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, false))),
            () => $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, $eq(
              $ret("e7cc2c5a8d8675e6cd6f377b5d51616b", ctx, $gt(
                $ret("6d1ddeacc70e4a50574173e885f0bede", ctx, $ref("g", _g, ctx, params)),
                () => $ret("5b0709d8395f1acabb34f4ca358d242d", ctx, 20.))),
              $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, NotApplicable))))))), () => $ret("f25d33c6e677041c031f20066dea65a8", ctx, 30.), () => $ret("dfd2b045fc68ca71aa33af67f70aa8f7", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("27ac644898d7e7d32e16596e8cbb936e", ctx, $cond(
        $ret("27ac644898d7e7d32e16596e8cbb936e", ctx, (isNotDefined($ret("6d1238fc420eb75ee7322716f2a234b3", ctx, $get("j", ctx, params))))), () => $ret("3a42431674f39c55150b822b3feae53f", ctx, 20.), () => $ret("6d1238fc420eb75ee7322716f2a234b3", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {number} */ (
      $ret("0cf51c00fb795b1179092e898d0210b6", ctx, $cond(
        $ret("0cf51c00fb795b1179092e898d0210b6", ctx, $and(
          $ret("0cf51c00fb795b1179092e898d0210b6", ctx, $neq(
            $ret("0c3066d1df9c4b22b0e092dd3b045185", ctx, 2.3),
            $ret("0cf51c00fb795b1179092e898d0210b6", ctx, NotApplicable))),
          () => $ret("0cf51c00fb795b1179092e898d0210b6", ctx, $gt(
            $ret("12c7411008c04324ca04a36d38e5b507", ctx, 4.),
            () => $ret("0c3066d1df9c4b22b0e092dd3b045185", ctx, 2.3))))), () => $ret("0c3066d1df9c4b22b0e092dd3b045185", ctx, 2.3), () => $ret("12c7411008c04324ca04a36d38e5b507", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {number} */ (
      $ret("d8241c37101737f383c4a2eff1a1d4a2", ctx, $cond(
        $ret("d8241c37101737f383c4a2eff1a1d4a2", ctx, $and(
          $ret("d8241c37101737f383c4a2eff1a1d4a2", ctx, $neq(
            $ret("b5b46478020182250b6d304db217e998", ctx, 3.),
            $ret("d8241c37101737f383c4a2eff1a1d4a2", ctx, NotApplicable))),
          () => $ret("d8241c37101737f383c4a2eff1a1d4a2", ctx, $lt(
            $ret("3f518efcc8973f14c0b04f572aa7bb2e", ctx, 2.),
            () => $ret("b5b46478020182250b6d304db217e998", ctx, 3.))))), () => $ret("b5b46478020182250b6d304db217e998", ctx, 3.), () => $ret("3f518efcc8973f14c0b04f572aa7bb2e", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("d59dd3bddfdfb3e7e7b66283bc64f3b1", ctx, $round("nearest", $ret("d59dd3bddfdfb3e7e7b66283bc64f3b1", ctx, $get("m", ctx, params)), () => $ret("8d8a0aeea038b3c4b5bf0f9259e172e9", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("3efe0e0d7ecb6c3447fac218d636eb07", ctx, $round("down", $ret("3efe0e0d7ecb6c3447fac218d636eb07", ctx, $get("n", ctx, params)), () => $ret("686a5eb0eddebd23c8be15ba4cfa9511", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("b961f0e95a9ec03a55c0fad429af1505", ctx, $round("up", $ret("b961f0e95a9ec03a55c0fad429af1505", ctx, $get("o", ctx, params)), () => $ret("94946c8c785e4091b4a612f8b344f77c", ctx, 2.3)))
    )
