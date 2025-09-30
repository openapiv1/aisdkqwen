# Quick Start Guide

Get started with the AI Computer Use Agent powered by Qwen 2.5-VL in just a few steps!

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- DashScope API key (for Qwen model)
- E2B API key (for sandbox environment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/openapiv1/aisdkqwen.git
cd aisdkqwen
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
DASHSCOPE_API_KEY=sk-your-dashscope-api-key-here
E2B_API_KEY=e2b_your-e2b-api-key-here
```

#### Getting API Keys

**DashScope API Key:**
1. Visit [DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

**E2B API Key:**
1. Visit [E2B Dashboard](https://e2b.dev/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `e2b_`)

### 4. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## First Steps

### Try These Commands

Once the application is running:

1. **Take a screenshot:**
   ```
   Take a screenshot of the desktop
   ```

2. **Open a browser:**
   ```
   Open Firefox and navigate to google.com
   ```

3. **Create a file:**
   ```
   Create a text file named hello.txt with the content "Hello from AI!"
   ```

4. **Run a command:**
   ```
   List all files in the home directory
   ```

5. **Complex task:**
   ```
   Open VS Code, create a new file called script.py, and write a simple Python script that prints "Hello World"
   ```

## How It Works

1. **User Input:** You type a command or question
2. **AI Processing:** Qwen 2.5-VL analyzes your request
3. **Tool Execution:** The AI decides which tools to use (computer actions or bash commands)
4. **Streaming Response:** You see the AI's thoughts and actions in real-time
5. **Result:** The AI completes the task and reports back

## Key Features

### Computer Control
- **Screenshot:** Capture and analyze the desktop
- **Mouse Actions:** Click, double-click, right-click, drag
- **Keyboard Input:** Type text and press keys
- **Scrolling:** Scroll in any direction

### Bash Commands
Execute any bash command in the secure E2B sandbox:
- File operations
- Package installation
- Script execution
- System information

### Vision Capabilities
Qwen 2.5-VL can see and understand screenshots:
- Identify UI elements
- Read text from images
- Navigate applications visually
- Make decisions based on what it sees

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

### API Key Issues

If you see authentication errors:
1. Verify your API keys are correct
2. Check for extra spaces or newlines
3. Ensure you copied the full key
4. Try regenerating the key

### Sandbox Not Starting

If the E2B sandbox fails to initialize:
1. Check your E2B API key
2. Verify your E2B account has sufficient credits
3. Check [E2B Status Page](https://status.e2b.dev/)

### Model Not Found

If you get a "model not found" error:
1. Verify the model name is exactly: `qwen2.5-vl-7b-instruct`
2. Check your DashScope account has access to this model
3. Try using the DashScope console to test the model directly

## Advanced Usage

### Custom System Prompt

Edit `app/api/chat/route.ts` to customize the AI's behavior by modifying the `SYSTEM_PROMPT` constant.

### Different Model

To use a different Qwen model, edit the model name in `app/api/chat/route.ts`:

```typescript
model: "qwen2.5-vl-7b-instruct", // Change this
```

Available models:
- `qwen2.5-vl-7b-instruct` (default)
- `qwen-vl-plus`
- `qwen-vl-max`

### Adjust Streaming Parameters

Modify these in `app/api/chat/route.ts`:

```typescript
top_p: 0.8,        // Diversity of responses (0-1)
temperature: 0.7,  // Creativity (0-2)
max_tokens: 4096,  // Maximum response length
```

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `DASHSCOPE_API_KEY`
   - `E2B_API_KEY`
5. Deploy!

Or use the one-click deploy button in the README.

## Support

- **Issues:** [GitHub Issues](https://github.com/openapiv1/aisdkqwen/issues)
- **Documentation:** See `MIGRATION_GUIDE.md` for technical details
- **DashScope Docs:** [Qwen VL API Reference](https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-vl-api)
- **E2B Docs:** [E2B Documentation](https://e2b.dev/docs)

## Next Steps

- Explore the `/app/api/chat/route.ts` to understand the streaming implementation
- Check `/lib/e2b/tool.ts` to see how tools are defined
- Customize the UI in `/app/page.tsx`
- Read `MIGRATION_GUIDE.md` for technical deep-dive

Happy coding! 🚀
