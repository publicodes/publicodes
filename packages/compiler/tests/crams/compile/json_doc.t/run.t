Valid json doc :

  $ publicodes compile ok.publicodes -t json_doc -o -
  {
    "c": {
      "type": "binary_op",
      "unit": null,
      "id": "89389cc1cc9badb793987e80636b06fb",
      "value": {
        "type": "add",
        "left": {
          "type": "number",
          "unit": null,
          "id": "ed93b38a09aaeea6047444e03dda51f0",
          "value": 3.0
        },
        "right": {
          "type": "number",
          "unit": null,
          "id": "5147834a597086aed3ab64cedf4d9a29",
          "value": 2.0
        }
      }
    },
    "b": {
      "type": "number",
      "unit": null,
      "id": "8d6016e7d2b04bf39e02a892dbaee2f7",
      "value": 6.0
    },
    "a": {
      "type": "binary_op",
      "unit": null,
      "id": "f99da294b2b0809850b6ad931cc02cc1",
      "value": {
        "type": "add",
        "left": {
          "type": "ref",
          "unit": null,
          "id": "e265ab23d41503eac15d7d3e4b54d5dc",
          "value": "b"
        },
        "right": {
          "type": "ref",
          "unit": null,
          "id": "ea6fd93f26b7ae63c00ca0e59393e4f2",
          "value": "c"
        }
      }
    }
  }

