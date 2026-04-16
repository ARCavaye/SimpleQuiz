SimpleQuiz

SimpleQuiz should be written in an appropriate, modern web development framework.

It should store data in a sqlite database. Questions should be stored with the following feilds:
- question text
- Multiple choice answer A
- Multiple choice answer B
- Multiple choice answer C
- Multiple choice answer D
- ID of correct answer
- Question hint
- Question category
- Question difficulty

It should provide a form where one or more questions can be ingested in the form or one or more JSON objects containing all of the question database fields. These JSON objects should be validataed before being ingested.

SimpleQuiz should be able to generate multiple-choice quizes containing a customisable number of questions selected at random from the database. When generating a new quiz, the user should have the option to include or exclude questions of certain difficulty and/or category as defined in the question objects stored within the database.

Once a quiz has been generated, it should be displayed to the user, one question at a time. The user should be able to select their answer, and recieve immediate feedback as to wether they are correct or not. The question hint should be initially hidden, displayed only if the user requests it by interacting with a UI element. Once a quiz has been completed, the user should be shown their total correct answers, and a list of the categories of the questions they answered incorrectly. The quiz, the questions asked and the answers the user has chosen, should be stored in the database for future analysis.

