// backend/utils/prompts.js

function EXPLAINER_PROMPT(code, language) {
  return `You are an expert code explainer. Analyze the following ${language} code and provide a detailed explanation.

Code:
\`\`\`${language}
${code}
\`\`\`

Please respond with a valid JSON object (and ONLY the JSON, no other text) with the following structure:
{
  "title" : "A short title below 3-4 words for whole code",
  "summary": "A brief one-line summary of what this code does",
  "explanation": "A detailed explanation of the code in bullet points, including what it does, how it works, and important concepts",
  "optimizedCode": "An optimized version of the code with improvements (if applicable), or the original code if already optimal",
  "timeComplexity": "Big O time complexity analysis with no explaination or short explaination below 15 words",
  "spaceComplexity": "Big O space complexity analysis with no explaination or short explaination below 15 words"
}

Make sure the JSON is valid and parseable.`;
}

function JUDGE_PROMPT(code, explanation) {
  return `You are a code quality expert. Judge the quality and accuracy of the following code explanation.

Code:
\`\`\`
${code}
\`\`\`

Explanation provided:
${explanation}

Evaluate the explanation for:
1. Correctness - Does it accurately describe what the code does?
2. Completeness - Does it cover all important aspects?
3. Clarity - Is it easy to understand?
4. Technical accuracy - Are the complexity analyses correct?

Please respond with a valid JSON object (and ONLY the JSON, no other text) with the following structure:
{
  "score": <number between 0 and 100>,
  "correctedExplanation": "If score < 90, provide a corrected/improved version of the explanation. Otherwise, this can be an empty string."
}

Make sure the JSON is valid and parseable.`;
}

module.exports = { EXPLAINER_PROMPT, JUDGE_PROMPT };
