# Rest Time AI integration

## 使用 / Use

The GitHub Pages website calls the public backend automatically when a work session starts. No ChatGPT login, popup window, API-key entry, or Terminal is required. Local Rest Time accounts and personal files remain local. The backend accepts only its fixed focus-assistant endpoint and model, validates responses, limits input to 64 KB and output to 1,800 tokens, and stores the API key as a server secret.

Durable limits: 480 requests per UTC day across the service, 120 per hour and 10 per minute per network address. Counters survive restarts. Hashed network-address buckets expire automatically; chats and sensor data are not stored in the backend database. Requests rejected by the provider still consume quota. These limits cap requests, not dollars. Origin filtering only isolates browser callers; it does not authenticate non-browser clients.

账户密码、密码哈希、本地文件夹句柄不发给 AI。发送个人偏好、会话指数与统计、最近对话及总结。网络服务会收到这些输入；本地保存不代表 AI 推理在本机进行。演示始终使用明确标记的本地脚本，不消耗 API 配额。

## Session lifecycle

`start → message / observe → end_checkin → summary`

- Start asks for goal, planned duration, energy.
- Observe runs approximately every 60 seconds while the active page is visible, with no overlapping requests. Background tabs may delay checks; this is not a closed-browser notification service.
- End immediately freezes the elapsed timer. The user can add completion/interruption/feeling notes or skip them before requesting a summary.
- Invalid, truncated or failed output is rejected and shows a retry option. An error never manufactures an AI answer.
- Summary and allowed personal preference updates are saved to the selected local account. No profile updates occur in demo mode.

## Output contract (both languages)

```json
{
  "version": 1,
  "event": "start",
  "language": "zh",
  "action": "ask_setup",
  "message": "这次准备完成什么？",
  "questions": [{"id":"goal","text":"本次目标是什么？"}],
  "summary": null,
  "profile_patch": {}
}
```

`language`: `zh` or `en`. Machine keys remain English; user-facing text follows the selected language. `action`: `ask_setup`, `continue`, `quick_reset`, `rest`, `ask_wrapup`, `summary`, `refocus`.

For summary, `summary` is `{headline, completed:[], patterns:[], next_steps:[]}`. Profile updates are restricted to user-stated `work_preferences`, `rest_preferences`, `notes`; executable fields and account changes are rejected.

## Test provider and DeepSeek switch

The relay confirmed `gpt-5.6-luna`; six live synthetic checks passed: Chinese/English setup, Chinese observation, English off-topic redirection, Chinese wrap-up inquiry, English summary. This is the test provider's model ID, not a claim about public OpenAI product availability. No DeepSeek model appeared in the relay's tested `/v1/models` list.

To use official DeepSeek, change the **server-side** endpoint to `https://api.deepseek.com/chat/completions`, supply a DeepSeek-issued key through the private Site environment variables, and choose a model supported by that account. Current official docs list `deepseek-flash` and `deepseek-v4-pro`. For short focus guidance, non-thinking mode can be requested with `thinking: {"type":"disabled"}`. Keep JSON mode, the schema prompt, response validation, and failure handling. Update the visible provider label when switching. The relay key is not assumed to work on the official endpoint.

If continuing with the relay, first confirm it lists a DeepSeek model and use its exact ID. No frontend key changes are needed.

Official references:
- https://api-docs.deepseek.com/guides/json_mode/
- https://api-docs.deepseek.com/api/create-chat-completion/

## Demo scope

32 synthetic paired output fixtures use the uploaded camera/wrist JSON format and the original fusion rules: 0.4/0.6 source weights multiplied by quality; three consecutive elevated windows for the persistent rest state; both invalid sources reset history. The sequence includes normal, rising, sustained high, missing and recovery windows. Each minute replays in two seconds, with pause/step controls. The JSON input is visible in Help → View & import data.

Without AI connected, explicitly labeled scripts demonstrate the interaction. The demo never calls the public backend or overwrites personal records. The original upload lacks a complete camera inference implementation and compatible trained weights; this demo does not pretend to infer reliable probabilities from raw video/PPG.
