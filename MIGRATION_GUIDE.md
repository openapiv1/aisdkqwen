# Migration Guide: Anthropic Claude to Qwen 2.5-VL

This document outlines the migration from Anthropic Claude to Qwen 2.5-VL via DashScope's OpenAI-compatible API.

## Overview

This project has been migrated to use Qwen 2.5-VL-7B-Instruct model via Alibaba Cloud's DashScope service, which provides an OpenAI-compatible API endpoint.

## Key Changes

### 1. Dependencies

**Removed:**
- `@ai-sdk/anthropic` (version 1.1.15)

**Added:**
- `openai` (version 4.73.0)

### 2. API Configuration

**Previous (Anthropic):**
```typescript
import { anthropic } from "@ai-sdk/anthropic";

const result = streamText({
  model: anthropic("claude-3-7-sonnet-20250219"),
  // ...
});
```

**Current (Qwen via DashScope):**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

const completion = await openai.chat.completions.create({
  model: "qwen3-vl-235b-a22b-instruct",
  // ...
});
```

### 3. Tool Definitions

Tools have been converted from Anthropic's format to OpenAI's function calling format.

**Computer Tool:**
- Supports actions: screenshot, wait, left_click, double_click, right_click, mouse_move, type, key, scroll, left_click_drag
- Screen resolution: 1024x768

**Bash Tool:**
- Executes bash commands in the E2B sandbox
- Returns stdout or error messages

### 4. Streaming Implementation

The new implementation uses OpenAI's streaming API with proper tool execution:

```typescript
const completion = await openai.chat.completions.create({
  model: "qwen3-vl-235b-a22b-instruct",
  messages: conversationMessages,
  tools: [computerToolDefinition, bashToolDefinition],
  tool_choice: "auto",
  stream: true,
  top_p: 0.8,
  temperature: 0.7,
  max_tokens: 4096
});
```

Features:
- Real-time streaming of AI responses
- Automatic tool call detection and execution
- Screenshot capabilities with vision processing
- Continuous conversation flow with tool results

### 5. Environment Variables

**Previous:**
- `ANTHROPIC_API_KEY`

**Current:**
- `DASHSCOPE_API_KEY`

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Get DashScope API key from: https://dashscope.console.aliyun.com/
- Get E2B API key from: https://e2b.dev/

### 6. System Prompt

The system prompt has been enhanced with Polish language instructions (as per requirements) to ensure:
- Proactive communication before actions
- Step-by-step explanation of tasks
- Transparent operation
- Proper terminal command execution (always pressing Enter after typing)

## Technical Implementation Details

### Message Conversion

The chat route converts UI messages to OpenAI format:
1. System message with instructions
2. User and assistant messages with proper role mapping
3. Tool calls and tool results in OpenAI format
4. Vision messages with base64-encoded screenshots

### Tool Execution Flow

1. AI streams response with optional tool calls
2. Tool calls are collected during streaming
3. When streaming completes with `finish_reason: "tool_calls"`:
   - Execute all tool calls sequentially
   - Send tool results back to AI
   - Take new screenshot after actions
   - Continue conversation loop

### Screenshot Handling

Screenshots are:
1. Captured from E2B desktop sandbox
2. Converted to base64
3. Sent as image_url in messages
4. Analyzed by Qwen's vision capabilities

## Testing

To verify the migration:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run linter:
   ```bash
   npm run lint
   ```

3. Check TypeScript:
   ```bash
   npx tsc --noEmit
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Test the chat interface with various commands:
   - "Take a screenshot"
   - "Open Firefox and go to google.com"
   - "Create a file named test.txt with content 'Hello World'"

## Troubleshooting

### Issue: API Key not working
- Verify your DashScope API key is correct
- Check that you're using the international endpoint (dashscope-intl.aliyuncs.com)

### Issue: E2B sandbox not starting
- Verify your E2B API key is correct
- Check E2B service status at https://e2b.dev/

### Issue: Model not responding
- Verify the model name is exactly: `qwen3-vl-235b-a22b-instruct`
- Check DashScope account has access to this model

### Issue: Tools not executing
- Check browser console for errors
- Verify tool definitions match OpenAI function calling schema
- Ensure E2B sandbox is properly initialized

## Benefits of Migration

1. **OpenAI-Compatible API**: Easy to switch between different providers
2. **Vision Capabilities**: Qwen 2.5-VL includes vision support for screenshot analysis
3. **Streaming Support**: Real-time response streaming with tool execution
4. **Cost Efficiency**: Potentially more cost-effective than Anthropic
5. **Multilingual Support**: Better support for Polish language (as required)

## References

- [DashScope Documentation](https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-vl-api)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [E2B Desktop Documentation](https://e2b.dev/docs)
