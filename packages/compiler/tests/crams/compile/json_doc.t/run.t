Valid json doc :

  $ publicodes compile ok -t json_doc -o -
  {
    "c": {
      "type": "binary_op",
      "unit": null,
      "id": "e5db019856d24f944f370a2e3ad4e572",
      "value": {
        "type": "add",
        "left": {
          "type": "number",
          "unit": null,
          "id": "6e5bbb8efadb9d58c60aa3e40bbd3bf7",
          "value": 3.0
        },
        "right": {
          "type": "number",
          "unit": null,
          "id": "d47997a309d031d8a5337ed7d9a90603",
          "value": 2.0
        }
      }
    },
    "b": {
      "type": "number",
      "unit": null,
      "id": "d0d89643968fa0bc30a83b1727431ff9",
      "value": 6.0
    },
    "a": {
      "type": "binary_op",
      "unit": null,
      "id": "5e493ac9904dcb6fcc3c5ef60bd62265",
      "value": {
        "type": "add",
        "left": {
          "type": "ref",
          "unit": null,
          "id": "c83f417767965172653528f51c8d8ef1",
          "value": "b"
        },
        "right": {
          "type": "ref",
          "unit": null,
          "id": "ae07295d447fb97c1ac178f81ef49ee3",
          "value": "c"
        }
      }
    }
  }

