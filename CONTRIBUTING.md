# Contributing

Thanks for helping. Everything is Markdown, and small fixes are the most valuable contributions.

- **Found a mistake?** Open an issue or a pull request with a link to a primary source.
- **Improving a lesson?** Follow [lessons/STYLE.md](lessons/STYLE.md). Write in your own words, never
  copy or closely paraphrase another course, book or article, and only cite pages you have opened.
- **Adding an incident?** Add it to [sources/incidents/](sources/incidents/) with the company's own
  postmortem or an official report as the source.

Before opening a pull request, run the checks for the lessons you changed:

```bash
python3 tools/check_sources.py lessons/sd/caching.md
python3 lessons/check_practice.py lessons/sd/caching.md
cd tools && npm install && node check_diagrams.js
python3 site/build.py
```

By contributing, you agree that your lesson and curriculum contributions are licensed under
CC BY 4.0 and your code contributions under the MIT License, as described in the README.
Be kind and constructive in issues and reviews.
