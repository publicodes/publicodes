Valid json doc :

  $ publicodes compile ok -t json_doc -o -
  {
    "a": {
      "titre": "A",
      "description": "la valeur A",
      "valeur": {
        "expression": { "constante": 10.0, "unité": "€" },
        "_publicodes": {
          "id": "dfb3c6796b344957f44c2e7300f71dff",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 13, "line": 2, "column": 11 },
            "end": { "index": 17, "line": 2, "column": 15 }
          }
        }
      },
      "_publicodes": {
        "id": "671cf31f521a21768557a1d05df98a17",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 0, "line": 1, "column": 1 },
          "end": { "index": 1, "line": 1, "column": 2 }
        }
      }
    },
    "b": {
      "somme": [
        {
          "expression": { "constante": 10.0 },
          "_publicodes": {
            "id": "a1082378de458a0d2c8decc8d4dee20d",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 74, "line": 7, "column": 7 },
              "end": { "index": 76, "line": 7, "column": 9 }
            }
          }
        },
        {
          "expression": { "reference": "a" },
          "_publicodes": {
            "id": "1ff95d8458d7e8c3805bee5a38563666",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 83, "line": 8, "column": 7 },
              "end": { "index": 84, "line": 8, "column": 8 }
            }
          }
        },
        {
          "expression": { "reference": "b . c" },
          "_publicodes": {
            "id": "dc73d7f790636accd6a65943f3ba6d45",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 91, "line": 9, "column": 7 },
              "end": { "index": 92, "line": 9, "column": 8 }
            }
          }
        }
      ],
      "_publicodes": {
        "id": "969799a0c994d65e939da3be780d0195",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 56, "line": 5, "column": 1 },
          "end": { "index": 57, "line": 5, "column": 2 }
        }
      }
    },
    "b . c": {
      "expression": { "constante": 55.0 },
      "_publicodes": {
        "id": "daf3899c4a95af7db08b393a4e4737b2",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 108, "line": 11, "column": 8 },
          "end": { "index": 110, "line": 11, "column": 10 }
        }
      }
    },
    "d": {
      "variations": [
        {
          "si": {
            "expression": {
              "plus grand que": [ { "reference": "a" }, { "constante": 20.0 } ]
            },
            "_publicodes": {
              "id": "6686d6b51cb4aa494e7ee96eef2a2b6d",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 153, "line": 15, "column": 11 },
                "end": { "index": 159, "line": 15, "column": 17 }
              }
            }
          },
          "alors": {
            "expression": { "constante": 20.0 },
            "_publicodes": {
              "id": "b77cadd31213da62b7f899720ffed558",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 173, "line": 16, "column": 14 },
                "end": { "index": 175, "line": 16, "column": 16 }
              }
            }
          }
        },
        {
          "si": {
            "expression": {
              "plus grand que": [ { "reference": "a" }, { "constante": 5.0 } ]
            },
            "_publicodes": {
              "id": "473bcb3410a6bbd94edcccd69fbfb130",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 186, "line": 17, "column": 11 },
                "end": { "index": 191, "line": 17, "column": 16 }
              }
            }
          },
          "alors": {
            "expression": { "constante": 5.0 },
            "_publicodes": {
              "id": "b5d120f3dec6ae5f2ba2893bb3a17e9f",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 205, "line": 18, "column": 14 },
                "end": { "index": 206, "line": 18, "column": 15 }
              }
            }
          }
        },
        {
          "sinon": {
            "expression": { "constante": 0.0 },
            "_publicodes": {
              "id": "95a36192060e9d880f5db801e6db4197",
              "position": {
                "file": "ok/rules.publicodes",
                "start": { "index": 220, "line": 19, "column": 14 },
                "end": { "index": 221, "line": 19, "column": 15 }
              }
            }
          }
        }
      ],
      "type": "nombre",
      "_publicodes": {
        "id": "8fe362411643b251a610d8aca4560619",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 111, "line": 12, "column": 1 },
          "end": { "index": 112, "line": 12, "column": 2 }
        }
      }
    },
    "e": {
      "public": true,
      "meta": { "une meta": "23", "une autre meta": "42" },
      "valeur": {
        "expression": {
          "addition": [ { "reference": "a" }, { "reference": "b" } ]
        },
        "_publicodes": {
          "id": "f33b11f611e9d51438777a9e184b62e0",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 297, "line": 25, "column": 11 },
            "end": { "index": 302, "line": 25, "column": 16 }
          }
        }
      },
      "_publicodes": {
        "id": "844331dfc70b1968c99373077a664a2c",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 222, "line": 20, "column": 1 },
          "end": { "index": 223, "line": 20, "column": 2 }
        }
      }
    },
    "f": {
      "expression": { "l'opposé de": { "reference": "e" } },
      "_publicodes": {
        "id": "5c2cf9465b8a4da43d605be877f5c5ec",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 306, "line": 26, "column": 4 },
          "end": { "index": 308, "line": 26, "column": 6 }
        }
      }
    },
    "g": {
      "valeur": {
        "expression": {
          "addition": [ { "reference": "b" }, { "reference": "g . here" } ]
        },
        "_publicodes": {
          "id": "03924aed1cd5b32e0b747c197063a03c",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 322, "line": 28, "column": 11 },
            "end": { "index": 330, "line": 28, "column": 19 }
          }
        }
      },
      "contexte": {
        "a": {
          "expression": { "constante": 2.0 },
          "_publicodes": {
            "id": "a7fce662a02402b0d6b6b2c9a45a5d38",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 370, "line": 32, "column": 8 },
              "end": { "index": 371, "line": 32, "column": 9 }
            }
          }
        },
        "b . c": {
          "expression": { "constante": 3.0 },
          "_publicodes": {
            "id": "7abb3d92dd7e9f96df6a0f0fbd3bfa65",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 383, "line": 33, "column": 12 },
              "end": { "index": 384, "line": 33, "column": 13 }
            }
          }
        },
        "g . here": {
          "expression": { "constante": 9.0 },
          "_publicodes": {
            "id": "082ffadbfb474a5833822e43ad1c5e27",
            "position": {
              "file": "ok/rules.publicodes",
              "start": { "index": 395, "line": 34, "column": 11 },
              "end": { "index": 396, "line": 34, "column": 12 }
            }
          }
        }
      },
      "_publicodes": {
        "id": "55ecf2e6ec4bf8f780ebb6c2ffb04d6e",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 309, "line": 27, "column": 1 },
          "end": { "index": 310, "line": 27, "column": 2 }
        }
      }
    },
    "g . here": {
      "expression": { "constante": 5.0 },
      "_publicodes": {
        "id": "6344820b5cea15cd9f9ae89f890d26e3",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 349, "line": 30, "column": 11 },
          "end": { "index": 350, "line": 30, "column": 12 }
        }
      }
    },
    "h": {
      "valeur": {
        "expression": { "constante": 30.0 },
        "_publicodes": {
          "id": "439933a2d52b3140456fbb11f32026d1",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 410, "line": 36, "column": 11 },
            "end": { "index": 412, "line": 36, "column": 13 }
          }
        }
      },
      "applicable si": {
        "expression": {
          "plus grand que": [ { "reference": "g" }, { "constante": 20.0 } ]
        },
        "_publicodes": {
          "id": "8102520afe3e49be59eabb6f48f4e2a0",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 430, "line": 37, "column": 18 },
            "end": { "index": 436, "line": 37, "column": 24 }
          }
        }
      },
      "_publicodes": {
        "id": "b32e47d930656334e33f9f30abb2db42",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 397, "line": 35, "column": 1 },
          "end": { "index": 398, "line": 35, "column": 2 }
        }
      }
    },
    "i": {
      "valeur": {
        "expression": { "constante": 30.0 },
        "_publicodes": {
          "id": "5e19f2faa2473fe942e32a0b505bb3c7",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 450, "line": 39, "column": 11 },
            "end": { "index": 452, "line": 39, "column": 13 }
          }
        }
      },
      "non applicable si": {
        "expression": {
          "plus grand que": [ { "reference": "g" }, { "constante": 20.0 } ]
        },
        "_publicodes": {
          "id": "dc8e97bdd0e666227512e91004be9f83",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 474, "line": 40, "column": 22 },
            "end": { "index": 480, "line": 40, "column": 28 }
          }
        }
      },
      "_publicodes": {
        "id": "39ef7c72c04159c3e79b842281b142bb",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 437, "line": 38, "column": 1 },
          "end": { "index": 438, "line": 38, "column": 2 }
        }
      }
    },
    "j": {
      "type": "nombre",
      "par défaut": {
        "expression": { "constante": 20.0 },
        "_publicodes": {
          "id": "5790b9a84ee0176fd62b82b263bf7780",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 513, "line": 43, "column": 15 },
            "end": { "index": 515, "line": 43, "column": 17 }
          }
        }
      },
      "_publicodes": {
        "id": "0db9cf0b42f886d503028905c45ad0d3",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 481, "line": 41, "column": 1 },
          "end": { "index": 482, "line": 41, "column": 2 }
        }
      }
    },
    "k": {
      "valeur": {
        "expression": { "constante": 4.0 },
        "_publicodes": {
          "id": "15c3b3142b47661da2d100eb66450a79",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 529, "line": 45, "column": 11 },
            "end": { "index": 530, "line": 45, "column": 12 }
          }
        }
      },
      "plafond": {
        "expression": { "constante": 2.3 },
        "_publicodes": {
          "id": "ebe77f7a0c7c413f1b10280aa409b2d7",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 542, "line": 46, "column": 12 },
            "end": { "index": 545, "line": 46, "column": 15 }
          }
        }
      },
      "_publicodes": {
        "id": "5a39da406ca6f0bf3da459d22ce9bbe1",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 516, "line": 44, "column": 1 },
          "end": { "index": 517, "line": 44, "column": 2 }
        }
      }
    },
    "l": {
      "valeur": {
        "expression": { "constante": 2.0 },
        "_publicodes": {
          "id": "db71091f7d9e19072edf62a7d26d17db",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 559, "line": 48, "column": 11 },
            "end": { "index": 560, "line": 48, "column": 12 }
          }
        }
      },
      "plancher": {
        "expression": { "constante": 3.0 },
        "_publicodes": {
          "id": "ee2f378c6a39c9371907c66985846da7",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 573, "line": 49, "column": 13 },
            "end": { "index": 574, "line": 49, "column": 14 }
          }
        }
      },
      "_publicodes": {
        "id": "9905384b977e3376b614c7b5a46e3131",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 546, "line": 47, "column": 1 },
          "end": { "index": 547, "line": 47, "column": 2 }
        }
      }
    },
    "m": {
      "arrondi": {
        "expression": { "constante": 2.3 },
        "_publicodes": {
          "id": "dc6ac4a75ccc369eaa630d8b66cfcb16",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 589, "line": 51, "column": 12 },
            "end": { "index": 592, "line": 51, "column": 15 }
          }
        }
      },
      "_publicodes": {
        "id": "62448cf8e4f8b18d795326dda6618667",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 575, "line": 50, "column": 1 },
          "end": { "index": 576, "line": 50, "column": 2 }
        }
      }
    },
    "n": {
      "arrondi à l'inférieur": {
        "expression": { "constante": 2.3 },
        "_publicodes": {
          "id": "64ee15ed43873c5bb3ad354a7d82ccbd",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 621, "line": 53, "column": 26 },
            "end": { "index": 624, "line": 53, "column": 29 }
          }
        }
      },
      "_publicodes": {
        "id": "d0dc1a7f2a347eeab312f142d080c8ba",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 593, "line": 52, "column": 1 },
          "end": { "index": 594, "line": 52, "column": 2 }
        }
      }
    },
    "o": {
      "arrondi au supérieur": {
        "expression": { "constante": 2.3 },
        "_publicodes": {
          "id": "c88fdeb6fe1ccc456c85cd30609855a9",
          "position": {
            "file": "ok/rules.publicodes",
            "start": { "index": 652, "line": 55, "column": 25 },
            "end": { "index": 655, "line": 55, "column": 28 }
          }
        }
      },
      "_publicodes": {
        "id": "f9a5a3b3d19dc0a50e22455a12b81339",
        "position": {
          "file": "ok/rules.publicodes",
          "start": { "index": 625, "line": 54, "column": 1 },
          "end": { "index": 626, "line": 54, "column": 2 }
        }
      }
    }
  }

  $ publicodes compile ok -o - | ../../scripts/get_functions.awk
  
  function _a(ctx, params) {
    return /** @type {number} */ (
      $ret("dfb3c6796b344957f44c2e7300f71dff", ctx, 10.)
    )
  
  function _b(ctx, params) {
    return /** @type {number} */ (
      $ret("969799a0c994d65e939da3be780d0195", ctx, $add(
        $ret("1ff95d8458d7e8c3805bee5a38563666", ctx, $ref("a", _a, ctx, params)),
        $ret("969799a0c994d65e939da3be780d0195", ctx, $add(
          $ret("dc73d7f790636accd6a65943f3ba6d45", ctx, $ref("b . c", _b_·_c, ctx, params)),
          $ret("a1082378de458a0d2c8decc8d4dee20d", ctx, 10.)))))
    )
  
  function _b_·_c(ctx, params) {
    return /** @type {number} */ (
      $ret("daf3899c4a95af7db08b393a4e4737b2", ctx, 55.)
    )
  
  function _d(ctx, params) {
    return /** @type {number} */ (
      $ret("8fe362411643b251a610d8aca4560619", ctx, $cond(
        $ret("8fe362411643b251a610d8aca4560619", ctx, $eq(
          $ret("ce6330212b75fecd5aca4ea0e6028c4f", ctx, $gt(
            $ret("1785c0b21efe65e10ef798faa4ffb9cd", ctx, $ref("a", _a, ctx, params)),
            () => $ret("48bdc204e02f3392c05eddf43f50e6d2", ctx, 20.))),
          $ret("8fe362411643b251a610d8aca4560619", ctx, true))), () => $ret("b77cadd31213da62b7f899720ffed558", ctx, 20.), () => $ret("8fe362411643b251a610d8aca4560619", ctx, $cond(
          $ret("8fe362411643b251a610d8aca4560619", ctx, $eq(
            $ret("4d433287ee14bc95b436b733ba724cfd", ctx, $gt(
              $ret("65c87e8ad6ba7cf9e4a2eaaf5559df5d", ctx, $ref("a", _a, ctx, params)),
              () => $ret("2aea6f0f1c6d9324992f1d790f4cd06f", ctx, 5.))),
            $ret("8fe362411643b251a610d8aca4560619", ctx, true))), () => $ret("b5d120f3dec6ae5f2ba2893bb3a17e9f", ctx, 5.), () => $ret("95a36192060e9d880f5db801e6db4197", ctx, 0.)))))
    )
  
  function _e(ctx, params) {
    return /** @type {number} */ (
      $ret("672e63fff982e829db31f419f4445ea8", ctx, $add(
        $ret("2a51ef40131b5d4b925319645cf8064f", ctx, $ref("a", _a, ctx, params)),
        $ret("ac04a8c86258551586e94b80f02042e1", ctx, $ref("b", _b, ctx, params))))
    )
  
  function _f(ctx, params) {
    return /** @type {number} */ (
      $ret("5c2cf9465b8a4da43d605be877f5c5ec", ctx, (-$ret("b459133a9ba93e0ee6c4c73e7b949d36", ctx, $ref("e", _e, ctx, params))))
    )
  
  function _g(ctx, params) {
    return /** @type {number} */ (
      $ret("a8ff20b7436fd8843345365055e4ecdd", ctx, ((ctx) => $ret("7061b46b082f75051869d8a2dc8bd771", ctx, $add(
        $ret("2f78fffa11d25bb2d53ab34dc6aceede", ctx, $ref("b", _b, ctx, params)),
        $ret("439ab6d7f3d024c60b1fcf74de5e33b2", ctx, $ref("g . here", _g_·_here, ctx, params)))))(
      			{
      				...ctx,
      					"a": $ret("a7fce662a02402b0d6b6b2c9a45a5d38", ctx, 2.),
      					"b . c": $ret("7abb3d92dd7e9f96df6a0f0fbd3bfa65", ctx, 3.),
      					"g . here": $ret("082ffadbfb474a5833822e43ad1c5e27", ctx, 9.),
      			}
      		))
    )
  
  function _g_·_here(ctx, params) {
    return /** @type {number} */ (
      $ret("6344820b5cea15cd9f9ae89f890d26e3", ctx, 5.)
    )
  
  function _h(ctx, params) {
    return /** @type {number} */ (
      $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, $cond(
        $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, $or(
          $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, (isNotDefined($ret("23c6e36864de4adae2ce9c382b6327b3", ctx, $gt(
            $ret("b0b6e8f3c1d22cd22ebc897e05ac49a4", ctx, $ref("g", _g, ctx, params)),
            () => $ret("056e109368d1d10d4ac012b85a13a2ba", ctx, 20.)))))),
          () => $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, $or(
            $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, $eq(
              $ret("23c6e36864de4adae2ce9c382b6327b3", ctx, $gt(
                $ret("b0b6e8f3c1d22cd22ebc897e05ac49a4", ctx, $ref("g", _g, ctx, params)),
                () => $ret("056e109368d1d10d4ac012b85a13a2ba", ctx, 20.))),
              $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, false))),
            () => $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, $eq(
              $ret("23c6e36864de4adae2ce9c382b6327b3", ctx, $gt(
                $ret("b0b6e8f3c1d22cd22ebc897e05ac49a4", ctx, $ref("g", _g, ctx, params)),
                () => $ret("056e109368d1d10d4ac012b85a13a2ba", ctx, 20.))),
              $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, NotApplicable))))))), () => $ret("feeb700e65c9f526e8388c6b5edc3244", ctx, NotApplicable), () => $ret("439933a2d52b3140456fbb11f32026d1", ctx, 30.)))
    )
  
  function _i(ctx, params) {
    return /** @type {number} */ (
      $ret("c32b258df8f84f9dc36e323da274c649", ctx, $cond(
        $ret("c32b258df8f84f9dc36e323da274c649", ctx, $or(
          $ret("c32b258df8f84f9dc36e323da274c649", ctx, (isNotDefined($ret("3ef2da5c187e4a830a05d6a5e23939c2", ctx, $gt(
            $ret("47f312c4a45d6c52f045e79f83fd265a", ctx, $ref("g", _g, ctx, params)),
            () => $ret("f2f8bec590ae9e84ffa7ecff353c8885", ctx, 20.)))))),
          () => $ret("c32b258df8f84f9dc36e323da274c649", ctx, $or(
            $ret("c32b258df8f84f9dc36e323da274c649", ctx, $eq(
              $ret("3ef2da5c187e4a830a05d6a5e23939c2", ctx, $gt(
                $ret("47f312c4a45d6c52f045e79f83fd265a", ctx, $ref("g", _g, ctx, params)),
                () => $ret("f2f8bec590ae9e84ffa7ecff353c8885", ctx, 20.))),
              $ret("c32b258df8f84f9dc36e323da274c649", ctx, false))),
            () => $ret("c32b258df8f84f9dc36e323da274c649", ctx, $eq(
              $ret("3ef2da5c187e4a830a05d6a5e23939c2", ctx, $gt(
                $ret("47f312c4a45d6c52f045e79f83fd265a", ctx, $ref("g", _g, ctx, params)),
                () => $ret("f2f8bec590ae9e84ffa7ecff353c8885", ctx, 20.))),
              $ret("c32b258df8f84f9dc36e323da274c649", ctx, NotApplicable))))))), () => $ret("5e19f2faa2473fe942e32a0b505bb3c7", ctx, 30.), () => $ret("c32b258df8f84f9dc36e323da274c649", ctx, NotApplicable)))
    )
  
  function _j(ctx, params) {
    return /** @type {number} */ (
      $ret("b36cf02d60960e30c3f43dbe9195d2e2", ctx, $cond(
        $ret("b36cf02d60960e30c3f43dbe9195d2e2", ctx, (isNotDefined($ret("0db9cf0b42f886d503028905c45ad0d3", ctx, $get("j", ctx, params))))), () => $ret("5790b9a84ee0176fd62b82b263bf7780", ctx, 20.), () => $ret("0db9cf0b42f886d503028905c45ad0d3", ctx, $get("j", ctx, params))))
    )
  
  function _k(ctx, params) {
    return /** @type {number} */ (
      $ret("9bbe9122ca5d11f46d169178b2e2e424", ctx, $cond(
        $ret("9bbe9122ca5d11f46d169178b2e2e424", ctx, $and(
          $ret("9bbe9122ca5d11f46d169178b2e2e424", ctx, $neq(
            $ret("ebe77f7a0c7c413f1b10280aa409b2d7", ctx, 2.3),
            $ret("9bbe9122ca5d11f46d169178b2e2e424", ctx, NotApplicable))),
          () => $ret("9bbe9122ca5d11f46d169178b2e2e424", ctx, $gt(
            $ret("15c3b3142b47661da2d100eb66450a79", ctx, 4.),
            () => $ret("ebe77f7a0c7c413f1b10280aa409b2d7", ctx, 2.3))))), () => $ret("ebe77f7a0c7c413f1b10280aa409b2d7", ctx, 2.3), () => $ret("15c3b3142b47661da2d100eb66450a79", ctx, 4.)))
    )
  
  function _l(ctx, params) {
    return /** @type {number} */ (
      $ret("3bf9c923c7ce9ce7af4afa65c8fbb48b", ctx, $cond(
        $ret("3bf9c923c7ce9ce7af4afa65c8fbb48b", ctx, $and(
          $ret("3bf9c923c7ce9ce7af4afa65c8fbb48b", ctx, $neq(
            $ret("ee2f378c6a39c9371907c66985846da7", ctx, 3.),
            $ret("3bf9c923c7ce9ce7af4afa65c8fbb48b", ctx, NotApplicable))),
          () => $ret("3bf9c923c7ce9ce7af4afa65c8fbb48b", ctx, $lt(
            $ret("db71091f7d9e19072edf62a7d26d17db", ctx, 2.),
            () => $ret("ee2f378c6a39c9371907c66985846da7", ctx, 3.))))), () => $ret("ee2f378c6a39c9371907c66985846da7", ctx, 3.), () => $ret("db71091f7d9e19072edf62a7d26d17db", ctx, 2.)))
    )
  
  function _m(ctx, params) {
    return /** @type {number} */ (
      $ret("62448cf8e4f8b18d795326dda6618667", ctx, $round("nearest", $ret("62448cf8e4f8b18d795326dda6618667", ctx, $get("m", ctx, params)), () => $ret("dc6ac4a75ccc369eaa630d8b66cfcb16", ctx, 2.3)))
    )
  
  function _n(ctx, params) {
    return /** @type {number} */ (
      $ret("d0dc1a7f2a347eeab312f142d080c8ba", ctx, $round("down", $ret("d0dc1a7f2a347eeab312f142d080c8ba", ctx, $get("n", ctx, params)), () => $ret("64ee15ed43873c5bb3ad354a7d82ccbd", ctx, 2.3)))
    )
  
  function _o(ctx, params) {
    return /** @type {number} */ (
      $ret("f9a5a3b3d19dc0a50e22455a12b81339", ctx, $round("up", $ret("f9a5a3b3d19dc0a50e22455a12b81339", ctx, $get("o", ctx, params)), () => $ret("c88fdeb6fe1ccc456c85cd30609855a9", ctx, 2.3)))
    )
