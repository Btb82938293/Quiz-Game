import "./styles.css";
import React, { useEffect } from "react";
import { useState } from "react";
import { nanoid } from "nanoid";
import Question from "./Question";
import Answer from "./Answer";
import Confetti from "react-confetti";

export default function App() {
  const [myData, setMyData] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  function startGame() {
    setIsStarted((prevIsStarted) => !prevIsStarted);
  }

  //Fetch Data from an API
  useEffect(() => {
    fetch(
      "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple"
    )
      .then((res) => res.json())
      .then((data) =>
        setMyData(
          //Map data to add an id, boolean isSelected, boolean isCorrect, boolean isOver
          data.results.map((quest) => ({
            ...quest,
            id: nanoid(),
            question: quest.question.replace(/&[#A-Za-z0-9]+;/gi, ""),
            incorrect_answers: [
              ...quest.incorrect_answers,
              quest.correct_answer
            ]
              .sort()
              .map((answer) => ({
                answer: answer.replace(/&[#A-Za-z0-9]+;/gi, ""),
                isSelected: false,
                id: nanoid(),
                isCorrect: answer === quest.correct_answer ? true : false,
                isOver: false
              }))
          }))
        )
      );
  }, []);

  //Creating Question element
  const questEls = myData.map((elem, index) => {
    const question = <Question question={elem.question} key={index} />;
    const answers = elem.incorrect_answers.map((answer) => {
      return (
        <Answer
          isSelected={answer.isSelected}
          answer={answer.answer}
          key={answer.id}
          id={answer.id}
          idQ={elem.id}
          select={select}
          isCorrect={answer.isCorrect}
          isOver={answer.isOver}
        />
      );
    });
    return (
      <div className="question">
        <div className="questBlock">{question}</div>
        <div className="ansBlock">{answers}</div>
      </div>
    );
  });

  //function for selecting answers
  function select(id, idQ) {
    setMyData((prevMyData) =>
      prevMyData.map((quest) => ({
        ...quest,
        incorrect_answers: quest.incorrect_answers.map((answer) =>
          id === answer.id
            ? {
                ...answer,
                isSelected: !answer.isSelected
              }
            : {
                ...answer,
                isSelected: quest.id === idQ ? false : answer.isSelected
              }
        )
      }))
    );
  }
  //setting logic for checking the final answers
  const correctAnsAr = myData.map((question) => {
    return question.correct_answer;
  });
  const chosenAnsAr = myData
    .map((question) => {
      return question.incorrect_answers
        .filter((answer) => answer.isSelected === true)
        .map((answer) => answer.answer);
    })
    .flat();

  // get the amount of correct answers
  let countCorAns = 0;
  function corAnsAmount() {
    for (let i = 0; i < correctAnsAr.length; i++) {
      if (chosenAnsAr.includes(correctAnsAr[i])) {
        countCorAns += 1;
      }
    }
    return countCorAns / 2;
  }
  corAnsAmount();

  function checkAnswers() {
    const str1 = String(correctAnsAr.sort());
    const str2 = String(chosenAnsAr.sort());
    return str1 === str2;
  }
  const [results, setResults] = useState("");
  const [message, setMessage] = useState("Quiz Game");
  const [isPlayed, setIsPlayed] = useState(false);

  function check() {
    if (correctAnsAr.length !== chosenAnsAr.length && !checkAnswers()) {
      setResults("Please answer all the questions");
    } else if (correctAnsAr.length === chosenAnsAr.length && checkAnswers()) {
      setIsWon(true);
      setResults(`Your score is ${countCorAns} out of 5!`);
      setMessage("Congrats on winning the game!🎉🎉🎉");
      setMyData((prevMyData) =>
        prevMyData.map((question) => ({
          ...question,
          incorrect_answers: question.incorrect_answers.map((answer) => ({
            ...answer,
            isOver: !answer.isOver
          }))
        }))
      );
    } else if (correctAnsAr.length === chosenAnsAr.length && !checkAnswers()) {
      setIsPlayed((prevIsPlayed) => !prevIsPlayed);
      setResults(
        `Your score is ${countCorAns} out of 5. Would you like to try once more?`
      );
      setMessage("Not all the answers are correct..");
      setMyData((prevMyData) =>
        prevMyData.map((question) => ({
          ...question,
          incorrect_answers: question.incorrect_answers.map((answer) => ({
            ...answer,
            isOver: !answer.isOver
          }))
        }))
      );
    }
  }
  //function for resetting the game
  function newGame() {
    if (isWon) {
      setIsWon((prevIsWon) => !prevIsWon);
    }
    if (isPlayed) {
      setIsPlayed((prevIsPlayed) => !prevIsPlayed);
    }
    if (isWon || isPlayed) {
      setMessage("Quiz Game");
      setResults("");
      setMyData((prevMyData) =>
        prevMyData.map((quest) => ({
          ...quest,
          incorrect_answers: quest.incorrect_answers.map((ans) => ({
            ...ans,
            isSelected: false,
            isOver: false
          }))
        }))
      );
    }
  }

  return (
    <main>
      {!isStarted ? (
        <div className="mainPage">
          <h1 className="mainText">Quizzical</h1>
          <p className="questText">
            Enjoy the game{" "}
            <span role="img" aria-label="pic">
              🙃
            </span>
          </p>
          <button onClick={startGame} className="btn">
            Start quiz
          </button>
        </div>
      ) : (
        <div className="quiz">
          {isWon && <Confetti />}
          <h1 className="mainText">{message}</h1>
          <div className="questCont">{questEls}</div>
          {!isWon && !isPlayed && (
            <button className="btn" onClick={check}>
              Check Answers
            </button>
          )}
          {isWon || isPlayed ? (
            <button onClick={newGame} className="btn">
              Play again
            </button>
          ) : (
            ""
          )}
          <p className="addText">{results}</p>
        </div>
      )}
    </main>
  );
}
