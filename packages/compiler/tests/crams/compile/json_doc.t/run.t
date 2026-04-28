Valid json doc :

  $ publicodes compile ok.publicodes -t json_doc -o -
  {
    "c": {
      "type": "binary_op",
      "unit": null,
      "id": "aae73360930d0422e6c3a10d65b811cb",
      "value": {
        "type": "add",
        "left": {
          "type": "number",
          "unit": null,
          "id": "dba8dd4fd8e40eb951b977efb5712219",
          "value": 3.0
        },
        "right": {
          "type": "number",
          "unit": null,
          "id": "f0c62645268511c2548b36f3952052ad",
          "value": 2.0
        }
      }
    },
    "b": {
      "type": "number",
      "unit": null,
      "id": "fdfbc6c3ad273cfb5ee80b20b298783a",
      "value": 6.0
    },
    "a": {
      "type": "binary_op",
      "unit": null,
      "id": "691a182b306a4c3610eeb6117e2df718",
      "value": {
        "type": "add",
        "left": {
          "type": "ref",
          "unit": null,
          "id": "e320dd6fbdf78d83264b24f07128c328",
          "value": "b"
        },
        "right": {
          "type": "ref",
          "unit": null,
          "id": "3b11d6eaccc47c3d8dff347797706a93",
          "value": "c"
        }
      }
    }
  }

