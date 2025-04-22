import React from "react";
import { LuTrash2 } from "react-icons/lu";

import { difficultyLevelsProperties } from "../../Common/constants";

const ProblemCard = ({ problemDetails, onProblemSelect, onRequestDelete }) => {
  // console.log(problemDetails);
  const { id, title, score, difficulty } = problemDetails;
  return (
    <div className="w-full flex justify-center items-center space-x-2 my-3">
      <button
        className="w-full flex items-center rounded-lg px-3 py-2 bg-black/70 hover:bg-white/5 border border-white/10 text-white/80 hover:text-white transition ease-out duration-300"
        onClick={() => onProblemSelect(id)}
      >
        <div className="w-2/3 text-start">
          <h1>{title}</h1>
        </div>
        <div className="w-1/3 flex justify-end items-center gap-3">
          <p className="text-sm ">Score: {score}</p>
          <p className="text-sm">
            Difficulty:{"  "} &nbsp;
            <span
              className={`p-[1px] px-[4px] text-white font-bold text-xs rounded-md bg- ${difficultyLevelsProperties[difficulty].bgColor} ${difficultyLevelsProperties[difficulty].color}`}
            >
              {difficulty.toUpperCase()}
            </span>
          </p>
        </div>
      </button>
      <button
        className="text-red-500 border border-red-500 rounded-lg p-1 hover:text-red-600 transition-colors duration-300"
        onClick={() =>
          onRequestDelete(id, `Are you sure you want to delete '${title}'?`)
        }
      >
        <LuTrash2 />
      </button>
    </div>
  );
};

export default ProblemCard;
