const problems = [
  {
    problemId: 1,
    title: "A+B Input-Output Practice - (I)",
    difficulty: "CAKEWALK",
    description:
      "Your task is to Calculate A + B. You are not allowed to use PLUS (+) Symbol to add two given numbers",
    prohibitedKeys: [
      { CPP: "+" },
      { Python: "+" },
      { Java: "+" },
      { Javascript: "+" },
    ],
    inputFormat:
      "Single line of input, containing a pair of integers A and B, separated by a space.",
    outputFormat: "Print A+B as answer",
    constraints: "-1000 <= A, B <= 1000",
    sampleInput: [{ tc1: "1 2\n" }, { tc2: "3 4" }],
    sampleOutput: [{ tc1: "3\n" }, { tc2: "7" }],
    score: "10",
  },
  {
    problemId: 2,
    title: "A-B Input-Output Practice - (I)",
    difficulty: "CAKEWALK",
    description: "Your task is to Calculate A - B.",
    prohibitedKeys: [],
    inputFormat:
      "Single line of input, containing a pair of integers A and B, separated by a space.",
    outputFormat: "Print A-B as answer",
    constraints: "-1000 <= A, B <= 1000",
    sampleInput: [{ tc1: "1 2\n" }, { tc2: "4 3" }],
    sampleOutput: [{ tc1: "-1\n" }, { tc2: "1" }],
    score: "10",
  },
];

const languages = ["cpp", "java", "python"];

const defaultCode = {
  cpp: `#include <iostream>
using namespace std;

int main() {
   // Your Code Here
    return 0;
}
`,
  java: `import java.util.*;

class NeoCode {
    public static void main(String[] args){
        // Your Code Here
    }
}`,
  python: `# Your Code Here`,
};

// const defaultCode = {
//   cpp: "// Your code goes here",
//   java: `import java.util.*;

// class NeoCode {
//     public static void main(String[] args){
//         // Write your code here
//     }
// }`,
//   python: "# Your code goes here",
//   javascript: "// Your code goes here",
// };

const themes = [
  "light",
  "vs-dark",
  "hc-black",
  // "all-hallows-eve",
  // "amy",
  // "birds-of-paradise",
  // "blackboard",
];

const categories = [
  "Array",
  "String",
  "Math",
  "Dynamic Programming",
  "Graph",
  "Pattern",
  "Web",
  "I/O",
];

const categoriesList = [
  { id: "array", name: "Array" },
  { id: "string", name: "String" },
  { id: "math", name: "Math" },
  { id: "dynamic-programming", name: "Dynamic Programming" },
  { id: "graph", name: "Graph" },
  { id: "pattern", name: "Pattern" },
  { id: "i-o", name: "I/O" },
  // { id: "web", name: "Web" },
];

const difficultyLevels = [
  "cakewalk",
  "easy",
  "easymedium",
  "medium",
  "mediumhard",
  "hard",
];

const difficultyLevelsProperties = {
  cakewalk: { score: "10", bgColor: "bg-blue-500", color: "text-blue-100" },
  easy: { score: "15", bgColor: "bg-green-500", color: "text-green-100" },
  easymedium: {
    score: "20",
    bgColor: "bg-orange-500",
    color: "text-orange-100",
  },
  medium: { score: "25", bgColor: "bg-amber-500", color: "text-amber-100" },
  mediumhard: { score: "30", bgColor: "bg-pink-500", color: "text-pink-100" },
  hard: { score: "35", bgColor: "bg-red-500", color: "text-red-100" },
};

const pagesCount = [10, 20, 30, 40, 50, 100];

const tags = [
  "Web-Development",
  "Front-End",
  "Back-End",
  "Open-Source",
  "Machine-Learning",
  "React-JS",
  "Node-JS",
  "Tech-News",
  "JavaScript-Tips",
  "UI-Design",
  "Array",
  "String",
  "String-DP",
  "Math",
  "Dynamic-Programming",
  "Graph",
  "Pattern",
  "Web",
  "Java",
  "Custom-Sort",
];

export {
  problems,
  languages,
  defaultCode,
  themes,
  categories,
  categoriesList,
  difficultyLevels,
  difficultyLevelsProperties,
  pagesCount,
  tags,
};
