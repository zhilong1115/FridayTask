# 🦀 Awesome OpenClaw Skills 全面评测报告
# Comprehensive Review of 2999 Community Skills

> **Source / 来源:** [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
> **Date / 日期:** 2026-02-11
> **Reviewer Profile / 评测视角:** macOS developer, AI/ML enthusiast, RTX 4090 Windows PC, Telegram/GitHub/Gmail user
> **Projects / 项目:** AI trading app, mahjong game, task management app

---

## 🏆 TL;DR — Top 20 必装 Skills / Must-Have Skills

These are the highest-value skills for your specific setup. Install these first.

| # | Skill | Category | Why / 为什么 | Rating |
|---|-------|----------|-------------|--------|
| 1 | **coding-agent** | Coding Agents | Run Codex/Claude Code/OpenCode as sub-agents 多编码代理调度 | ⭐⭐⭐⭐⭐ |
| 2 | **github** | Git & GitHub | Full `gh` CLI integration for GitHub workflows | ⭐⭐⭐⭐⭐ |
| 3 | **comfyui** | Image & Video Gen | Send workflows to ComfyUI → RTX 4090 本地出图 | ⭐⭐⭐⭐⭐ |
| 4 | **brave-search** | Search & Research | Web search + content extraction via Brave API | ⭐⭐⭐⭐⭐ |
| 5 | **apple-notes** | Notes & PKM | Manage Apple Notes via `memo` CLI on macOS | ⭐⭐⭐⭐⭐ |
| 6 | **obsidian** | Notes & PKM | Full Obsidian vault integration for PKM | ⭐⭐⭐⭐⭐ |
| 7 | **tmux** | CLI Utilities | Remote-control tmux sessions 交互式CLI控制 | ⭐⭐⭐⭐⭐ |
| 8 | **homebrew** | Apple Apps | Homebrew package manager integration | ⭐⭐⭐⭐⭐ |
| 9 | **fal-ai** | Image & Video Gen | Generate images/videos via fal.ai (FLUX, SDXL) | ⭐⭐⭐⭐⭐ |
| 10 | **deep-research** | Search & Research | Multi-step autonomous deep research agent | ⭐⭐⭐⭐⭐ |
| 11 | **notion** | Notes & PKM | Notion API for pages, databases, blocks | ⭐⭐⭐⭐⭐ |
| 12 | **ollama-local** | AI & LLMs | Manage local Ollama models 本地模型管理 | ⭐⭐⭐⭐⭐ |
| 13 | **homeassistant** | Smart Home | Control Home Assistant devices 智能家居控制 | ⭐⭐⭐⭐⭐ |
| 14 | **pr-reviewer** | Git & GitHub | Automated PR code review with diff analysis | ⭐⭐⭐⭐⭐ |
| 15 | **peekaboo** | CLI Utilities | Capture & automate macOS UI 屏幕操控 | ⭐⭐⭐⭐⭐ |
| 16 | **ffmpeg-cli** | CLI Utilities | Comprehensive video/audio processing | ⭐⭐⭐⭐⭐ |
| 17 | **peft** | AI & LLMs | LoRA/QLoRA fine-tuning guide → RTX 4090 微调 | ⭐⭐⭐⭐⭐ |
| 18 | **sag** | Clawdbot Tools | ElevenLabs TTS with mac-style `say` | ⭐⭐⭐⭐⭐ |
| 19 | **hackernews** | Search & Research | Browse and search Hacker News | ⭐⭐⭐⭐ |
| 20 | **skill-vetting** | Coding Agents | Vet skills for security before installing 安全审查 | ⭐⭐⭐⭐⭐ |

**安装命令 / Install:**
```bash
npx clawhub@latest install <skill-slug>
```

---

## 📋 Full Category Review / 完整分类评测

Rating criteria / 评分标准:
- ⭐⭐⭐⭐⭐ = Must have, directly relevant to your workflow
- ⭐⭐⭐⭐ = Very useful, recommended
- ⭐⭐⭐ = Situationally useful
- ⭐⭐ = Niche use case
- ⭐ = Low relevance to your profile

---

### 🖥️ Coding Agents & IDEs (133 skills)
> 编码代理与IDE — 核心开发类

**Top Picks / 精选:**

| Skill | Description / 描述 | ⭐ |
|-------|-------------------|-----|
| **coding-agent** | Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent as sub-agents | ⭐⭐⭐⭐⭐ |
| **multi-coding-agent** | Same as above with multi-agent orchestration | ⭐⭐⭐⭐⭐ |
| **cc-godmode** | Self-orchestrating multi-agent dev workflows | ⭐⭐⭐⭐⭐ |
| **claude-team** | Orchestrate multiple Claude Code workers via iTerm2 | ⭐⭐⭐⭐⭐ |
| **skill-vetting** | Vet ClawHub skills for security before install | ⭐⭐⭐⭐⭐ |
| **ec-task-orchestrator** | Autonomous multi-agent task orchestration | ⭐⭐⭐⭐⭐ |
| **debug-pro** | Systematic debugging methodology | ⭐⭐⭐⭐ |
| **test-runner** | Write and run tests across languages/frameworks | ⭐⭐⭐⭐ |
| **tdd-guide** | TDD workflow with test generation, coverage | ⭐⭐⭐⭐ |
| **docker-sandbox** | Docker sandboxed VM environments | ⭐⭐⭐⭐ |
| **docker-essentials** | Essential Docker commands and workflows | ⭐⭐⭐⭐ |
| **ssh-tunnel** | SSH tunneling, port forwarding, remote access | ⭐⭐⭐⭐ |
| **backend-patterns** | Backend architecture patterns, API design | ⭐⭐⭐⭐ |
| **python** | Python coding guidelines and best practices | ⭐⭐⭐⭐ |
| **apple-hig** | Apple HIG for iOS/macOS app design | ⭐⭐⭐⭐ |
| **cursor-agent** | Cursor CLI agent integration | ⭐⭐⭐⭐ |
| **perry-coding-agents** | Dispatch tasks to OpenCode or Claude Code | ⭐⭐⭐⭐ |
| **mcp-builder** | Guide for creating MCP servers | ⭐⭐⭐⭐ |
| **claude-optimised** | Guide for writing optimized CLAUDE.md files | ⭐⭐⭐ |
| **agent-config** | Modify agent core context files | ⭐⭐⭐ |
| **buildlog** | Record AI coding sessions as replayable logs | ⭐⭐⭐ |
| **codex-orchestration** | Orchestration for OpenAI Codex | ⭐⭐⭐ |
| **cognitive-memory** | Multi-store memory system | ⭐⭐⭐ |
| **regex-patterns** | Practical regex patterns across languages | ⭐⭐⭐ |
| **openspec** | Spec-driven development | ⭐⭐⭐ |
| **piv** | Plan-Implement-Validate workflow loop | ⭐⭐⭐ |

**Skip / 可跳过:** achurch, flirtingbots, catholic-grounding, bot-bowl-party, wyld-stallyns, soul-md, clawder (niche/novelty)

---

### 🔀 Git & GitHub (66 skills)
> Git和GitHub工具

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **github** | Full `gh` CLI integration | ⭐⭐⭐⭐⭐ |
| **pr-reviewer** | Automated PR code review with diff analysis | ⭐⭐⭐⭐⭐ |
| **github-pr** | Fetch, preview, merge, test PRs locally | ⭐⭐⭐⭐⭐ |
| **conventional-commits** | Format commits using Conventional Commits | ⭐⭐⭐⭐⭐ |
| **git-workflows** | Advanced git operations | ⭐⭐⭐⭐ |
| **unfuck-my-git-state** | Recover broken Git state 😂 | ⭐⭐⭐⭐ |
| **gitclaw** | Backup OpenClaw workspace to GitHub | ⭐⭐⭐⭐ |
| **deepwiki** | Query DeepWiki for repo documentation | ⭐⭐⭐⭐ |
| **trend-watcher** | Monitor GitHub Trending for emerging tech | ⭐⭐⭐⭐ |
| **work-report** | Generate work reports from git commits | ⭐⭐⭐⭐ |
| **gitflow** | Monitor CI/CD pipeline status | ⭐⭐⭐ |
| **git-summary** | Quick repo summary | ⭐⭐⭐ |
| **danube** | 100+ API tools (Gmail, GitHub, Notion) via MCP | ⭐⭐⭐⭐ |
| **read-github** | Access repo docs via gitmcp.io | ⭐⭐⭐ |
| **commit-analyzer** | Analyze git commit patterns | ⭐⭐⭐ |
| **gitload** | Download files/folders from GitHub URLs | ⭐⭐⭐ |
| **emergency-rescue** | Recover from developer disasters | ⭐⭐⭐ |
| **backup** | Backup openclaw config and skills | ⭐⭐⭐ |

---

### 🌐 Browser & Automation (139 skills)
> 浏览器与自动化

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **Agent Browser** | Fast Rust-based headless browser CLI | ⭐⭐⭐⭐⭐ |
| **playwright-cli** | Browser automation via Playwright | ⭐⭐⭐⭐⭐ |
| **firecrawl-skills** | Web scraping, crawling, search via Firecrawl | ⭐⭐⭐⭐⭐ |
| **mcporter** | List/configure/call MCP servers and tools | ⭐⭐⭐⭐⭐ |
| **n8n-automation** | Manage n8n workflows from OpenClaw | ⭐⭐⭐⭐⭐ |
| **anycrawl** | Web scraping/crawling API integration | ⭐⭐⭐⭐ |
| **browser-use** | Cloud browsers for Clawdbot | ⭐⭐⭐⭐ |
| **home-assistant** | Control Home Assistant from browser skills | ⭐⭐⭐⭐ |
| **clawflows** | Search/install/run multi-skill automations | ⭐⭐⭐⭐ |
| **context-recovery** | Auto-recover working context after restart | ⭐⭐⭐⭐ |
| **automation-workflows** | Design automation workflows | ⭐⭐⭐⭐ |
| **deep-scraper** | High-performance deep web scraping | ⭐⭐⭐⭐ |
| **android-adb** | Control Android devices via ADB | ⭐⭐⭐ |
| **desktop-control** | Mouse/keyboard/screen automation | ⭐⭐⭐ |
| **turix-cua** | Computer Use Agent for macOS | ⭐⭐⭐⭐ |
| **claude-chrome** | Claude Code + Chrome browser extension | ⭐⭐⭐ |
| **organize-tg** | Auto-organize Telegram chats | ⭐⭐⭐⭐ |
| **stagehand-browser-cli** | Web browser interaction automation | ⭐⭐⭐ |

---

### 🎨 Image & Video Generation (60 skills)
> 图像与视频生成 — RTX 4090 重点关注

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **comfyui** | Send workflow to ComfyUI, return images → 你的4090! | ⭐⭐⭐⭐⭐ |
| **comfy-cli** | Install/manage/run ComfyUI instances | ⭐⭐⭐⭐⭐ |
| **fal-ai** | FLUX, SDXL, Whisper via fal.ai API | ⭐⭐⭐⭐⭐ |
| **fal-text-to-image** | Generate/remix/edit images via fal.ai | ⭐⭐⭐⭐⭐ |
| **nvidia-image-gen** | Generate images using NVIDIA FLUX models | ⭐⭐⭐⭐⭐ |
| **ffmpeg-video-editor** | Generate FFmpeg commands from natural language | ⭐⭐⭐⭐⭐ |
| **sora-video-gen** | Generate videos using OpenAI's Sora API | ⭐⭐⭐⭐ |
| **veo** | Generate video using Google Veo 3.x | ⭐⭐⭐⭐ |
| **recraft** | Generate, vectorize, upscale images | ⭐⭐⭐⭐ |
| **runware** | Generate images/videos via Runware API | ⭐⭐⭐⭐ |
| **pollinations** | Free AI generation — text, images, videos | ⭐⭐⭐⭐ |
| **video-frames** | Extract frames/clips from videos via ffmpeg | ⭐⭐⭐⭐ |
| **svg-draw** | Create SVG → PNG without external tools | ⭐⭐⭐⭐ |
| **chart-image** | Publication-quality charts from data | ⭐⭐⭐⭐ |
| **Excalidraw Flowchart** | Create flowcharts from descriptions | ⭐⭐⭐⭐ |
| **coloring-page** | Photo → printable coloring page | ⭐⭐ |
| **venice-ai** | Generate/edit/upscale images + video | ⭐⭐⭐ |
| **krea-api** | Generate via Krea.ai API | ⭐⭐⭐ |
| **narrator** | Live screen narration, 7 styles | ⭐⭐⭐ |
| **image-resize** | Resize images via ImageMagick CLI | ⭐⭐⭐ |
| **figma** | Figma design analysis and export | ⭐⭐⭐ |
| **canva-connect** | Manage Canva designs via API | ⭐⭐⭐ |
| **gamma** | AI presentations via Gamma.app | ⭐⭐⭐ |

---

### 🍎 Apple Apps & Services (35 skills)
> 苹果应用与服务 — macOS 用户重点

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **homebrew** | Homebrew package manager | ⭐⭐⭐⭐⭐ |
| **apple-notes** | Manage Apple Notes via `memo` CLI (missing from this category but in Notes) | ⭐⭐⭐⭐⭐ |
| **shortcuts-generator** | Generate macOS/iOS Shortcuts via plist | ⭐⭐⭐⭐⭐ |
| **apple-contacts** | Lookup contacts from Contacts.app | ⭐⭐⭐⭐ |
| **apple-music** | Search, playlists, playback control | ⭐⭐⭐⭐ |
| **apple-photos** | Photos.app integration | ⭐⭐⭐⭐ |
| **apple-remind-me** | Natural language → Apple Reminders | ⭐⭐⭐⭐ |
| **caffeine** | Prevent screen/system sleep | ⭐⭐⭐⭐ |
| **homekit** | Control Apple HomeKit devices | ⭐⭐⭐⭐ |
| **icloud-findmy** | Find My locations and battery status | ⭐⭐⭐⭐ |
| **mlx-stt** | Speech-to-text on Apple Silicon locally | ⭐⭐⭐⭐⭐ |
| **mlx-swift-lm** | Run LLMs on Apple Silicon via MLX | ⭐⭐⭐⭐⭐ |
| **mac-tts** | TTS using macOS `say` command | ⭐⭐⭐ |
| **mole-mac-cleanup** | Mac cleanup & optimization | ⭐⭐⭐ |
| **get-focus-mode** | Get current macOS Focus mode | ⭐⭐⭐ |
| **drafts** | Manage Drafts app notes via CLI | ⭐⭐⭐ |
| **apple-mail-search** | Fast Apple Mail search via SQLite | ⭐⭐⭐ |
| **fzf-fuzzy-finder** | Fuzzy finder for CLI | ⭐⭐⭐⭐ |
| **skill-email-management** | Apple Mail management | ⭐⭐⭐ |
| **network-scanner** | Network device discovery | ⭐⭐⭐ |
| **voice-wake-say** | Speak responses aloud on macOS | ⭐⭐⭐ |
| **appletv** | Control Apple TV via pyatv | ⭐⭐ |

---

### 🔍 Search & Research (253 skills)
> 搜索与研究 — 最大类别

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **brave-search** | Web search + content extraction via Brave | ⭐⭐⭐⭐⭐ |
| **deep-research** | Multi-step autonomous research agent | ⭐⭐⭐⭐⭐ |
| **academic-deep-research** | Rigorous research with full citations | ⭐⭐⭐⭐⭐ |
| **hackernews** | Browse and search HN | ⭐⭐⭐⭐ |
| **exa** | Neural web search via Exa AI | ⭐⭐⭐⭐⭐ |
| **perplexity** | AI-powered web search via Perplexity API | ⭐⭐⭐⭐⭐ |
| **tavily** | AI-optimized web search | ⭐⭐⭐⭐ |
| **arxiv-watcher** | Search and summarize arXiv papers | ⭐⭐⭐⭐⭐ |
| **agentic-paper-digest** | Summarize recent arXiv/HuggingFace papers | ⭐⭐⭐⭐⭐ |
| **clawdhub** | Search/install/update agent skills | ⭐⭐⭐⭐⭐ |
| **ripgrep** | Blazingly fast text search (rg) | ⭐⭐⭐⭐⭐ |
| **file-search** | Fast file search via `fd` and `rg` | ⭐⭐⭐⭐⭐ |
| **hn-extract** | HN post → clean markdown | ⭐⭐⭐⭐ |
| **google-search** | Google Custom Search Engine | ⭐⭐⭐⭐ |
| **ddg-search** | DuckDuckGo search | ⭐⭐⭐⭐ |
| **kagi-search** | Kagi search API | ⭐⭐⭐⭐ |
| **news-aggregator** | Multi-source news aggregation | ⭐⭐⭐⭐ |
| **daily-ai-news-skill** | Aggregates latest AI news | ⭐⭐⭐⭐ |
| **zotero** | Manage Zotero reference libraries | ⭐⭐⭐⭐ |
| **serpapi** | Search across Google, Amazon, Yelp, etc. | ⭐⭐⭐⭐ |
| **jina-reader** | Web content extraction via Jina AI | ⭐⭐⭐⭐ |
| **npm-search** | Search npm packages | ⭐⭐⭐ |
| **last30days** | Research topic from last 30 days on Reddit/X | ⭐⭐⭐ |
| **youtube-full** | Complete YouTube toolkit — transcripts, search | ⭐⭐⭐⭐ |
| **gemini-yt-transcript** | YouTube transcripts via Gemini | ⭐⭐⭐⭐ |
| **transcript** | YouTube video transcripts | ⭐⭐⭐⭐ |
| **youtube-summarizer** | Auto YouTube transcript + summary | ⭐⭐⭐⭐ |
| **startups** | Research startups, funding, hiring trends | ⭐⭐⭐ |
| **tg** | Telegram CLI for reading/searching | ⭐⭐⭐⭐ |
| **lightrag** | Search/manage knowledge bases via LightRAG | ⭐⭐⭐ |
| **finnhub** | Real-time stock quotes, market data → trading app | ⭐⭐⭐⭐ |
| **x-search** | Real-time X/Twitter search | ⭐⭐⭐ |
| **relay-for-telegram** | Telegram integration for agents | ⭐⭐⭐⭐ |

**Note:** ~50+ skills are duplicates/clones of research/search functionality. Stick with brave-search + perplexity + exa for web, and arxiv-watcher + agentic-paper-digest for papers.

---

### 🤖 AI & LLMs (287 skills)
> AI与大模型 — 最大类别

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **ollama-local** | Manage local Ollama models | ⭐⭐⭐⭐⭐ |
| **peft** | LoRA/QLoRA fine-tuning → use on RTX 4090 | ⭐⭐⭐⭐⭐ |
| **gemini** | Gemini CLI for Q&A, summaries | ⭐⭐⭐⭐⭐ |
| **gemini-deep-research** | Complex research via Gemini | ⭐⭐⭐⭐⭐ |
| **research** | Deep research via Gemini CLI as sub-agent | ⭐⭐⭐⭐⭐ |
| **inference-sh** | Run 150+ AI apps via inference.sh CLI | ⭐⭐⭐⭐⭐ |
| **openai-image-gen** | Batch-generate images via OpenAI API | ⭐⭐⭐⭐ |
| **openai-tts** | Text-to-speech via OpenAI API | ⭐⭐⭐⭐ |
| **llmrouter** | Intelligent LLM proxy routing | ⭐⭐⭐⭐ |
| **lmstudio-subagents** | Reduce paid provider token usage | ⭐⭐⭐⭐⭐ |
| **model-router** | Automatic AI model routing | ⭐⭐⭐⭐ |
| **llm-supervisor** | Rate limit handling + Ollama fallback | ⭐⭐⭐⭐ |
| **agent-orchestration** | Spawn and manage sub-agents | ⭐⭐⭐⭐ |
| **prompt-engineering-expert** | Advanced prompt optimization | ⭐⭐⭐⭐ |
| **computer-vision-expert** | SOTA CV expert (2026) | ⭐⭐⭐⭐ |
| **adversarial-prompting** | Critique and fix prompts | ⭐⭐⭐ |
| **agent-memory** | Persistent memory for agents | ⭐⭐⭐ |
| **context-optimizer** | Context management with auto-compaction | ⭐⭐⭐⭐ |
| **knowledge-base** | Personal KB with SQLite + FTS5 | ⭐⭐⭐⭐ |
| **jasper-recall** | Local RAG with ChromaDB | ⭐⭐⭐⭐ |
| **clean-code** | Pragmatic coding standards | ⭐⭐⭐ |
| **causal-inference** | Add causal reasoning to actions | ⭐⭐⭐ |
| **hokipoki** | Switch AI models without tab switching | ⭐⭐⭐ |
| **nano-banana-pro** | Generate/edit images inline | ⭐⭐⭐ |
| **email-prompt-injection-defense** | Detect/block prompt injection | ⭐⭐⭐⭐ |
| **mcp-microsoft365** | Full Microsoft 365 integration via MCP | ⭐⭐⭐ |

**Note:** This category is extremely noisy. ~100+ are social networks for bots (moltter, clawtter, instaclaw, etc.) or novelty. Focus on the tools above.

---

### 📝 Notes & PKM (100 skills)
> 笔记与个人知识管理

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **apple-notes** | Manage Apple Notes via `memo` CLI | ⭐⭐⭐⭐⭐ |
| **obsidian** | Full Obsidian vault automation | ⭐⭐⭐⭐⭐ |
| **notion** | Notion API integration | ⭐⭐⭐⭐⭐ |
| **bear-notes** | Bear notes via grizzly CLI | ⭐⭐⭐⭐ |
| **readwise** | Readwise highlights + Reader articles | ⭐⭐⭐⭐ |
| **zettelkasten** | Zettelkasten note system with AI | ⭐⭐⭐⭐ |
| **para-pkm** | PARA-based PKM management | ⭐⭐⭐⭐ |
| **anki-connect** | Anki flashcard deck management | ⭐⭐⭐⭐ |
| **raindrop** | Raindrop.io bookmark management | ⭐⭐⭐⭐ |
| **blogwatcher** | Monitor blogs/RSS for updates | ⭐⭐⭐⭐ |
| **apple-mail** | Apple Mail.app integration | ⭐⭐⭐⭐ |
| **Notebook** | Local-first PKB for ideas/projects | ⭐⭐⭐ |
| **gdocs-markdown** | Create Google Docs from Markdown | ⭐⭐⭐ |
| **instapaper** | Instapaper CLI integration | ⭐⭐⭐ |
| **cubox** | Save web pages to Cubox | ⭐⭐⭐ |
| **linkding** | Manage bookmarks with Linkding | ⭐⭐⭐ |
| **craft** | Manage Craft notes/documents | ⭐⭐⭐ |
| **miniflux** | Browse/manage Miniflux RSS articles | ⭐⭐⭐ |
| **hn-digest** | HN front-page digest on demand | ⭐⭐⭐ |
| **newsletter-digest** | Summarize newsletters, extract insights | ⭐⭐⭐ |
| **memory-curator** | Distill daily logs into compact digests | ⭐⭐⭐ |
| **calctl** | Manage Apple Calendar via icalBuddy | ⭐⭐⭐⭐ |
| **smart-memory** | Context-aware memory with dual retrieval | ⭐⭐⭐ |
| **gkeep** | Google Keep notes integration | ⭐⭐⭐ |

---

### 🏠 Smart Home & IoT (56 skills)
> 智能家居与物联网

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **homeassistant** | Control Home Assistant — plugs, lights, scenes | ⭐⭐⭐⭐⭐ |
| **homekit** | Control Apple HomeKit devices (in Apple category) | ⭐⭐⭐⭐ |
| **openhue** | Control Philips Hue lights/scenes | ⭐⭐⭐⭐ |
| **homebridge** | Control devices via Homebridge | ⭐⭐⭐⭐ |
| **homey** | Athom Homey smart home control | ⭐⭐⭐ |
| **frigate** | Frigate NVR camera access | ⭐⭐⭐⭐ |
| **camera-watch** | YOLOv8 camera surveillance | ⭐⭐⭐⭐ |
| **google-home** | Control Google Nest devices | ⭐⭐⭐ |
| **weather** | Weather forecasts (no API key) | ⭐⭐⭐⭐ |
| **govee-lights** | Control Govee smart lights | ⭐⭐⭐ |
| **nanoleaf** | Control Nanoleaf panels | ⭐⭐⭐ |
| **mqtt-client** | Connect to MQTT broker | ⭐⭐⭐ |
| **eightctl** | Control Eight Sleep pods | ⭐⭐⭐ |
| **starlink** | Starlink dish status/speed test | ⭐⭐⭐ |
| **dirigera-control** | IKEA Dirigera smart home | ⭐⭐⭐ |
| **bambu-cli** | BambuLab 3D printer control | ⭐⭐⭐ |
| **robo-rock** | Roborock vacuum control | ⭐⭐⭐ |
| **printer** | Manage printers via CUPS on macOS | ⭐⭐⭐ |
| **wled** | Control WLED LED controllers | ⭐⭐ |
| **lg-thinq** | LG smart appliance control | ⭐⭐ |
| **mijia** | Xiaomi smart home devices | ⭐⭐ |
| **little-snitch** | Little Snitch firewall control | ⭐⭐⭐ |
| **dyson-cli** | Dyson air purifiers/fans control | ⭐⭐ |

---

### ⌨️ CLI Utilities (131 skills)
> 命令行工具

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **tmux** | Remote-control tmux sessions | ⭐⭐⭐⭐⭐ |
| **peekaboo** | Capture/automate macOS UI | ⭐⭐⭐⭐⭐ |
| **ffmpeg-cli** | Comprehensive video/audio processing | ⭐⭐⭐⭐⭐ |
| **sag** | ElevenLabs TTS mac-style | ⭐⭐⭐⭐⭐ |
| **mactop** | Real-time Apple Silicon metrics | ⭐⭐⭐⭐⭐ |
| **raycast** | Build Raycast extensions | ⭐⭐⭐⭐ |
| **create-cli** | Design CLI arguments/flags/subcommands | ⭐⭐⭐⭐ |
| **curl-http** | Essential curl for API testing | ⭐⭐⭐⭐ |
| **fd-find** | Fast alternative to `find` | ⭐⭐⭐⭐ |
| **jq-json-processor** | JSON processing/filtering with jq | ⭐⭐⭐⭐ |
| **gifgrep** | Search GIF providers via CLI | ⭐⭐⭐ |
| **songsee** | Audio spectrograms/visualizations | ⭐⭐⭐ |
| **clip-it** | Advanced audio/video processing | ⭐⭐⭐⭐ |
| **process-watch** | Monitor system processes | ⭐⭐⭐ |
| **shell-scripting** | Write robust shell scripts | ⭐⭐⭐ |
| **virustotal** | Scan files/URLs with VirusTotal | ⭐⭐⭐⭐ |
| **openapi2cli** | Generate CLI from OpenAPI specs | ⭐⭐⭐ |
| **tldr** | Simplified man pages | ⭐⭐⭐ |
| **gcalcli** | Google Calendar via CLI | ⭐⭐⭐⭐ |
| **ez-google** | Gmail + Google Calendar automation | ⭐⭐⭐⭐ |
| **pdf** | PDF manipulation toolkit | ⭐⭐⭐⭐ |
| **native-app-performance** | macOS/iOS app profiling | ⭐⭐⭐⭐ |
| **goplaces** | Google Places API queries | ⭐⭐⭐ |
| **mcp-adapter** | Use MCP servers for external tools | ⭐⭐⭐⭐ |
| **notebooklm-cli** | Google NotebookLM CLI | ⭐⭐⭐ |
| **rescuetime** | Fetch productivity data | ⭐⭐⭐ |

---

### 🛠️ Clawdbot Tools (121 skills)
> OpenClaw 内部工具

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **sag** | ElevenLabs TTS | ⭐⭐⭐⭐⭐ |
| **agent-builder** | Build high-performing OpenClaw agents | ⭐⭐⭐⭐ |
| **startclaw-optimizer** | Comprehensive OpenClaw optimizer | ⭐⭐⭐⭐ |
| **restart-guard** | Safely restart Gateway with context preservation | ⭐⭐⭐⭐ |
| **ops-framework** | 0-token jobs + monitoring framework | ⭐⭐⭐⭐ |
| **error-guard** | Prevent agent deadlocks | ⭐⭐⭐⭐ |
| **birthday-reminder** | Natural language birthday management | ⭐⭐⭐ |
| **adhd-assistant** | ADHD-friendly life management | ⭐⭐ |

---

### 📱 iOS & macOS Development (17 skills)
> iOS与macOS开发

| Skill | Description | ⭐ |
|-------|------------|-----|
| **apple-docs** | Query Apple Dev Docs + WWDC videos | ⭐⭐⭐⭐⭐ |
| **instruments-profiling** | Profile native macOS/iOS apps | ⭐⭐⭐⭐⭐ |
| **ios-simulator** | Automate iOS Simulator workflows | ⭐⭐⭐⭐ |
| **macos-spm-app-packaging** | Build SwiftPM-based macOS apps | ⭐⭐⭐⭐ |
| **swift-testing** | Swift testing best practices | ⭐⭐⭐⭐ |
| **app-store-optimization** | ASO toolkit | ⭐⭐⭐ |
| **PagerKit** | SwiftUI paging library guide | ⭐⭐ |

---

### 📊 Productivity & Tasks (135 skills)
> 生产力与任务管理

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **linear** | Linear issue tracker integration | ⭐⭐⭐⭐⭐ |
| **todoist** | Todoist task management | ⭐⭐⭐⭐ |
| **things** | Things 3 task manager (macOS) | ⭐⭐⭐⭐ |
| **google-tasks** | Google Tasks management | ⭐⭐⭐⭐ |
| **jira** | Jira issue management | ⭐⭐⭐⭐ |
| **asana** | Asana project management | ⭐⭐⭐ |
| **trello** | Trello board management | ⭐⭐⭐ |

---

### 🗣️ Speech & Transcription (66 skills)
> 语音与转录

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **mlx-stt** | Apple Silicon local STT | ⭐⭐⭐⭐⭐ |
| **openai-tts** | OpenAI text-to-speech | ⭐⭐⭐⭐ |
| **voice-reply** | Local TTS via Piper/sherpa-onnx | ⭐⭐⭐⭐ |
| **gemini-stt** | Transcribe via Gemini API | ⭐⭐⭐⭐ |
| **openrouter-transcribe** | Transcribe via OpenRouter | ⭐⭐⭐ |
| **groq-orpheus-tts** | Fast Arabic + English voices | ⭐⭐⭐ |

---

### 📅 Calendar & Scheduling (51 skills)
> 日历与日程

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **gcalcli** | Google Calendar CLI | ⭐⭐⭐⭐ |
| **calctl** | Apple Calendar via icalBuddy | ⭐⭐⭐⭐ |
| **google-calendar** | Google Calendar API | ⭐⭐⭐⭐ |

---

### 📄 PDF & Documents (67 skills)
> PDF与文档处理

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **pdf** | Comprehensive PDF toolkit | ⭐⭐⭐⭐ |
| **pandic-office** | Markdown → PDF via pandoc | ⭐⭐⭐⭐ |
| **deepread-ocr** | AI-native OCR platform | ⭐⭐⭐⭐ |

---

### 🔒 Security & Passwords (63 skills)
> 安全与密码

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **skill-vetting** | Security-first skill vetting | ⭐⭐⭐⭐⭐ |
| **virustotal** | Scan files/URLs | ⭐⭐⭐⭐ |
| **skillscanner** | Security scanner from Gen Digital | ⭐⭐⭐⭐ |
| **email-prompt-injection-defense** | Block prompt injection | ⭐⭐⭐⭐ |
| **input-guard** | Scan untrusted external text | ⭐⭐⭐⭐ |

---

### 🎮 Gaming (62 skills)
> 游戏 — 你的麻将游戏相关

| Skill | Description | ⭐ |
|-------|------------|-----|
| **game-cog** | Sprite generation tools | ⭐⭐⭐ |
| **chess** | Chess for AI agents | ⭐⭐ |
| **dnd** | D&D 5e toolkit | ⭐⭐ |

---

### 💬 Communication (133 skills)
> 通讯

**Top Picks:**

| Skill | Description | ⭐ |
|-------|------------|-----|
| **telegram** (various) | Telegram integration skills | ⭐⭐⭐⭐⭐ |
| **gmail** (various) | Gmail integration | ⭐⭐⭐⭐ |
| **slack** (various) | Slack integration | ⭐⭐⭐ |
| **discord** (various) | Discord integration | ⭐⭐⭐ |

---

### 📦 Categories with Lower Relevance / 低相关类别

| Category | Skills | Notes |
|----------|--------|-------|
| **Marketing & Sales** (145) | 大量SEO/CRM/Lead Gen工具 | Skip unless doing marketing. **growth-marketer** ⭐⭐⭐ if needed |
| **Transportation** (73) | 航班、火车、出行 | **skiplagged-flights** ⭐⭐⭐ for travel |
| **Shopping** (51) | 购物比价 | **amazon-teneo** ⭐⭐ for research |
| **Health & Fitness** (55) | 健康追踪 | **ouracli** ⭐⭐⭐ if you have Oura Ring |
| **Personal Development** (56) | 自我提升 | Mostly motivational, skip |
| **Finance** (22) | 财务计算 | **financial-calculator** ⭐⭐⭐ |
| **Data & Analytics** (46) | 数据分析 | **add-analytics** ⭐⭐⭐ for GA4 |
| **Media & Streaming** (80) | 媒体播放 | **spotify** ⭐⭐⭐ skills if you use Spotify |
| **Self-Hosted** (25) | 自托管 | **n8n-automation** already covered above |
| **Moltbook** (51) | AI社交网络 | Novel but niche. Skip. |
| **Agent-to-Agent** (19) | Agent协议 | Early-stage, skip for now |
| **Web & Frontend Dev** (201) | 前端开发 | Too many to list; **api-dev** ⭐⭐⭐⭐, **anthropic-frontend-design** ⭐⭐⭐⭐ |
| **DevOps & Cloud** (212) | DevOps | **terraform/k8s** skills ⭐⭐⭐ if you deploy to cloud |

---

## 📊 Statistics / 统计

| Category | Total | 5⭐ | 4⭐ | 3⭐ |
|----------|-------|-----|-----|-----|
| Coding Agents & IDEs | 133 | 6 | 10 | 10 |
| Git & GitHub | 66 | 4 | 8 | 6 |
| Browser & Automation | 139 | 5 | 8 | 5 |
| Image & Video Gen | 60 | 6 | 8 | 8 |
| Apple Apps | 35 | 4 | 7 | 8 |
| Search & Research | 253 | 8 | 12 | 8 |
| AI & LLMs | 287 | 7 | 10 | 8 |
| Notes & PKM | 100 | 3 | 8 | 12 |
| Smart Home & IoT | 56 | 1 | 4 | 10 |
| CLI Utilities | 131 | 6 | 10 | 8 |
| **Total Reviewed** | **2999** | **~50** | **~95** | **~83** |

---

## ⚠️ Safety Notes / 安全提醒

1. **Always vet skills before installing** — use `skill-vetting` or `skillscanner`
2. **Check VirusTotal reports** on ClawHub before installing
3. **Many skills are from unknown authors** — review source code
4. **~396 malicious skills were already filtered** from the original 5,705, but some may have slipped through
5. **Crypto/blockchain skills (672) were excluded** from this list

---

## 🚀 Quick Start Installation / 快速安装

```bash
# Essential toolkit 基础工具包
npx clawhub@latest install coding-agent
npx clawhub@latest install github
npx clawhub@latest install brave-search
npx clawhub@latest install tmux
npx clawhub@latest install apple-notes
npx clawhub@latest install obsidian
npx clawhub@latest install comfyui
npx clawhub@latest install fal-ai
npx clawhub@latest install skill-vetting
npx clawhub@latest install peekaboo

# AI/ML toolkit AI工具包
npx clawhub@latest install ollama-local
npx clawhub@latest install peft
npx clawhub@latest install deep-research
npx clawhub@latest install arxiv-watcher

# macOS toolkit macOS工具包
npx clawhub@latest install homebrew
npx clawhub@latest install mlx-stt
npx clawhub@latest install shortcuts-generator
npx clawhub@latest install sag
```

---

*Generated by Friday 🤖 on 2026-02-11. Review and pick which ones to install!*
