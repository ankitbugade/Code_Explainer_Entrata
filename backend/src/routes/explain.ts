// src/routes/explain.ts
import { Router } from 'express';
import { z } from 'zod';
import * as acorn from 'acorn';
import { randomUUID } from 'crypto';
import { spawnSync } from 'child_process';
import { createGroqClient } from '../../utils/groqClient';
import { EXPLAINER_PROMPT, JUDGE_PROMPT } from '../../utils/prompts';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

export const explainRouter = Router();

// Protect all explain routes
// auth middleware removed – explain endpoint is now public

const requestSchema = z.object({
  language: z.enum(['python', 'javascript']),
  code: z.string().min(1, 'Code cannot be empty'),
  // optional id for upsert
  id: z.string().uuid().optional(),
});

function parseLLMResponse(content: string) {
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

explainRouter.post('/', async (req, res) => {
  try {
    const parsed = requestSchema.parse(req.body);
    const { language, code, id } = parsed;
    let metadata = '';

    if (language === 'javascript') {
      try {
        const ast = acorn.parse(code, { ecmaVersion: 'latest' });
        const functions: string[] = [];
        function walk(node: any) {
          if (!node) return;
          if (node.type === 'FunctionDeclaration' && node.id?.name) functions.push(node.id.name);
          for (const key of Object.keys(node)) {
            const child = node[key];
            if (Array.isArray(child)) child.forEach(walk);
            else if (child && typeof child.type === 'string') walk(child);
          }
        }
        walk(ast);
        if (functions.length) metadata = `Detected Functions: ${functions.join(', ')}`;
      } catch (err: any) {
        return res.status(400).json({ error: `JavaScript Syntax Error: ${err.message}` });
      }
    } else if (language === 'python') {
      try {
        const result = spawnSync('python', ['-c', 'import ast, sys; ast.parse(sys.stdin.read())'], {
          input: code,
          encoding: 'utf-8'
        });
        if (result.status !== 0) {
          return res.status(400).json({ error: `Python Syntax Error:\n${result.stderr || 'Invalid syntax'}` });
        }
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.warn('Python is not installed or not in PATH, skipping python validation');
        } else {
          return res.status(500).json({ error: `Internal Server Error during validation: ${err.message}` });
        }
      }
    }

    const client = createGroqClient();
    const explainerPrompt = EXPLAINER_PROMPT(code + (metadata ? '\n\n' + metadata : ''), language);
    const explainerResponse = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: explainerPrompt }],
      temperature: 0.1,
    });
    
    // Parse LLM response carefully to strip out markdown backticks
    const explainerContent = explainerResponse.choices[0].message.content || '{}';
    const explainerJson = parseLLMResponse(explainerContent);

    const judgePrompt = JUDGE_PROMPT(code, JSON.stringify(explainerJson, null, 2));
    const judgeResponse = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: judgePrompt }],
      temperature: 0.1,
    });
    
    const judgeContent = judgeResponse.choices[0].message.content || '{}';
    const judgeJson = parseLLMResponse(judgeContent);

    const finalResult = judgeJson.score >= 90 ? {
      ...explainerJson,
      confidence: judgeJson.score,
    } : {
      ...explainerJson,
      explanation: judgeJson.correctedExplanation,
      confidence: judgeJson.score,
    };

    const snippetId = id ?? randomUUID();
    await db('snippets')
      .insert({
        id: snippetId,
        language,
        code,
        summary: finalResult.summary,
        explanation: finalResult.explanation,
        optimized_code: finalResult.optimizedCode,
        time_complexity: finalResult.timeComplexity,
        space_complexity: finalResult.spaceComplexity,
        confidence: finalResult.confidence,
      })
      .onConflict('id')
      .merge();

    res.json({ id: snippetId, ...finalResult });
  } catch (err: any) {
    const message = err instanceof z.ZodError ? err.errors.map((e) => e.message).join(', ') : err.message;
    res.status(400).json({ error: message });
  }
});