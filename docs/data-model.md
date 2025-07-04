# The data model

Our internal set of objects and their relationships are described in this document.

## Introduction

The purpose of an internal data model for the application is that we want flexibility
to use any source of data(airtable, google spreadsheet, ...), and we want to be able to change the source of data without
having to alter the code for presenting it (the frontend). By using a consistent,
generic data model, we can modify, add or remove data sources as we please while only
having to face the challenge of mapping that specific APIs data structure into our own
model to make it available for our users.

Disclaimer: `*` denotes required attributes when objects are described.

## Questions

In the top level of the data model, we expect an array of questions. The philosophy of the current data model structure
is to separate the questions into three, distinct parts: required attributes, user submitted data and metadata.

* `id (string)*` - A unique identifier for the question.
* `question (string)*` - The text of the question being asked.
* `answers (array)` - An array of answers to the question.
* `comments (array)` - An optional array of comments to the question.
* `metadata (object)*` - Additional metadata related to the question and its answers.

Our goal is to secure that we have the bare minimum of information to be able to present a question to the user, and
have a way to store the answers and comments related to the question. The metadata object is necessary to be able to
present the question in a way that is understandable to the user, and to be able to store the answers in a way that is
consistent and easy to retrieve.

This also allows the creator of questions to supply very little information about the questions to get a schema
up and running, but also allows for a ton of flexibility to add more information about the questions if needed.

An example of the most basic version of a question object:
```json
  {
    "id": "001",
    "question": "What is the capital of Spain?",
    "metadata": {
      "answerMetadata": {
        "type": "TEXT_SINGLE_LINE"
      }
    }
  }
```

### Question Metadata

Without a unique identifier or a question text it doesn't really qualify as a usable question, but you also have to
provide a minimum amount of metadata to be able to use the question in the application. The metadata object for a
question contains the following fields:

* `answerMetadata (object)*` - Metadata related to the answers of the question.
  * `type (string)*` - The type of answer the question expects. Possible values are:
    * `TEXT_SINGLE_LINE` - A single line of text.
    * `TEXT_MULTI_LINE` - Multiple lines of text.
    * `SELECT_SINGLE` - A single choice from a list of options.
    * `SELECT_MULTIPLE` - Multiple choices from a list of options.
  * `options (array)` - An array of options to choose from. Only required if the type is `SELECT_SINGLE` or `SELECT_MULTIPLE`.
* `optionalFields (array)` - An array of optional fields that can be used to provide additional information about the question.

The `answerMetadata` object is required because it is necessary to know what format the question should
be answered in. This achieves the possibility of having questions with more concrete answers, multiple answer options and different types
of answers in the same schema.

An example of an answer metadata object that offers options to pick from:
```json
{
  "type": "SELECT_SINGLE",
  "options": [
    "Madrid",
    "Barcelona",
    "Seville",
    "Valencia"
  ]
}
```

The optional fields are a way to provide additional information about the question. Common use cases can be to provide
more information about the criticality of answering the question, categorizing the question or giving more detailed
descriptions. The optional field object for questions looks as follows:

* `key (string)*` - A unique identifier for the optional field.
* * `value (string)*` - The value of the optional field.
* `type (string)*` - The type of the optional field. Possible values are:
  * `OPTION_MULTIPLE` - Multiple values from a list of options.
  * `OPTION_SINGLE` - A single option from a list of options.
  * `TEXT` - Some text to display. Currently only supports ASCII characters.
* `options (array)` - An array of options to choose from. Only required if the type is `OPTION_SINGLE` or `OPTION_MULTIPLE`.

An example of an optional field object where the value is chosen from a list of options:
```json
{
  "key": "criticality",
  "value": "High",
  "type": "OPTION_SINGLE",
  "options": [
    "High",
    "Medium",
    "Low"
  ]
}
```

### Answer

The answer object contains the information about an answer to a question. These should generally not be pre-supplied by
the creator of the question, but rather be filled in by the users of the application. As they have to be stored in a
database, and later retrieved based on which question they are related to, they have the following fields:
* `actor (string)*` - The identification of the person who answered the question.
* `answer (string)*` - The answer to the question.
* `questionId (string)*` - The unique identifier of the question the answer is related to.
* `question (string)*` - The text of the question the answer is related to.
* `team (string)` - The team the actor represented when answering the question.
* `updated* (string)*` - The timestamp of when the answer was last updated.

The answer object contains some redundant information when you use it in the context of a question, but it is necessary
to have this information to be able to display the answer in the context of a question without having to fetch the question
object as well. It encapsulates all of its necessary information in one object.

Here is an example of an answer object:
```json
{
  "actor": "Don Quixote",
  "answer": "Madrid",
  "questionId": "001",
  "question": "What is the capital of Spain?",
  "updated": "2021-01-01T00:00:00Z"
}
```

### Comment
The comment object contains the information about a comment to a question. They follow the same philosophy as the answer
objects. They have the following fields:

* `actor (string)*` - The identification of the person who commented on the question.
* `comment (string)*` - The comment to the question.
* `questionId (string)*` - The unique identifier of the question the comment is related to.
* `updated* (string)*` - The timestamp of when the comment was last updated.

Here is an example of a comment object:
```json
{
  "actor": "Sancho Panza",
  "comment": "Should the question ask about Spain when only Catalan is relevant for our team?",
  "questionId": "001",
  "updated": "2021-01-01T00:00:00Z"
}
```

### Table

It is also possible to extract the questions into a table format, as this is one of the most effective ways to communicate
a question with tons of extra information. The table object contains the following fields:

* `id (string)*` - A unique identifier for the table.
* `name (string)*` - The name of the table.
* `fields (array)*` - An array listing all the optional fields that are available for the questions in the table.
* `records (array)*` - An array of records, each record containing a single question object.

The fields property is supposed to be a collection of the metadata about all optional fields that occur in the questions
in the table. Each field object contains the following fields:
* `type (string)*` - The type of the field. The same as the type in the optional field object.
* `name (string)*` - The name of the field.
* `options (array)` - An array of options to choose from. Only required if the type is `OPTION_SINGLE` or `OPTION_MULTIPLE`.

Here is an example of a field object:
```json
{
  "type": "OPTION_SINGLE",
  "name": "Priority",
  "options": [
    "High",
    "Medium",
    "Low"
  ]
}
```
Here is an example of a table object with questions containing different optional fields:
```json
{
  "id": "table001",
  "name": "Geography",
  "fields": [
    {
      "type": "OPTION_SINGLE",
      "name": "Criticality",
      "options": [
        "High",
        "Medium",
        "Low"
      ]
    },
    {
      "type": "OPTION_MULTIPLE",
      "name": "Group",
      "options": [
        "Team1",
        "Team2",
        "Team3"
      ]
    }
  ],
  "records": [
    {
      "id": "Z-422",
      "question": "What is the capital of Spain?",
      "answers": [
        {
          "actor": "Don Quixote",
          "answer": "Madrid",
          "questionId": "Z-422",
          "question": "What is the capital of Spain?",
          "updated": "2021-01-01T00:00:00Z"
        }
      ],
      "comments": [
        {
          "actor": "Sancho Panza",
          "comment": "I think it's Barcelona",
          "questionId": "Z-422",
          "updated": "2021-01-01T00:00:00Z"
        }
      ],
      "metadata": {
        "answerMetadata": {
          "type": "TEXT_SINGLE_LINE"
        },
        "optionalFields": {
            "key": "Criticality",
            "value": "High",
            "type": "OPTION_SINGLE",
            "options": [
                "High",
                "Medium",
                "Low"
            ]
            
        }
      }
    },
    {
      "id": "Z-423",
      "question": "What is the capital of France?",
      "answers": [],
      "metadata": {
        "answerMetadata": {
          "type": "SELECT_SINGLE",
          "options": [
            "Paris",
            "Lyon",
            "Marseille",
            "Toulouse"
          ]
        },
        "optionalFields": {
          "key": "group",
          "value": "Team1",
          "type": "OPTION_MULTIPLE",
            "options": [
                "Team1",
                "Team2",
                "Team3"
            ]
        }
      }
    }
  ]
}
```