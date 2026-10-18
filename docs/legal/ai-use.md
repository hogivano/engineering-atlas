# Responsible AI and Employment Use

Last updated: 2026-10-16

## How AI was used to make the content

The lessons, exercises, quizzes and mock-interview rubrics were drafted and researched with AI
assistance (Anthropic's Claude), under the maintainer's direction. They are checked against cited
primary sources, by automated tests and by a separate AI fact-checking pass. Human review is
ongoing. Treat the content as study material, not professional advice, and report errors on GitHub.

## What the AI does

Engineering Atlas has two AI features, both using a third-party language model (currently OpenAI, default model gpt-4o-mini):

- **AI mock interviewer**: asks the lesson's interview question, follows up on your answers and gives a debrief against a rubric written for that lesson.
- **AI grader**: scores answers in AI-graded, time-limited assessments against a rubric, and may lead to a certificate.

With the site's own key, the prompt and rubric are built on our server and only your typed answers and the lesson identifier are sent to the model. If you add your own OpenAI key in AI settings, your browser builds the same prompt and sends it, with your answers, directly to OpenAI under your account. We do not send your name, email or account ID, and the model does not see your CV, photo, voice or other personal profile data.

## What it does not do

- It does not verify who took the assessment or whether they had help.
- It does not run your code or check facts against a reference implementation, unless an assessment says so.
- It does not compare you with other people, rank candidates or predict job performance.
- It does not make decisions. It produces practice feedback and a score.

## Known limitations and bias risks

- **Errors**: the model can be confidently wrong, miss a correct answer, or reward a fluent but wrong one.
- **Inconsistency**: the same answer can get a different score on another attempt.
- **Language and style bias**: answers in non-native English, short answers, or unusual but valid approaches may score lower. Language models reflect biases in their training data.
- **Accessibility**: time limits and text-only input can disadvantage people who use assistive technology, have dyslexia, or think best out loud.
- **Narrow scope**: a short written assessment measures a slice of knowledge on one day, not engineering skill as a whole.

## Use in hiring, promotion and other employment decisions

Do not use Atlas scores or certificates alone, or as the deciding factor, for hiring, promotion, pay, performance review, discipline or dismissal. If you use them at all:

- treat them as one input among several, with a qualified person reviewing the person's actual answers;
- tell the people concerned how you will use them, and offer an alternative or reasonable adjustments (for example extra time) on request;
- monitor outcomes for differences between groups;
- give people a way to contest the result.

Why this matters:

- **EU AI Act**: AI systems used for recruitment or selection, or to make decisions on promotion, termination, task allocation or to monitor and evaluate workers, are classified as high-risk (Article 6 and Annex III, point 4). Atlas is not designed, tested or documented as a high-risk system and must not be used as one. An employer that does so may take on provider or deployer duties, including human oversight, transparency and informing workers.
- **GDPR / UK GDPR Article 22**: people have the right not to be subject to decisions based solely on automated processing that significantly affect them.
- **United States**: under Title VII, the ADA and the ADEA, employers are responsible for discriminatory effects of selection tools they use, including AI tools supplied by others, as the EEOC's technical assistance on AI and disparate impact and on the ADA has explained. Some jurisdictions (for example New York City Local Law 144) add bias-audit and notice rules.

Organisations using the organisation features agree to follow this statement under the [Terms](terms.md) and [Data Processing Agreement](dpa.md).

## Contesting a score

If you think a score or debrief is wrong:

1. Retake the practice or assessment if retakes are allowed.
2. Ask for a human review: email [me@hogivano.dev](mailto:me@hogivano.dev) with the certificate link or assessment name, date and the reason. Do not post personal data in a public GitHub issue.
3. We will review the answers you are willing to share against the rubric and reply within 30 days. We may correct or reissue the certificate.

If an organisation used your score, also ask that organisation for a human review of its decision.

## Feedback

Report wrong, biased or harmful AI output by email or at https://github.com/hogivano/engineering-atlas/issues.
