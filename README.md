# Rest Time

Online focus workspace with a local account database. This repository root contains the deployed static frontend. GitHub Pages is published from the main branch, repository root.

## Local account service

Download `Rest-Time-GitHub-Pages.zip` from this repository and extract it. Open Terminal in its `rest-time` folder and run:

```sh
python3 server.py --port 8000 --origin https://eddysun1712-commits.github.io
```

Keep the helper running, open the online Rest Time website, and sign up/log in. Allow local-network access if your browser prompts you. Accounts and data are stored in the local `runtime/rest-time.sqlite3` database. The online page calls `http://127.0.0.1:8000`, which means the computer opening the site. No cloud account database is used. The archive includes all server, processor, frontend source and checks.

The original frontend source in the archive uses an assets/ folder; the deployed root uses the same assets at root. No runtime databases or keys are in this repository.

DeepSeek, real sensor inference, password recovery, JD login and the sample-data demo remain explicit placeholders. Missing camera inference code and trained model weights are needed for live sensor scoring.

All five screens, session timers, two percentage/time graphs, JSON import, language and sound controls, and the chat panel are included.

The RestTime logo was supplied by the user. The DeepSeek symbol comes from https://github.com/deepseek-ai/DeepSeek-LLM/blob/main/images/logo.svg.
