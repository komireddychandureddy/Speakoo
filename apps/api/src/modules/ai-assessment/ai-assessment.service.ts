import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

/**
 * TODO (Phase 2): Integrate an AI/ML provider (e.g. OpenAI) to evaluate learner
 * responses and map them to a CEFR level (A1–C2).
 */
@Injectable()
export class AiAssessmentService {
  private readonly logger = new Logger(AiAssessmentService.name);

  constructor(private readonly config: ConfigService) {}

  async assessCefrLevel(
    userId: string,
    dto: CreateAssessmentDto,
  ): Promise<{ userId: string; cefrLevel: string }> {
    this.logger.log(`Assessing CEFR level for user ${userId} with ${dto.answers.length} answers`);

    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        const prompt = [
          'Assess the learner CEFR level from A1, A2, B1, B2, C1, or C2.',
          'Return only the CEFR code (for example: B1).',
          'Answers:',
          ...dto.answers.map((answer, index) => `${index + 1}. ${answer}`),
        ].join('\n');

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            temperature: 0,
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const raw = String(response.data?.choices?.[0]?.message?.content ?? '').toUpperCase();
        const match = raw.match(/\b(A1|A2|B1|B2|C1|C2)\b/);
        if (match) {
          return { userId, cefrLevel: match[1] };
        }
      } catch (error) {
        this.logger.warn(`OpenAI CEFR assessment failed; falling back to heuristic: ${String(error)}`);
      }
    }

    const totalChars = dto.answers.reduce((sum, answer) => sum + answer.trim().length, 0);
    const avgChars = totalChars / Math.max(1, dto.answers.length);

    let cefrLevel = 'A1';
    if (avgChars >= 120) cefrLevel = 'C1';
    else if (avgChars >= 90) cefrLevel = 'B2';
    else if (avgChars >= 60) cefrLevel = 'B1';
    else if (avgChars >= 30) cefrLevel = 'A2';

    return { userId, cefrLevel };
  }
}
